import env from './env';
import {compose, isPromise, Listener, promiseCaseCallback, TaskCounter, UNListener} from './utils';
import {actionConfig, getActionData, isErrorAction, isInitAction, loadingAction, setProcessedErrorAction} from './action';
import {Action, AStore, baseConfig, Dispatch, GetState, IModel, IRouter, IStore, mergeState, ModuleState, StoreState} from './basic';
import {devLogger, StoreLogger, StoreLoggerInfo} from './devTools';
/**
 * Store的中间件
 *
 * @remarks
 * 类似于 Redux 的 Middleware
 *
 * @public
 */
export type StoreMiddleware = (api: {getStore: () => IStore; dispatch: Dispatch}) => (next: Dispatch) => (action: Action) => void | Promise<void>;

export const preMiddleware: StoreMiddleware =
  ({getStore}) =>
  (next) =>
  (action) => {
    if (isErrorAction(action)) {
      const processedErrorAction = setProcessedErrorAction(action);
      if (!processedErrorAction) {
        return undefined;
      }
      action = processedErrorAction;
    }
    const [moduleName, actionName] = action.type.split(actionConfig.NSP);
    if (!moduleName || !actionName || !baseConfig.ModuleGetter![moduleName]) {
      return undefined;
    }
    const store = getStore();
    const moduleState = store.getState(moduleName);
    //TODO  && action.type !== getErrorActionType()
    if ((!moduleState || moduleState._error) && !isInitAction(action)) {
      return promiseCaseCallback(store.mount(moduleName, 'update'), () => next(action));
    }
    return next(action);
  };

/**
 * 申明reducer
 *
 * @public
 */
export function reducer(target: any, key: string, descriptor: PropertyDescriptor): any {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }
  const fun = descriptor.value as ActionHandler;
  // fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}

/**
 * 申明effect
 *
 * @example
 * - `@effect('this.searchTableLoading')` 将该 effect 执行状态注入本模块的 `searchTableLoading` 状态中
 *
 * - `@effect()` 等于 `@effect('stage.globalLoading')`
 *
 * - `@effect(null)` 不跟踪其执行状态
 *
 * @param loadingKey - 将该 effect 执行状态作为 {@link LoadingState | LoadingState} 注入指定的 ModuleState 中。
 *
 * @returns
 * 返回ES6装饰器
 *
 * @public
 */
export function effect(loadingKey?: string): Function {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun = descriptor.value as ActionHandler;
    // fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;
    if (!env.isServer) {
      fun.__loadingKey__ = loadingKey;
    }
    return target.descriptor === descriptor ? target : descriptor;
  };
}
export interface ActionHandler {
  // __moduleName__: string;
  // __actionName__: string;
  __isReducer__?: boolean;
  __isEffect__?: boolean;
  // __isHandler__?: boolean;
  __loadingKey__?: string;
  (...args: any[]): unknown;
}

export type ActionHandlersMap = {[actionName: string]: {[moduleName: string]: ActionHandler}};

export class Store extends AStore {
  protected state: StoreState = storeConfig.StoreInitState();
  protected uncommittedState: StoreState = {};
  protected loadingGroups: {[loadingKey: string]: TaskCounter} = {};
  protected listenerId = 0;
  protected listenerMap: {[id: string]: Listener} = {};
  protected currentAction: Action | undefined;
  protected listeners: Listener[] = [];
  //protected currentListeners: Listener[] = [];
  //protected nextListeners: Listener[] = [];
  public dispatch: Dispatch = (action) => {
    throw 'Dispatching action while constructing your middleware is not allowed.';
  };
  public getState = ((moduleName?: string) => {
    return moduleName ? this.state[moduleName] : this.state;
  }) as GetState;

  constructor(sid: number, uid: number, router: IRouter) {
    super(sid, uid, router);
    const middlewareAPI = {
      getStore: () => this,
      dispatch: (action: Action) => this.dispatch(action),
    };
    const _dispatch = (action: Action) => {
      this.respondHandler(action, true);
      return this.respondHandler(action, false);
    };
    const chain = [preMiddleware, ...storeConfig.StoreMiddlewares].map((middleware) => middleware(middlewareAPI));
    this.dispatch = compose(...chain)(_dispatch);
  }
  getUncommittedState(): ModuleState {
    return this.uncommittedState;
  }
  clone(brand?: boolean): Store {
    return new Store(this.sid + 1, brand ? this.uid + 1 : this.uid, this.router);
  }
  getCurrentAction(): Action {
    return this.currentAction!;
  }
  setActive(active: boolean): void {
    if (this._active !== active) {
      this._active = active;
      Object.keys(this.injectedModels).forEach((moduleName) => {
        const model = this.injectedModels[moduleName];
        active ? model.onActive() : model.onInactive();
      });
    }
  }
  destroy(): void {
    this.setActive(false);
    this.dispatch = function () {
      //env.console.warn(`Invalid call 'dispatch()', the store[${this.sid}] is destroyed!`);
    };
    this.mount = function () {
      //env.console.warn(`Invalid call 'mount()', the store[${this.sid}] is destroyed!`);
    };
  }
  setLoading<T extends Promise<any>>(item: T, groupName: string, moduleName?: string): T {
    if (!moduleName) {
      moduleName = actionConfig.StageModuleName;
    }
    const key = moduleName + actionConfig.NSP + groupName;
    const loadings = this.loadingGroups;
    if (!loadings[key]) {
      loadings[key] = new TaskCounter();
      loadings[key].addListener((loadingState) => {
        const action = loadingAction(moduleName!, groupName, loadingState);
        this.dispatch(action);
      });
    }
    loadings[key].addItem(item);
    return item;
  }

