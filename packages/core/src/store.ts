import env from './env';
import {isPromise, compose} from './utils';
import {createRedux} from './redux';
import {devLogger} from './devtools';
import {
  MetaData,
  coreConfig,
  StoreMiddleware,
  RouteState,
  CoreRouter,
  StoreLogger,
  EStore,
  Action,
  ActionHandler,
  CommonModel,
  RootState,
} from './basic';
import {ActionTypes, moduleRouteChangeAction, errorAction} from './actions';
import {loadModel} from './inject';

export const routeMiddleware: StoreMiddleware =
  ({dispatch, getStore}) =>
  (next) =>
  (action) => {
    if (action.type === `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`) {
      const existsModules = Object.keys(getStore().getState()).reduce((obj, moduleName) => {
        obj[moduleName] = true;
        return obj;
      }, {});
      const result = next(action);
      const [routeState] = action.payload as [RouteState];
      Object.keys(routeState.params).forEach((moduleName) => {
        const moduleState = routeState.params[moduleName];
        if (moduleState && Object.keys(moduleState).length > 0) {
          if (existsModules[moduleName]) {
            dispatch(moduleRouteChangeAction(moduleName, moduleState, routeState.action));
          }
        }
      });
      return result;
    } else {
      return next(action);
    }
  };

export function forkStore(originalStore: EStore, newRouteState: RouteState): EStore {
  const {
    sid,
    options: {initState, middlewares, logger},
    router,
  } = originalStore;

  return createStore(sid + 1, router, {[coreConfig.RouteModuleName]: newRouteState}, initState, middlewares, logger);
}

const preMiddleware: StoreMiddleware =
  ({getStore}) =>
  (next) =>
  (action) => {
    if (action.type === ActionTypes.Error) {
      const actionData = getActionData(action);
      if (isProcessedError(actionData[0])) {
        return undefined;
      }
      actionData[0] = setProcessedError(actionData[0], true);
    }
    const [moduleName, actionName] = action.type.split(coreConfig.NSP);
    if (env.isServer && actionName === ActionTypes.MLoading) {
      return undefined;
    }
    if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
      const store = getStore() as EStore;
      if (!store.injectedModules[moduleName]) {
        const result: void | Promise<void> = loadModel(moduleName, store);
        if (isPromise(result)) {
          return result.then(() => next(action));
        }
      }
    }
    return next(action);
  };
