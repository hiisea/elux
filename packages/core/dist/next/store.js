import env from './env';
import { promiseCaseCallback, toPromise, compose, isPromise } from './utils';
import { MetaData, coreConfig, mergeState } from './basic';
import { devLogger } from './devtools';
import { getModule, injectActions } from './inject';
import { ActionTypes, errorAction, moduleInitAction, isProcessedError, setProcessedError } from './actions';
import { AppModel } from './module';
export function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}
export const preMiddleware = ({
  getStore
}) => next => action => {
  if (action.type === `${coreConfig.AppModuleName}${coreConfig.NSP}${ActionTypes.Error}`) {
    const actionData = getActionData(action);

    if (isProcessedError(actionData[0])) {
      return undefined;
    }

    actionData[0] = setProcessedError(actionData[0], true);
  }

  const [moduleName, actionName] = action.type.split(coreConfig.NSP);

  if (!moduleName || !actionName || moduleName !== coreConfig.AppModuleName && !coreConfig.ModuleGetter[moduleName]) {
    return undefined;
  }

  if (env.isServer && actionName === ActionTypes.Loading) {
    return undefined;
  }

  const store = getStore();
  const state = store.getState();

  if (!state[moduleName] && actionName !== ActionTypes.Init) {
    return promiseCaseCallback(store.mount(moduleName, false), () => next(action));
  }

  return next(action);
};
export class CoreRouter {
  constructor(location, action, nativeData) {
    this.listenerId = 0;
    this.listenerMap = {};
    this.location = location;
    this.action = action;
    this.nativeData = nativeData;

    if (!MetaData.clientRouter) {
      MetaData.clientRouter = this;
    }
  }

