import env from './env';
import {isPromise} from './sprite';
import {
  Action,
  ActionHandler,
  ActionHandlerList,
  ActionTypes,
  coreConfig,
  errorAction,
  MetaData,
  IStore,
  BStore,
  BStoreOptions,
  IModuleHandlers,
  Dispatch,
  GetState,
  State,
} from './basic';
import {loadModel} from './inject';

const errorProcessed = '__eluxProcessed__';
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

export type IStoreMiddleware = (api: {getState: GetState; dispatch: Dispatch}) => (next: Dispatch) => (action: Action) => void | Promise<void>;

function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args: any[]) => a(b(...args)));
}

export function enhanceStore<S extends State = any>(baseStore: BStore, middlewares?: IStoreMiddleware[]): IStore<S> {
  const store: IStore<S> = baseStore as any;
  const _getState = baseStore.getState;
  const getState: GetState<S> = (moduleName?: string) => {
    const state = _getState();
    return moduleName ? state[moduleName] : state;
  };
  store.getState = getState;
  const injectedModules: {[moduleName: string]: IModuleHandlers} = {};
  store.injectedModules = injectedModules;
  const currentData: {actionName: string; prevState: any} = {actionName: '', prevState: {}};
  const update = baseStore.update;
  store.getCurrentActionName = () => currentData.actionName;
  store.getCurrentState = (moduleName?: string) => {
    const state = currentData.prevState;
    return moduleName ? state[moduleName] : state;
  };
  let dispatch = (action: Action) => {
    throw new Error('Dispatching while constructing your middleware is not allowed. ');
  };
  const middlewareAPI = {
    getState,
    dispatch: (action: Action) => dispatch(action),
  };
  const preMiddleware: IStoreMiddleware = () => (next) => (action) => {
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
      if (!injectedModules[moduleName]) {
        const result: void | Promise<void> = loadModel(moduleName, store);
        if (isPromise(result)) {
          return result.then(() => next(action));
        }
      }
    }
    return next(action);
  };
  function applyEffect(moduleName: string, handler: ActionHandler, modelInstance: IModuleHandlers, action: Action, actionData: any[]) {
    const effectResult: Promise<any> = handler.apply(modelInstance, actionData);
    const decorators = handler.__decorators__;
    if (decorators) {
      const results: any[] = [];
      decorators.forEach((decorator, index) => {
        results[index] = decorator[0](action, moduleName, effectResult);
      });
      handler.__decoratorResults__ = results;
    }
    return effectResult.then(
      (reslove: any) => {
        if (decorators) {
          const results = handler.__decoratorResults__ || [];
          decorators.forEach((decorator, index) => {
            if (decorator[1]) {
              decorator[1]('Resolved', results[index], reslove);
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
              decorator[1]('Rejected', results[index], error);
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
  function respondHandler(action: Action, isReducer: boolean, prevData: {actionName: string; prevState: S}): void | Promise<void> {
    const handlersMap = isReducer ? MetaData.reducersMap : MetaData.effectsMap;
    const actionName = action.type;
    const [actionModuleName] = actionName.split(coreConfig.NSP);
    const commonHandlers = handlersMap[action.type];
    const universalActionType = actionName.replace(new RegExp(`[^${coreConfig.NSP}]+`), '*');
    const universalHandlers = handlersMap[universalActionType];
    const handlers: ActionHandlerList = {...commonHandlers, ...universalHandlers};
    const handlerModuleNames = Object.keys(handlers);
    if (handlerModuleNames.length > 0) {
      const orderList: string[] = [];
      handlerModuleNames.forEach((moduleName) => {
        if (moduleName === MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });
      if (action.priority) {
        orderList.unshift(...action.priority);
      }
      const implemented: {[key: string]: boolean} = {};
      const actionData = getActionData(action);
      if (isReducer) {
        Object.assign(currentData, prevData);
        const newState = {};
        orderList.forEach((moduleName) => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = injectedModules[moduleName];
            const result = handler.apply(modelInstance, actionData);
            if (result) {
              newState[moduleName] = result;
            }
          }
        });
        update(actionName, newState as S, actionData);
      } else {
        const result: Promise<any>[] = [];
        orderList.forEach((moduleName) => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = injectedModules[moduleName];
            Object.assign(currentData, prevData);
            result.push(applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        return result.length === 1 ? result[0] : Promise.all(result);
      }
    }
    return undefined;
  }
  function _dispatch(action: Action): void | Promise<void> {
    const prevData = {actionName: action.type, prevState: getState()};
    respondHandler(action, true, prevData);
    return respondHandler(action, false, prevData);
  }
  const arr = middlewares ? [preMiddleware, ...middlewares] : [preMiddleware];
  const chain = arr.map((middleware) => middleware(middlewareAPI));
  dispatch = compose(...chain)(_dispatch);
  store.dispatch = dispatch;
  return store;
}

export interface StoreBuilder<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore> {
  storeOptions: O;
  storeCreator: (options: O) => B;
}