export function createStore(
  sid: number,
  router: CoreRouter,
  data: RootState,
  initState: (data: RootState) => RootState,
  middlewares?: StoreMiddleware[],
  logger?: StoreLogger
): EStore {
  const redux = createRedux(initState(data));
  const {getState, subscribe, update: _update} = redux;
  const getRouteParams = (moduleName?: string) => {
    const routeState = getState(coreConfig.RouteModuleName) as RouteState;
    return moduleName ? routeState.params[moduleName] : (routeState.params as any);
  };
  const options = {
    initState,
    logger,
    middlewares,
  };
  const loadingGroups = {};
  const injectedModules = {};
  const refData: {currentActionName: string; uncommittedState: RootState; isActive: boolean} = {
    currentActionName: '',
    uncommittedState: {},
    isActive: false,
  };

  const isActive = (): boolean => {
    return refData.isActive;
  };
  const setActive = (status: boolean): void => {
    if (refData.isActive !== status) {
      refData.isActive = status;
    }
  };
  const getCurrentActionName = () => refData.currentActionName;

  // 只有ImmutableData状态才具有事务提交的原子性，MutableData对数据的修改是流式实时的
  const getUncommittedState = (moduleName?: string) => {
    const state = refData.uncommittedState;
    return moduleName ? state[moduleName] : state;
  };

  const destroy = () => {
    Object.keys(injectedModules).forEach((moduleName) => {
      injectedModules[moduleName].destroy();
    });
  };
  const update = (actionName: string, state: RootState) => {
    _update(actionName, state);
    router.latestState = {...router.latestState, ...state};
  };

  let dispatch = (action: Action) => {
    throw new Error('Dispatching while constructing your middleware is not allowed. ');
  };

  function applyEffect(moduleName: string, handler: ActionHandler, modelInstance: CommonModel, action: Action, actionData: any[]) {
    const effectResult: Promise<any> = handler.apply(modelInstance, actionData);
    const decorators = handler.__decorators__;
    if (decorators) {
      const results: any[] = [];
      decorators.forEach((decorator, index) => {
        results[index] = decorator[0].call(modelInstance, action, effectResult);
      });
      handler.__decoratorResults__ = results;
    }
    return effectResult.then(
      (reslove: any) => {
        if (decorators) {
          const results = handler.__decoratorResults__ || [];
          decorators.forEach((decorator, index) => {
            if (decorator[1]) {
              decorator[1].call(modelInstance, 'Resolved', results[index], reslove);
            }
          });
          handler.__decoratorResults__ = undefined;
        }
        return reslove;
      },
      (error: any) => {
        if (decorators) {
          const results = handler.__decoratorResults__ || [];
          decorators.forEach((decorator, index) => {
            if (decorator[1]) {
              decorator[1].call(modelInstance, 'Rejected', results[index], error);
            }
          });
          handler.__decoratorResults__ = undefined;
        }
        if (isProcessedError(error)) {
          throw error;
        } else {
          return dispatch(errorAction(setProcessedError(error, false)));
        }
      }
    );
  }
  function respondHandler(action: Action, isReducer: boolean): void | Promise<void> {
    let logs: [{id: number; isActive: boolean}, string, any[], string[], string[], object, boolean];
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
    if (handlerModuleNames.length > 0) {
      const orderList: string[] = [];
      handlerModuleNames.forEach((moduleName) => {
        if (moduleName === coreConfig.AppModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });
      orderList.unshift(...actionPriority);
      const implemented: {[key: string]: boolean} = {};
      if (isReducer) {
        const prevState = getState();
        const newState: RootState = {};
        const uncommittedState: RootState = {...prevState};
        refData.uncommittedState = uncommittedState;
        orderList.forEach((moduleName) => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = injectedModules[moduleName];
            const result = handler.apply(modelInstance, actionData);
            if (result) {
              newState[moduleName] = result;
              uncommittedState[moduleName] = result;
            }
          }
        });
        logs = [{id: sid, isActive: refData.isActive}, actionName, actionData, actionPriority, orderList, uncommittedState, false];
        //logger前置更符合日志逻辑，store.update可能同步引起ui更新、同步引起另一个action
        devLogger(...logs);
        logger && logger(...logs);
        update(actionName, newState);
      } else {
        logs = [{id: sid, isActive: refData.isActive}, actionName, actionData, actionPriority, orderList, getState(), true];
        devLogger(...logs);
        logger && logger(...logs);
        const result: Promise<any>[] = [];
        orderList.forEach((moduleName) => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = injectedModules[moduleName];
            refData.currentActionName = actionName;
            result.push(applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        const task = result.length === 1 ? result[0] : Promise.all(result);
        return task;
      }
    }
    return undefined;
  }
  function _dispatch(action: Action): void | Promise<void> {
    respondHandler(action, true);
    return respondHandler(action, false);
  }

  const middlewareAPI = {
    getStore: () => store,
    dispatch: (action: Action) => dispatch(action),
  };

  const chain = [preMiddleware, routeMiddleware, ...(middlewares || [])].map((middleware) => middleware(middlewareAPI));
  dispatch = compose(...chain)(_dispatch);

  const store: EStore = {
    sid,
    getState,
    getRouteParams,
    subscribe,
    dispatch,
    router,
    loadingGroups,
    injectedModules,
    destroy,
    getCurrentActionName,
    getUncommittedState,
    update,
    isActive,
    setActive,
    options,
  };

  return store;
}

export const errorProcessed = '__eluxProcessed__';

export function isProcessedError(error: any): boolean {
  return error && !!error[errorProcessed];
}

export function setProcessedError(error: any, processed: boolean): {[errorProcessed]: boolean; [key: string]: any} {
  if (typeof error !== 'object') {
    error = {message: error};
  }
  Object.defineProperty(error, errorProcessed, {value: processed, enumerable: false, writable: true});
  return error;
}

export function getActionData(action: Action): any[] {
  return Array.isArray(action.payload) ? action.payload : [];
}