  subscribe(listener: Listener): UNListener {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = listener;
    return () => {
      delete listenerMap[id];
    };
  }
  // 如果派发中删除，本轮派发会终止
  update(newState: StoreState): void {
    this.state = mergeState(this.state, newState);
    const listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach((id) => {
      if (listenerMap[id]) {
        listenerMap[id]();
      }
    });
  }
  // protected ensureCanMutateNextListeners(): void {
  //   if (this.nextListeners === this.currentListeners) {
  //     this.nextListeners = this.currentListeners.slice();
  //   }
  // }
  // subscribe(listener: Listener): UNListener {
  //   let isSubscribed = true;
  //   this.ensureCanMutateNextListeners();
  //   this.nextListeners.push(listener);

  //   return () => {
  //     if (!isSubscribed) {
  //       return;
  //     }

  //     isSubscribed = false;

  //     this.ensureCanMutateNextListeners();
  //     const index = this.nextListeners.indexOf(listener);
  //     this.nextListeners.splice(index, 1);
  //     //this.currentListeners = [];
  //   };
  // }
  // protected update(newState: StoreState): void {
  //   this.state = mergeState(this.state, newState);
  //   const listeners = (this.currentListeners = this.nextListeners);
  //   for (let i = 0; i < listeners.length; i++) {
  //     const listener = listeners[i];
  //     listener();
  //   }
  // }
  protected respondHandler(action: Action, isReducer: boolean): void | Promise<void> {
    const handlersMap = isReducer ? storeConfig.ReducersMap : storeConfig.EffectsMap;
    const actionType = action.type;
    const actionPriority = action.priority || [];
    const actionData = getActionData(action);
    const [actionModuleName] = actionType.split(actionConfig.NSP);
    const commonHandlers = handlersMap[action.type];
    const universalActionType = actionType.replace(new RegExp(`[^${actionConfig.NSP}]+`), '*');
    const universalHandlers = handlersMap[universalActionType];
    const handlers = {...commonHandlers, ...universalHandlers};
    const handlerModuleNames = Object.keys(handlers);
    const logs: StoreLoggerInfo = {
      id: this.sid,
      isActive: this.active,
      actionName: actionType,
      payload: actionData,
      priority: actionPriority,
      handers: [],
      state: 'No Change',
      effect: !isReducer,
    };
    const storeLogger = storeConfig.StoreLogger;
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
        const prevState = this.getState();
        const newState: StoreState = {};
        const uncommittedState = (this.uncommittedState = {...prevState});
        orderList.forEach((moduleName) => {
          const model = injectedModels[moduleName] as IModel;
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
        const effectPromises: Promise<any>[] = [];
        orderList.forEach((moduleName) => {
          const model = injectedModels[moduleName] as IModel;
          const handler = handlers[moduleName];
          this.currentAction = action;
          const result = handler.apply(model, actionData);
          const loadingKey = handler.__loadingKey__;
          if (isPromise(result)) {
            if (loadingKey) {
              let [loadingForModuleName, loadingForGroupName] = loadingKey.split('.');
              if (!loadingForGroupName) {
                loadingForModuleName = actionConfig.StageModuleName;
                loadingForGroupName = loadingForModuleName;
              }
              if (loadingForModuleName === 'this') {
                loadingForModuleName = moduleName;
              }
              this.setLoading(result, loadingForGroupName, loadingForModuleName);
            }
            effectPromises.push(result);
          }
        });
        if (effectPromises.length === 0) {
          return;
        }
        return effectPromises.length === 1 ? effectPromises[0] : Promise.all(effectPromises);
      }
    } else {
      if (isReducer) {
        devLogger(logs);
        storeLogger(logs);
      } else if (isErrorAction(action)) {
        //如果没有任何错误处理则抛出
        return Promise.reject(actionData);
      }
    }
  }
}

export const storeConfig: {
  StoreInitState: () => {};
  StoreMiddlewares: StoreMiddleware[];
  StoreLogger: StoreLogger;
  ReducersMap: ActionHandlersMap;
  EffectsMap: ActionHandlersMap;
} = {
  StoreInitState: () => ({}),
  StoreMiddlewares: [],
  StoreLogger: () => undefined,
  ReducersMap: {},
  EffectsMap: {},
};