  addListener(callback) {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(data) {
    const listenerMap = this.listenerMap;
    const promiseResults = [];
    Object.keys(listenerMap).forEach(id => {
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

}

function applyEffect(effectResult, store, model, action, dispatch, decorators = []) {
  const decoratorBeforeResults = [];
  decorators.forEach((decorator, index) => {
    decoratorBeforeResults[index] = decorator[0].call(model, store, action, effectResult);
  });
  return effectResult.then(reslove => {
    decorators.forEach((decorator, index) => {
      if (decorator[1]) {
        decorator[1].call(model, 'Resolved', decoratorBeforeResults[index], reslove);
      }
    });
    return reslove;
  }, error => {
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
  });
}

injectActions(new AppModel(null));
export class Store {
  constructor(sid, router) {
    this.state = void 0;
    this.mountedModels = void 0;
    this.currentListeners = [];
    this.nextListeners = [];
    this.active = false;
    this.currentAction = void 0;
    this.uncommittedState = {};

    this.dispatch = action => {
      throw 'Dispatching action while constructing your middleware is not allowed.';
    };

    this.loadingGroups = {};
    this.sid = sid;
    this.router = router;
    const {
      location: routeLocation,
      action: routeAction
    } = router;
    const appState = {
      routeAction,
      routeLocation,
      globalLoading: 'Stop',
      initError: ''
    };
    this.state = mergeState(coreConfig.StoreInitState(), {
      [coreConfig.AppModuleName]: appState
    });
    const appModel = new AppModel(this);
    this.mountedModels = {
      [coreConfig.AppModuleName]: appModel
    };
    const middlewareAPI = {
      getStore: () => this,
      dispatch: action => this.dispatch(action)
    };

    const _dispatch = action => {
      this.respondHandler(action, true);
      return this.respondHandler(action, false);
    };

    const chain = [preMiddleware, ...coreConfig.StoreMiddlewares].map(middleware => middleware(middlewareAPI));
    this.dispatch = compose(...chain)(_dispatch);
  }

  clone() {
    return new Store(this.sid + 1, this.router);
  }

  hotReplaceModel(moduleName, ModelClass) {
    const orignModel = this.mountedModels[moduleName];

    if (orignModel && !isPromise(orignModel)) {
      const model = new ModelClass(moduleName, this);
      this.mountedModels[moduleName] = model;

      if (this.active) {
        orignModel.onInactive();
        model.onActive();
      }
    }
  }

  getCurrentAction() {
    return this.currentAction;
  }

  mountModule(moduleName, routeChanged) {
    const errorCallback = err => {
      delete mountedModels[moduleName];
      throw err;
    };

    const initStateCallback = initState => {
      mountedModels[moduleName] = model;
      this.dispatch(moduleInitAction(moduleName, initState));

      if (this.active) {
        model.onActive();
      }

      return model.onStartup(routeChanged);
    };

    const getModuleCallback = module => {
      model = new module.ModelClass(moduleName, this);
      const initStateOrPromise = model.onInit(routeChanged);

      if (isPromise(initStateOrPromise)) {
        return initStateOrPromise.then(initStateCallback, errorCallback);
      } else {
        return initStateCallback(initStateOrPromise);
      }
    };

    const mountedModels = this.mountedModels;
    const moduleOrPromise = getModule(moduleName);
    let model = null;

    if (isPromise(moduleOrPromise)) {
      return moduleOrPromise.then(getModuleCallback, errorCallback);
    } else {
      const result = getModuleCallback(moduleOrPromise);

      if (isPromise(result)) {
        return result;
      } else {
        return model;
      }
    }
  }

  mount(moduleName, routeChanged) {
    if (!coreConfig.ModuleGetter[moduleName]) {
      return;
    }

    const mountedModels = this.mountedModels;

    if (!mountedModels[moduleName]) {
      mountedModels[moduleName] = this.mountModule(moduleName, routeChanged);
    }

    const result = mountedModels[moduleName];
    return isPromise(result) ? result : undefined;
  }

  setActive() {
    if (!this.active) {
      this.active = true;
      const mountedModels = this.mountedModels;
      Object.keys(mountedModels).forEach(moduleName => {
        const modelOrPromise = mountedModels[moduleName];

        if (modelOrPromise && !isPromise(modelOrPromise)) {
          modelOrPromise.onActive();
        }
      });
    }
  }

  setInactive() {
    if (this.active) {
      this.active = false;
      const mountedModels = this.mountedModels;
      Object.keys(mountedModels).forEach(moduleName => {
        const modelOrPromise = mountedModels[moduleName];

        if (modelOrPromise && !isPromise(modelOrPromise)) {
          modelOrPromise.onInactive();
        }
      });
    }
  }

  ensureCanMutateNextListeners() {
    if (this.nextListeners === this.currentListeners) {
      this.nextListeners = this.currentListeners.slice();
    }
  }

  destroy() {
    this.setInactive();

    this.dispatch = function () {};

    this.mount = function () {};
  }

  update(newState) {
    this.state = mergeState(this.state, newState);
    const listeners = this.currentListeners = this.nextListeners;

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }
  }

  getState(moduleName) {
    return moduleName ? this.state[moduleName] : this.state;
  }

  getUncommittedState() {
    return this.uncommittedState;
  }

  subscribe(listener) {
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

  respondHandler(action, isReducer) {
    const handlersMap = isReducer ? MetaData.reducersMap : MetaData.effectsMap;
    const actionName = action.type;
    const actionPriority = action.priority || [];
    const actionData = getActionData(action);
    const [actionModuleName] = actionName.split(coreConfig.NSP);
    const commonHandlers = handlersMap[action.type];
    const universalActionType = actionName.replace(new RegExp(`[^${coreConfig.NSP}]+`), '*');
    const universalHandlers = handlersMap[universalActionType];
    const handlers = { ...commonHandlers,
      ...universalHandlers
    };
    const handlerModuleNames = Object.keys(handlers);
    const prevState = this.getState();
    const logs = {
      id: this.sid,
      isActive: this.active,
      actionName,
      payload: actionData,
      priority: actionPriority,
      handers: [],
      state: 'No Change',
      effect: !isReducer
    };
    const storeLogger = coreConfig.StoreLogger;

    if (handlerModuleNames.length > 0) {
      let orderList = [];
      handlerModuleNames.forEach(moduleName => {
        if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });
      orderList.unshift(...actionPriority);
      const mountedModels = this.mountedModels;
      const implemented = {};
      orderList = orderList.filter(moduleName => {
        if (implemented[moduleName] || !handlers[moduleName]) {
          return false;
        }

        implemented[moduleName] = true;
        return mountedModels[moduleName] && !isPromise(mountedModels[moduleName]);
      });
      logs.handers = orderList;

      if (isReducer) {
        const newState = {};
        const uncommittedState = this.uncommittedState = { ...prevState
        };
        orderList.forEach(moduleName => {
          const model = mountedModels[moduleName];
          const handler = handlers[moduleName];
          const result = handler.apply(model, actionData);

          if (result) {
            newState[moduleName] = result;
            uncommittedState[moduleName] = result;
          }
        });
        logs.state = uncommittedState;
        devLogger(logs);
        storeLogger(logs);
        this.update(newState);
      } else {
        devLogger(logs);
        storeLogger(logs);
        const effectHandlers = [];
        orderList.forEach(moduleName => {
          const model = mountedModels[moduleName];
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
        if (actionName === `${coreConfig.AppModuleName}${coreConfig.NSP}${ActionTypes.Error}`) {
          return Promise.reject(actionData);
        }
      }
    }

    return undefined;
  }

}
export function modelHotReplacement(moduleName, ModelClass) {
  const moduleCache = MetaData.moduleCaches[moduleName];

  if (moduleCache) {
    promiseCaseCallback(moduleCache, module => {
      module.ModelClass = ModelClass;
      const newModel = new ModelClass(moduleName, null);
      injectActions(newModel, true);
      const page = MetaData.clientRouter.getCurrentPage();
      page.store.hotReplaceModel(moduleName, ModelClass);
    });
  }

  env.console.log(`[HMR] @Elux Updated model: ${moduleName}`);
}