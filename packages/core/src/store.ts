import {errorAction, getErrorActionType, getInitActionType, isProcessedError, setProcessedError} from './actions';
import {
  Action,
  ActionHandler,
  CommonModel,
  CommonModelClass,
  CommonModule,
  coreConfig,
  Dispatch,
  IRouter,
  IRouteRecord,
  IStore,
  Location,
  mergeState,
  MetaData,
  ModuleState,
  RouteAction,
  RouteEvent,
  RouterInitOptions,
  RouteRuntime,
  RouteTarget,
  StoreLoggerInfo,
  StoreMiddleware,
  StoreState,
} from './basic';
import {devLogger} from './devtools';
import env from './env';
import {getModule, injectActions} from './inject';
import {compose, isPromise, Listener, promiseCaseCallback, TaskCounter, toPromise, UNListener} from './utils';

export function getActionData(action: Action): any[] {
  return Array.isArray(action.payload) ? action.payload : [];
}

export const preMiddleware: StoreMiddleware =
  ({getStore}) =>
  (next) =>
  (action) => {
    if (action.type === getErrorActionType()) {
      const actionData = getActionData(action);
      if (isProcessedError(actionData[0])) {
        return undefined;
      }
      actionData[0] = setProcessedError(actionData[0], true);
    }
    const [moduleName, actionName] = action.type.split(coreConfig.NSP);
    if (!moduleName || !actionName || !coreConfig.ModuleGetter[moduleName]) {
      return undefined;
    }
    const store = getStore();
    const state = store.getState();
    //TODO  && action.type !== getErrorActionType()
    if (!state[moduleName] && action.type !== getInitActionType(moduleName)) {
      return promiseCaseCallback(store.mount(moduleName, 'update'), () => next(action));
    }
    return next(action);
  };

export abstract class CoreRouter implements IRouter {
  declare runtime: RouteRuntime;
  declare location: Location;
  declare initOptions: RouterInitOptions;
  protected listenerId = 0;
  protected readonly listenerMap: {[id: string]: (data: RouteEvent) => void | Promise<void>} = {};
  public action: RouteAction = 'init';
  public routeKey: string = '';

  constructor() {
    if (!MetaData.clientRouter) {
      MetaData.clientRouter = this;
    }
  }
  getHistoryUrls(target?: RouteTarget): string[] {
    throw new Error('Method not implemented.');
  }

  addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }
  dispatch(data: RouteEvent): void | Promise<void> {
    const listenerMap = this.listenerMap;
    const promiseResults: Promise<void>[] = [];
    Object.keys(listenerMap).forEach((id) => {
      const result = listenerMap[id](data);
      if (isPromise(result)) {
        promiseResults.push(result);
      }
    });
    if (promiseResults.length === 0) {
      return undefined;
    } else if (promiseResults.length === 1) {
      return promiseResults[0];
    } else {
      return Promise.all(promiseResults).then(() => undefined);
    }
  }

  abstract init(initOptions: RouterInitOptions, prevState: StoreState): Promise<void>;
  abstract getActivePage(): {url: string; store: IStore};
  abstract getCurrentPages(): {url: string; store: IStore}[];
  abstract getHistoryLength(target?: RouteTarget): number;
  abstract getHistory(target?: RouteTarget): IRouteRecord[];
  abstract findRecordByKey(key: string): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  abstract findRecordByStep(delta: number, rootOnly: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  abstract relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
  abstract push(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
  abstract replace(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
  abstract back(stepOrKey?: string | number, target?: RouteTarget, payload?: any, overflowRedirect?: string): void | Promise<void>;
}

function applyEffect(
  effectResult: Promise<unknown>,
  store: IStore,
  model: CommonModel,
  action: Action,
  dispatch: Dispatch,
  decorators: ActionHandler['__decorators__'] = []
): Promise<any> {
  // const model = this.models[moduleName];
  // const effectResult = toPromise(handler.apply(model, actionData));
  //const decorators = handler.__decorators__ || [];
  const decoratorBeforeResults: any[] = [];
  decorators.forEach((decorator, index) => {
    decoratorBeforeResults[index] = decorator[0].call(model, store, action, effectResult);
  });
  return effectResult.then(
    (reslove) => {
      decorators.forEach((decorator, index) => {
        if (decorator[1]) {
          decorator[1].call(model, 'Resolved', decoratorBeforeResults[index], reslove);
        }
      });
      return reslove;
    },
    (error) => {
      decorators.forEach((decorator, index) => {
        if (decorator[1]) {
          decorator[1].call(model, 'Rejected', decoratorBeforeResults[index], error);
        }
      });
      if (isProcessedError(error)) {
        throw error;
      } else {
        return dispatch(errorAction(setProcessedError(error, false)));
      }
    }
  );
}

export class Store implements IStore {
  private state: StoreState = coreConfig.StoreInitState();
  private injectedModels: {[moduleName: string]: CommonModel} = {};
  private mountedModules: {[moduleName: string]: Promise<void> | true | undefined} = {};
  private currentListeners: Listener[] = [];
  private nextListeners: Listener[] = [];
  private currentAction: Action | undefined;
  private uncommittedState: StoreState = {};

  public active: boolean = false;
  public dispatch: Dispatch = (action: Action) => {
    throw 'Dispatching action while constructing your middleware is not allowed.';
  };
  public loadingGroups: {[moduleNameAndGroupName: string]: TaskCounter} = {};

  constructor(public readonly sid: number, public readonly router: IRouter) {
    const middlewareAPI = {
      getStore: () => this,
      dispatch: (action: Action) => this.dispatch(action),
    };
    const _dispatch = (action: Action) => {
      this.respondHandler(action, true);
      return this.respondHandler(action, false);
    };
    const chain = [preMiddleware, ...coreConfig.StoreMiddlewares].map((middleware) => middleware(middlewareAPI));
    this.dispatch = compose(...chain)(_dispatch);
  }

  clone(): Store {
    return new Store(this.sid + 1, this.router);
  }
  hotReplaceModel(moduleName: string, ModelClass: CommonModelClass): void {
    const orignModel = this.injectedModels[moduleName];
    if (orignModel) {
      const model = new ModelClass(moduleName, this);
      this.injectedModels[moduleName] = model;
      if (this.active) {
        orignModel.onInactive();
        model.onActive();
      }
    }
  }
  getCurrentAction(): Action {
    return this.currentAction!;
  }
  // mount(moduleName: string): void | Promise<void> {
  //   const mountedModels = this.mountedModels;
  //   const models = this.models;
  //   // eslint-disable-next-line no-prototype-builtins
  //   if (!mountedModels.hasOwnProperty(moduleName)) {
  //     mountedModels[moduleName] = toPromise(getModule(moduleName))
  //       .then((module) => {
  //         let model = models[moduleName];
  //         if (!model) {
  //           model = new module.ModelClass(moduleName, this);
  //           models[moduleName] = model;
  //           this.state[moduleName] = model.onInit();
  //           if (this.active) {
  //             model.onActive();
  //           }
  //         }
  //         return model.onMount();
  //       })
  //       .catch((err) => {
  //         delete mountedModels[moduleName];
  //         throw err;
  //       });
  //   }
  //   return mountedModels[moduleName]!;
  // }

  mount(moduleName: string, env: 'init' | 'route' | 'update'): void | Promise<void> {
    if (!coreConfig.ModuleGetter[moduleName]) {
      return;
    }
    const mountedModules = this.mountedModules;
    const injectedModels = this.injectedModels;
    const errorCallback = (err: any) => {
      if (!this.state[moduleName]) {
        delete mountedModules[moduleName];
        delete injectedModels[moduleName];
      }
      throw err;
    };
    const getModuleCallback = (module: CommonModule) => {
      const model = new module.ModelClass(moduleName, this);
      this.injectedModels[moduleName] = model;
      return model.onMount(env);
    };
    if (!mountedModules[moduleName]) {
      let result: void | Promise<void>;
      try {
        const moduleOrPromise = getModule(moduleName);
        result = promiseCaseCallback(moduleOrPromise, getModuleCallback);
      } catch (err) {
        errorCallback(err);
      }
      if (isPromise(result)) {
        mountedModules[moduleName] = result.then(() => {
          mountedModules[moduleName] = true;
        }, errorCallback);
      } else {
        mountedModules[moduleName] = true;
      }
    }
    const result = mountedModules[moduleName];
    return result === true ? undefined : result;
  }
  setActive(): void {
    if (!this.active) {
      this.active = true;
      Object.keys(this.injectedModels).forEach((moduleName) => {
        const model = this.injectedModels[moduleName];
        model.onActive();
      });
    }
  }
  setInactive(): void {
    if (this.active) {
      this.active = false;
      Object.keys(this.injectedModels).forEach((moduleName) => {
        const model = this.injectedModels[moduleName];
        model.onInactive();
      });
    }
  }
  private ensureCanMutateNextListeners(): void {
    if (this.nextListeners === this.currentListeners) {
      this.nextListeners = this.currentListeners.slice();
    }
  }
  destroy(): void {
    this.setInactive();
    this.dispatch = function () {
      //env.console.warn(`Invalid call 'dispatch()', the store[${this.sid}] is destroyed!`);
    };
    this.mount = function () {
      //env.console.warn(`Invalid call 'mount()', the store[${this.sid}] is destroyed!`);
    };
  }
  private update(newState: StoreState): void {
    this.state = mergeState(this.state, newState);
    const listeners = (this.currentListeners = this.nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  getState(): StoreState;
  getState(moduleName: string): ModuleState;
  getState(moduleName?: string): any {
    return moduleName ? this.state[moduleName] : this.state;
  }
  getUncommittedState(): ModuleState {
    return this.uncommittedState;
  }
  subscribe(listener: Listener): UNListener {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }
    let isSubscribed = true;

    this.ensureCanMutateNextListeners();
    this.nextListeners.push(listener);

    return () => {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      this.ensureCanMutateNextListeners();
      const index = this.nextListeners.indexOf(listener);
      this.nextListeners.splice(index, 1);
      this.currentListeners = [];
    };
  }

  private respondHandler(action: Action, isReducer: boolean): void | Promise<void> {
    const handlersMap = isReducer ? MetaData.reducersMap : MetaData.effectsMap;
    const actionName = action.type;
    const actionPriority = action.priority || [];
    const actionData = getActionData(action);
    const [actionModuleName] = actionName.split(coreConfig.NSP);
    const commonHandlers = handlersMap[action.type];
    const universalActionType = actionName.replace(new RegExp(`[^${coreConfig.NSP}]+`), '*');
    const universalHandlers = handlersMap[universalActionType];
    const handlers = {...commonHandlers, ...universalHandlers};
    const handlerModuleNames = Object.keys(handlers);
    const prevState = this.getState();
    const logs: StoreLoggerInfo = {
      id: this.sid,
      isActive: this.active,
      actionName,
      payload: actionData,
      priority: actionPriority,
      handers: [],
      state: 'No Change',
      effect: !isReducer,
    };
    const storeLogger = coreConfig.StoreLogger;
    if (handlerModuleNames.length > 0) {
      let orderList: string[] = [];
      handlerModuleNames.forEach((moduleName) => {
        if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });
      orderList.unshift(...actionPriority);
      const injectedModels = this.injectedModels;
      const implemented: {[key: string]: boolean} = {};
      orderList = orderList.filter((moduleName) => {
        if (implemented[moduleName] || !handlers[moduleName]) {
          return false;
        }
        implemented[moduleName] = true;
        return injectedModels[moduleName];
      });
      logs.handers = orderList;
      if (isReducer) {
        const newState: StoreState = {};
        const uncommittedState = (this.uncommittedState = {...prevState});
        orderList.forEach((moduleName) => {
          const model = injectedModels[moduleName] as CommonModel;
          const handler = handlers[moduleName];
          const result = handler.apply(model, actionData) as ModuleState;
          if (result) {
            newState[moduleName] = result;
            uncommittedState[moduleName] = result;
          }
        });
        logs.state = uncommittedState;
        //logger前置更符合日志逻辑，store.update可能同步引起ui更新、同步引起另一个action
        devLogger(logs);
        storeLogger(logs);
        this.update(newState);
      } else {
        devLogger(logs);
        storeLogger(logs);
        const effectHandlers: Promise<any>[] = [];
        orderList.forEach((moduleName) => {
          const model = injectedModels[moduleName] as CommonModel;
          const handler = handlers[moduleName];
          this.currentAction = action;
          const result = handler.apply(model, actionData);
          effectHandlers.push(applyEffect(toPromise(result), this, model, action, this.dispatch, handler.__decorators__));
        });
        const task = effectHandlers.length === 1 ? effectHandlers[0] : Promise.all(effectHandlers);
        return task;
      }
    } else {
      if (isReducer) {
        devLogger(logs);
        storeLogger(logs);
      } else {
        //如果没有任何错误处理则抛出
        if (actionName === getErrorActionType()) {
          return Promise.reject(actionData);
        }
      }
    }
    return undefined;
  }
}

/**
 * model热更新
 *
 * @remarks
 * 修改了Model时热更新，通常由脚手架自动调用
 *
 * @param moduleName - Model所属模块名称
 * @param ModelClass - 新的Model
 *
 * @public
 */
export function modelHotReplacement(moduleName: string, ModelClass: CommonModelClass): void {
  const moduleCache = MetaData.moduleCaches[moduleName];
  if (moduleCache) {
    promiseCaseCallback(moduleCache, (module) => {
      module.ModelClass = ModelClass;
      const newModel = new ModelClass(moduleName, null as any);
      injectActions(newModel, true);
      const page = MetaData.clientRouter!.getActivePage();
      (page.store as Store).hotReplaceModel(moduleName, ModelClass);
    });
  }
  env.console.log(`[HMR] @Elux Updated model: ${moduleName}`);
}
