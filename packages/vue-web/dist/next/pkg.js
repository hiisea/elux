import { inject, createVNode, createTextVNode, defineComponent, Comment, h, Fragment, defineAsyncComponent, provide, shallowRef, ref, onBeforeUnmount, createApp as createApp$1, createSSRApp, reactive } from 'vue';

let root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = new Function('return this')();
}

const env = root;
env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;

env.encodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof btoa === 'function' ? btoa(str) : typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str;
};

env.decodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof atob === 'function' ? atob(str) : typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64').toString() : str;
};

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function buildConfigSetter(data) {
  return config => Object.keys(data).forEach(key => {
    config[key] !== undefined && (data[key] = config[key]);
  });
}
class SingleDispatcher {
  constructor() {
    _defineProperty(this, "listenerId", 0);

    _defineProperty(this, "listenerMap", {});
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
    Object.keys(listenerMap).forEach(id => {
      listenerMap[id](data);
    });
  }

}
class MultipleDispatcher {
  constructor() {
    _defineProperty(this, "listenerId", 0);

    _defineProperty(this, "listenerMap", {});
  }

  addListener(name, callback) {
    this.listenerId++;
    const id = `${this.listenerId}`;

    if (!this.listenerMap[name]) {
      this.listenerMap[name] = {};
    }

    const listenerMap = this.listenerMap[name];
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(name, data) {
    const listenerMap = this.listenerMap[name];

    if (listenerMap) {
      let hasPromise = false;
      const arr = Object.keys(listenerMap).map(id => {
        const result = listenerMap[id](data);

        if (!hasPromise && isPromise(result)) {
          hasPromise = true;
        }

        return result;
      });
      return hasPromise ? Promise.all(arr) : undefined;
    }
  }

}

function isObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize, target, inject) {
  Object.keys(inject).forEach(function (key) {
    const src = target[key];
    const val = inject[key];

    if (isObject(val)) {
      if (isObject(src)) {
        target[key] = __deepMerge(optimize, src, val);
      } else {
        target[key] = optimize ? val : __deepMerge(optimize, {}, val);
      }
    } else {
      target[key] = val;
    }
  });
  return target;
}

function deepMerge(target, ...args) {
  args = args.filter(item => isObject(item) && Object.keys(item).length);

  if (args.length === 0) {
    return target;
  }

  if (!isObject(target)) {
    target = {};
  }

  args.forEach(function (inject, index) {
    let lastArg = false;
    let last2Arg = null;

    if (index === args.length - 1) {
      lastArg = true;
    } else if (index === args.length - 2) {
      last2Arg = args[index + 1];
    }

    Object.keys(inject).forEach(function (key) {
      const src = target[key];
      const val = inject[key];

      if (isObject(val)) {
        if (isObject(src)) {
          target[key] = __deepMerge(lastArg, src, val);
        } else {
          target[key] = lastArg || last2Arg && !last2Arg[key] ? val : __deepMerge(lastArg, {}, val);
        }
      } else {
        target[key] = val;
      }
    });
  });
  return target;
}
function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}
function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

const coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  RouteModuleName: '',
  AppModuleName: 'stage'
};
const setCoreConfig = buildConfigSetter(coreConfig);
let LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (LoadingState = {}));

let RouteHistoryAction;

(function (RouteHistoryAction) {
  RouteHistoryAction["PUSH"] = "PUSH";
  RouteHistoryAction["BACK"] = "BACK";
  RouteHistoryAction["REPLACE"] = "REPLACE";
  RouteHistoryAction["RELAUNCH"] = "RELAUNCH";
})(RouteHistoryAction || (RouteHistoryAction = {}));

function isEluxComponent(data) {
  return data['__elux_component__'];
}
class TaskCounter extends SingleDispatcher {
  constructor(deferSecond) {
    super();

    _defineProperty(this, "list", []);

    _defineProperty(this, "ctimer", 0);

    this.deferSecond = deferSecond;
  }

  addItem(promise, note = '') {
    if (!this.list.some(item => item.promise === promise)) {
      this.list.push({
        promise,
        note
      });
      promise.finally(() => this.completeItem(promise));

      if (this.list.length === 1 && !this.ctimer) {
        this.dispatch(LoadingState.Start);
        this.ctimer = env.setTimeout(() => {
          this.ctimer = 0;

          if (this.list.length > 0) {
            this.dispatch(LoadingState.Depth);
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  }

  completeItem(promise) {
    const i = this.list.findIndex(item => item.promise === promise);

    if (i > -1) {
      this.list.splice(i, 1);

      if (this.list.length === 0) {
        if (this.ctimer) {
          env.clearTimeout.call(null, this.ctimer);
          this.ctimer = 0;
        }

        this.dispatch(LoadingState.Stop);
      }
    }

    return this;
  }

}
const MetaData = {
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  moduleMap: null,
  moduleGetter: null,
  moduleExists: null,
  currentRouter: null
};
function mergeState(target = {}, ...args) {
  if (coreConfig.MutableData) {
    return Object.assign(target, ...args);
  }

  return Object.assign({}, target, ...args);
}
function isServer() {
  return env.isServer;
}

const ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteTestChange: 'RouteTestChange',
  MRouteBeforeChange: 'RouteBeforeChange',
  MRouteChange: 'RouteChange',
  Error: `Elux${coreConfig.NSP}Error`
};
function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
function routeChangeAction(routeState) {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`,
    payload: [routeState]
  };
}
function routeBeforeChangeAction(routeState) {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteBeforeChange}`,
    payload: [routeState]
  };
}
function routeTestChangeAction(routeState) {
  return {
    type: `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteTestChange}`,
    payload: [routeState]
  };
}
function moduleInitAction(moduleName, initState) {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MInit}`,
    payload: [initState]
  };
}
function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MLoading}`,
    payload: [loadingState]
  };
}
function moduleRouteChangeAction(moduleName, params, action) {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`,
    payload: [params, action]
  };
}
function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  const fun = descriptor.value;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
function effect(loadingKey = 'stage.loading.global') {
  let loadingForModuleName;
  let loadingForGroupName;

  if (loadingKey !== null) {
    [loadingForModuleName,, loadingForGroupName] = loadingKey.split('.');
  }

  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForModuleName && loadingForGroupName && !env.isServer) {
      const injectLoading = function (curAction, promiseResult) {
        if (loadingForModuleName === 'stage') {
          loadingForModuleName = coreConfig.AppModuleName;
        } else if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }

        setLoading(promiseResult, this.store, loadingForModuleName, loadingForGroupName);
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([injectLoading, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}
function effectLogger(before, after) {
  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}
function setLoading(item, store, moduleName, groupName) {
  const key = moduleName + coreConfig.NSP + groupName;
  const loadings = store.loadingGroups;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(coreConfig.DepthTimeOnLoading);
    loadings[key].addListener(loadingState => {
      const action = moduleLoadingAction(moduleName, {
        [groupName]: loadingState
      });
      store.dispatch(action);
    });
  }

  loadings[key].addItem(item);
  return item;
}

function createRedux(initState) {
  let currentState = initState;
  let currentListeners = [];
  let nextListeners = currentListeners;
  let isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function getState(moduleName) {
    if (isDispatching) {
      throw new Error('You may not call store.getState() while the reducer is executing. ');
    }

    const result = moduleName ? currentState[moduleName] : currentState;
    return result;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    if (isDispatching) {
      throw new Error('You may not call store.subscribe() while the reducer is executing.');
    }

    let isSubscribed = true;
    ensureCanMutateNextListeners();
    nextListeners.push(listener);
    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error('You may not unsubscribe from a store listener while the reducer is executing. ');
      }

      isSubscribed = false;
      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }

  function dispatch(action) {
    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = mergeState(currentState, action.state);
    } finally {
      isDispatching = false;
    }

    const listeners = currentListeners = nextListeners;

    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }

    return action;
  }

  function update(actionName, state) {
    dispatch({
      type: actionName,
      state
    });
  }

  return {
    update,
    subscribe,
    getState
  };
}

let reduxDevTools;

if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = env.__REDUX_DEVTOOLS_EXTENSION__.connect({
    features: {}
  });
  reduxDevTools.init({});
  reduxDevTools.subscribe(({
    type,
    payload
  }) => {
    if (type === 'DISPATCH' && payload.type === 'COMMIT') {
      reduxDevTools.init({});
    }
  });
}

const effects = [];
const devLogger = ({
  id,
  isActive
}, actionName, payload, priority, handers, state, effect) => {
  if (reduxDevTools) {
    const type = [actionName, ` (${isActive ? '' : '*'}${id})`].join('');
    const logItem = {
      type,
      payload,
      priority,
      handers
    };

    if (effect) {
      effects.push(logItem);
    } else {
      logItem.effects = [...effects];
      effects.length = 0;
      reduxDevTools.send(logItem, state);
    }
  }
};

function getModule(moduleName) {
  if (MetaData.moduleCaches[moduleName]) {
    return MetaData.moduleCaches[moduleName];
  }

  const moduleOrPromise = MetaData.moduleGetter[moduleName]();

  if (isPromise(moduleOrPromise)) {
    const promiseModule = moduleOrPromise.then(({
      default: module
    }) => {
      MetaData.moduleCaches[moduleName] = module;
      return module;
    }, reason => {
      MetaData.moduleCaches[moduleName] = undefined;
      throw reason;
    });
    MetaData.moduleCaches[moduleName] = promiseModule;
    return promiseModule;
  }

  MetaData.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}
function getModuleList(moduleNames) {
  if (moduleNames.length < 1) {
    return [];
  }

  const list = moduleNames.map(moduleName => {
    if (MetaData.moduleCaches[moduleName]) {
      return MetaData.moduleCaches[moduleName];
    }

    return getModule(moduleName);
  });

  if (list.some(item => isPromise(item))) {
    return Promise.all(list);
  } else {
    return list;
  }
}
function getComponent(moduleName, componentName) {
  const key = [moduleName, componentName].join(coreConfig.NSP);

  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key];
  }

  const moduleCallback = module => {
    const componentOrFun = module.components[componentName];

    if (isEluxComponent(componentOrFun)) {
      const component = componentOrFun;
      MetaData.componentCaches[key] = component;
      return component;
    }

    const promiseComponent = componentOrFun().then(({
      default: component
    }) => {
      MetaData.componentCaches[key] = component;
      return component;
    }, reason => {
      MetaData.componentCaches[key] = undefined;
      throw reason;
    });
    MetaData.componentCaches[key] = promiseComponent;
    return promiseComponent;
  };

  const moduleOrPromise = getModule(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(moduleCallback);
  }

  return moduleCallback(moduleOrPromise);
}
function getComponentList(keys) {
  if (keys.length < 1) {
    return Promise.resolve([]);
  }

  return Promise.all(keys.map(key => {
    if (MetaData.componentCaches[key]) {
      return MetaData.componentCaches[key];
    }

    const [moduleName, componentName] = key.split(coreConfig.NSP);
    return getComponent(moduleName, componentName);
  }));
}
function loadModel(moduleName, store) {
  const moduleOrPromise = getModule(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(module => module.initModel(store));
  }

  return moduleOrPromise.initModel(store);
}
function loadComponent$1(moduleName, componentName, store, deps) {
  const promiseOrComponent = getComponent(moduleName, componentName);

  const callback = component => {
    if (component.__elux_component__ === 'view' && !store.injectedModules[moduleName]) {
      if (env.isServer) {
        return null;
      }

      const module = getModule(moduleName);
      module.initModel(store);
    }

    deps[moduleName + coreConfig.NSP + componentName] = true;
    return component;
  };

  if (isPromise(promiseOrComponent)) {
    if (env.isServer) {
      return null;
    }

    return promiseOrComponent.then(callback);
  }

  return callback(promiseOrComponent);
}
function moduleExists() {
  return MetaData.moduleExists;
}
function defineModuleGetter(moduleGetter) {
  MetaData.moduleGetter = moduleGetter;
  MetaData.moduleExists = Object.keys(moduleGetter).reduce((data, moduleName) => {
    data[moduleName] = true;
    return data;
  }, {});
}

const routeMiddleware = ({
  dispatch,
  getStore
}) => next => action => {
  if (action.type === `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`) {
    const existsModules = Object.keys(getStore().getState()).reduce((obj, moduleName) => {
      obj[moduleName] = true;
      return obj;
    }, {});
    const result = next(action);
    const [routeState] = action.payload;
    Object.keys(routeState.params).forEach(moduleName => {
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
function forkStore(originalStore, newRouteState) {
  const {
    sid,
    options: {
      initState,
      middlewares,
      logger
    },
    router
  } = originalStore;
  return createStore(sid + 1, router, {
    [coreConfig.RouteModuleName]: newRouteState
  }, initState, middlewares, logger);
}

const preMiddleware = ({
  getStore
}) => next => action => {
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
    const store = getStore();

    if (!store.injectedModules[moduleName]) {
      const result = loadModel(moduleName, store);

      if (isPromise(result)) {
        return result.then(() => next(action));
      }
    }
  }

  return next(action);
};

function createStore(sid, router, data, initState, middlewares, logger) {
  const redux = createRedux(initState(data));
  const {
    getState,
    subscribe,
    update: _update
  } = redux;

  const getRouteParams = moduleName => {
    const routeState = getState(coreConfig.RouteModuleName);
    return moduleName ? routeState.params[moduleName] : routeState.params;
  };

  const options = {
    initState,
    logger,
    middlewares
  };
  const loadingGroups = {};
  const injectedModules = {};
  const refData = {
    currentActionName: '',
    uncommittedState: {},
    isActive: false
  };

  const isActive = () => {
    return refData.isActive;
  };

  const setActive = status => {
    if (refData.isActive !== status) {
      refData.isActive = status;
    }
  };

  const getCurrentActionName = () => refData.currentActionName;

  const getUncommittedState = moduleName => {
    const state = refData.uncommittedState;
    return moduleName ? state[moduleName] : state;
  };

  const destroy = () => {
    Object.keys(injectedModules).forEach(moduleName => {
      injectedModules[moduleName].destroy();
    });
  };

  const update = (actionName, state) => {
    _update(actionName, state);

    router.latestState = { ...router.latestState,
      ...state
    };
  };

  let dispatch = action => {
    throw new Error('Dispatching while constructing your middleware is not allowed. ');
  };

  function applyEffect(moduleName, handler, modelInstance, action, actionData) {
    const effectResult = handler.apply(modelInstance, actionData);
    const decorators = handler.__decorators__;

    if (decorators) {
      const results = [];
      decorators.forEach((decorator, index) => {
        results[index] = decorator[0].call(modelInstance, action, effectResult);
      });
      handler.__decoratorResults__ = results;
    }

    return effectResult.then(reslove => {
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
    }, error => {
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
    });
  }

  function respondHandler(action, isReducer) {
    let logs;
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

    if (handlerModuleNames.length > 0) {
      const orderList = [];
      handlerModuleNames.forEach(moduleName => {
        if (moduleName === coreConfig.AppModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });
      orderList.unshift(...actionPriority);
      const implemented = {};

      if (isReducer) {
        const prevState = getState();
        const newState = {};
        const uncommittedState = { ...prevState
        };
        refData.uncommittedState = uncommittedState;
        orderList.forEach(moduleName => {
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
        logs = [{
          id: sid,
          isActive: refData.isActive
        }, actionName, actionData, actionPriority, orderList, uncommittedState, false];
        devLogger(...logs);
        logger && logger(...logs);
        update(actionName, newState);
      } else {
        logs = [{
          id: sid,
          isActive: refData.isActive
        }, actionName, actionData, actionPriority, orderList, getState(), true];
        devLogger(...logs);
        logger && logger(...logs);
        const result = [];
        orderList.forEach(moduleName => {
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

  function _dispatch(action) {
    respondHandler(action, true);
    return respondHandler(action, false);
  }

  const middlewareAPI = {
    getStore: () => store,
    dispatch: action => dispatch(action)
  };
  const chain = [preMiddleware, routeMiddleware, ...(middlewares || [])].map(middleware => middleware(middlewareAPI));
  dispatch = compose(...chain)(_dispatch);
  const store = {
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
    options
  };
  return store;
}
const errorProcessed = '__eluxProcessed__';
function isProcessedError(error) {
  return error && !!error[errorProcessed];
}
function setProcessedError(error, processed) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  Object.defineProperty(error, errorProcessed, {
    value: processed,
    enumerable: false,
    writable: true
  });
  return error;
}
function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _toArray(arr) {
  return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest();
}

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function _typeof(obj) {
      return typeof obj;
    };
  } else {
    _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _toPrimitive(input, hint) {
  if (_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];

  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }

  return (hint === "string" ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return _typeof(key) === "symbol" ? key : String(key);
}

function _decorate(decorators, factory, superClass, mixins) {
  var api = _getDecoratorsApi();

  if (mixins) {
    for (var i = 0; i < mixins.length; i++) {
      api = mixins[i](api);
    }
  }

  var r = factory(function initialize(O) {
    api.initializeInstanceElements(O, decorated.elements);
  }, superClass);
  var decorated = api.decorateClass(_coalesceClassElements(r.d.map(_createElementDescriptor)), decorators);
  api.initializeClassElements(r.F, decorated.elements);
  return api.runClassFinishers(r.F, decorated.finishers);
}

function _getDecoratorsApi() {
  _getDecoratorsApi = function _getDecoratorsApi() {
    return api;
  };

  var api = {
    elementsDefinitionOrder: [["method"], ["field"]],
    initializeInstanceElements: function initializeInstanceElements(O, elements) {
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          if (element.kind === kind && element.placement === "own") {
            this.defineClassElement(O, element);
          }
        }, this);
      }, this);
    },
    initializeClassElements: function initializeClassElements(F, elements) {
      var proto = F.prototype;
      ["method", "field"].forEach(function (kind) {
        elements.forEach(function (element) {
          var placement = element.placement;

          if (element.kind === kind && (placement === "static" || placement === "prototype")) {
            var receiver = placement === "static" ? F : proto;
            this.defineClassElement(receiver, element);
          }
        }, this);
      }, this);
    },
    defineClassElement: function defineClassElement(receiver, element) {
      var descriptor = element.descriptor;

      if (element.kind === "field") {
        var initializer = element.initializer;
        descriptor = {
          enumerable: descriptor.enumerable,
          writable: descriptor.writable,
          configurable: descriptor.configurable,
          value: initializer === void 0 ? void 0 : initializer.call(receiver)
        };
      }

      Object.defineProperty(receiver, element.key, descriptor);
    },
    decorateClass: function decorateClass(elements, decorators) {
      var newElements = [];
      var finishers = [];
      var placements = {
        "static": [],
        prototype: [],
        own: []
      };
      elements.forEach(function (element) {
        this.addElementPlacement(element, placements);
      }, this);
      elements.forEach(function (element) {
        if (!_hasDecorators(element)) return newElements.push(element);
        var elementFinishersExtras = this.decorateElement(element, placements);
        newElements.push(elementFinishersExtras.element);
        newElements.push.apply(newElements, elementFinishersExtras.extras);
        finishers.push.apply(finishers, elementFinishersExtras.finishers);
      }, this);

      if (!decorators) {
        return {
          elements: newElements,
          finishers: finishers
        };
      }

      var result = this.decorateConstructor(newElements, decorators);
      finishers.push.apply(finishers, result.finishers);
      result.finishers = finishers;
      return result;
    },
    addElementPlacement: function addElementPlacement(element, placements, silent) {
      var keys = placements[element.placement];

      if (!silent && keys.indexOf(element.key) !== -1) {
        throw new TypeError("Duplicated element (" + element.key + ")");
      }

      keys.push(element.key);
    },
    decorateElement: function decorateElement(element, placements) {
      var extras = [];
      var finishers = [];

      for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) {
        var keys = placements[element.placement];
        keys.splice(keys.indexOf(element.key), 1);
        var elementObject = this.fromElementDescriptor(element);
        var elementFinisherExtras = this.toElementFinisherExtras((0, decorators[i])(elementObject) || elementObject);
        element = elementFinisherExtras.element;
        this.addElementPlacement(element, placements);

        if (elementFinisherExtras.finisher) {
          finishers.push(elementFinisherExtras.finisher);
        }

        var newExtras = elementFinisherExtras.extras;

        if (newExtras) {
          for (var j = 0; j < newExtras.length; j++) {
            this.addElementPlacement(newExtras[j], placements);
          }

          extras.push.apply(extras, newExtras);
        }
      }

      return {
        element: element,
        finishers: finishers,
        extras: extras
      };
    },
    decorateConstructor: function decorateConstructor(elements, decorators) {
      var finishers = [];

      for (var i = decorators.length - 1; i >= 0; i--) {
        var obj = this.fromClassDescriptor(elements);
        var elementsAndFinisher = this.toClassDescriptor((0, decorators[i])(obj) || obj);

        if (elementsAndFinisher.finisher !== undefined) {
          finishers.push(elementsAndFinisher.finisher);
        }

        if (elementsAndFinisher.elements !== undefined) {
          elements = elementsAndFinisher.elements;

          for (var j = 0; j < elements.length - 1; j++) {
            for (var k = j + 1; k < elements.length; k++) {
              if (elements[j].key === elements[k].key && elements[j].placement === elements[k].placement) {
                throw new TypeError("Duplicated element (" + elements[j].key + ")");
              }
            }
          }
        }
      }

      return {
        elements: elements,
        finishers: finishers
      };
    },
    fromElementDescriptor: function fromElementDescriptor(element) {
      var obj = {
        kind: element.kind,
        key: element.key,
        placement: element.placement,
        descriptor: element.descriptor
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      if (element.kind === "field") obj.initializer = element.initializer;
      return obj;
    },
    toElementDescriptors: function toElementDescriptors(elementObjects) {
      if (elementObjects === undefined) return;
      return _toArray(elementObjects).map(function (elementObject) {
        var element = this.toElementDescriptor(elementObject);
        this.disallowProperty(elementObject, "finisher", "An element descriptor");
        this.disallowProperty(elementObject, "extras", "An element descriptor");
        return element;
      }, this);
    },
    toElementDescriptor: function toElementDescriptor(elementObject) {
      var kind = String(elementObject.kind);

      if (kind !== "method" && kind !== "field") {
        throw new TypeError('An element descriptor\'s .kind property must be either "method" or' + ' "field", but a decorator created an element descriptor with' + ' .kind "' + kind + '"');
      }

      var key = _toPropertyKey(elementObject.key);
      var placement = String(elementObject.placement);

      if (placement !== "static" && placement !== "prototype" && placement !== "own") {
        throw new TypeError('An element descriptor\'s .placement property must be one of "static",' + ' "prototype" or "own", but a decorator created an element descriptor' + ' with .placement "' + placement + '"');
      }

      var descriptor = elementObject.descriptor;
      this.disallowProperty(elementObject, "elements", "An element descriptor");
      var element = {
        kind: kind,
        key: key,
        placement: placement,
        descriptor: Object.assign({}, descriptor)
      };

      if (kind !== "field") {
        this.disallowProperty(elementObject, "initializer", "A method descriptor");
      } else {
        this.disallowProperty(descriptor, "get", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "set", "The property descriptor of a field descriptor");
        this.disallowProperty(descriptor, "value", "The property descriptor of a field descriptor");
        element.initializer = elementObject.initializer;
      }

      return element;
    },
    toElementFinisherExtras: function toElementFinisherExtras(elementObject) {
      var element = this.toElementDescriptor(elementObject);

      var finisher = _optionalCallableProperty(elementObject, "finisher");

      var extras = this.toElementDescriptors(elementObject.extras);
      return {
        element: element,
        finisher: finisher,
        extras: extras
      };
    },
    fromClassDescriptor: function fromClassDescriptor(elements) {
      var obj = {
        kind: "class",
        elements: elements.map(this.fromElementDescriptor, this)
      };
      var desc = {
        value: "Descriptor",
        configurable: true
      };
      Object.defineProperty(obj, Symbol.toStringTag, desc);
      return obj;
    },
    toClassDescriptor: function toClassDescriptor(obj) {
      var kind = String(obj.kind);

      if (kind !== "class") {
        throw new TypeError('A class descriptor\'s .kind property must be "class", but a decorator' + ' created a class descriptor with .kind "' + kind + '"');
      }

      this.disallowProperty(obj, "key", "A class descriptor");
      this.disallowProperty(obj, "placement", "A class descriptor");
      this.disallowProperty(obj, "descriptor", "A class descriptor");
      this.disallowProperty(obj, "initializer", "A class descriptor");
      this.disallowProperty(obj, "extras", "A class descriptor");

      var finisher = _optionalCallableProperty(obj, "finisher");

      var elements = this.toElementDescriptors(obj.elements);
      return {
        elements: elements,
        finisher: finisher
      };
    },
    runClassFinishers: function runClassFinishers(constructor, finishers) {
      for (var i = 0; i < finishers.length; i++) {
        var newConstructor = (0, finishers[i])(constructor);

        if (newConstructor !== undefined) {
          if (typeof newConstructor !== "function") {
            throw new TypeError("Finishers must return a constructor.");
          }

          constructor = newConstructor;
        }
      }

      return constructor;
    },
    disallowProperty: function disallowProperty(obj, name, objectType) {
      if (obj[name] !== undefined) {
        throw new TypeError(objectType + " can't have a ." + name + " property.");
      }
    }
  };
  return api;
}

function _createElementDescriptor(def) {
  var key = _toPropertyKey(def.key);
  var descriptor;

  if (def.kind === "method") {
    descriptor = {
      value: def.value,
      writable: true,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "get") {
    descriptor = {
      get: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "set") {
    descriptor = {
      set: def.value,
      configurable: true,
      enumerable: false
    };
  } else if (def.kind === "field") {
    descriptor = {
      configurable: true,
      writable: true,
      enumerable: true
    };
  }

  var element = {
    kind: def.kind === "field" ? "field" : "method",
    key: key,
    placement: def["static"] ? "static" : def.kind === "field" ? "own" : "prototype",
    descriptor: descriptor
  };
  if (def.decorators) element.decorators = def.decorators;
  if (def.kind === "field") element.initializer = def.value;
  return element;
}

function _coalesceGetterSetter(element, other) {
  if (element.descriptor.get !== undefined) {
    other.descriptor.get = element.descriptor.get;
  } else {
    other.descriptor.set = element.descriptor.set;
  }
}

function _coalesceClassElements(elements) {
  var newElements = [];

  var isSameElement = function isSameElement(other) {
    return other.kind === "method" && other.key === element.key && other.placement === element.placement;
  };

  for (var i = 0; i < elements.length; i++) {
    var element = elements[i];
    var other;

    if (element.kind === "method" && (other = newElements.find(isSameElement))) {
      if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) {
        if (_hasDecorators(element) || _hasDecorators(other)) {
          throw new ReferenceError("Duplicated methods (" + element.key + ") can't be decorated.");
        }

        other.descriptor = element.descriptor;
      } else {
        if (_hasDecorators(element)) {
          if (_hasDecorators(other)) {
            throw new ReferenceError("Decorators can't be placed on different accessors with for " + "the same property (" + element.key + ").");
          }

          other.decorators = element.decorators;
        }

        _coalesceGetterSetter(element, other);
      }
    } else {
      newElements.push(element);
    }
  }

  return newElements;
}

function _hasDecorators(element) {
  return element.decorators && element.decorators.length;
}

function _isDataDescriptor(desc) {
  return desc !== undefined && !(desc.value === undefined && desc.writable === undefined);
}

function _optionalCallableProperty(obj, name) {
  var value = obj[name];

  if (value !== undefined && typeof value !== "function") {
    throw new TypeError("Expected '" + name + "' to be a function");
  }

  return value;
}

function initModel(moduleName, ModelClass, _store) {
  const store = _store;

  if (!store.injectedModules[moduleName]) {
    const {
      latestState
    } = store.router;
    const preState = store.getState();
    const model = new ModelClass(moduleName, store);
    const initState = model.init(latestState, preState) || {};
    store.injectedModules[moduleName] = model;
    return store.dispatch(moduleInitAction(moduleName, coreConfig.MutableData ? deepClone(initState) : initState));
  }

  return undefined;
}

function baseExportModule(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(key => {
    const component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn(`The exported component must implement interface EluxComponent: ${moduleName}.${key}`);
    }
  });
  const model = new ModelClass(moduleName, null);
  injectActions(moduleName, model);
  return {
    moduleName,
    initModel: initModel.bind(null, moduleName, ModelClass),
    state: {},
    actions: {},
    components,
    routeParams: model.defaultRouteParams,
    data
  };
}

function transformAction(actionName, handler, listenerModule, actionHandlerMap, hmr) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    env.console.warn(`Action duplicate : ${actionName}.`);
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

function injectActions(moduleName, model, hmr) {
  const handlers = model;
  const injectedModules = MetaData.injectedModules;

  if (injectedModules[moduleName]) {
    return;
  }

  injectedModules[moduleName] = true;

  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];

      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(coreConfig.MSP).forEach(actionName => {
          actionName = actionName.trim().replace(new RegExp(`^this[${coreConfig.NSP}]`), `${moduleName}${coreConfig.NSP}`);
          const arr = actionName.split(coreConfig.NSP);

          if (arr[1]) {
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
          } else {
            transformAction(moduleName + coreConfig.NSP + actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
          }
        });
      }
    }
  }
}
function modelHotReplacement(moduleName, ModelClass) {
  const moduleCache = MetaData.moduleCaches[moduleName];

  if (moduleCache && moduleCache['initModel']) {
    moduleCache.initModel = initModel.bind(null, moduleName, ModelClass);
  }

  if (MetaData.injectedModules[moduleName]) {
    MetaData.injectedModules[moduleName] = false;
    const model = new ModelClass(moduleName, null);
    injectActions(moduleName, model, true);
  }

  const stores = MetaData.currentRouter.getStoreList();
  stores.forEach(store => {
    if (store.injectedModules[moduleName]) {
      const model = new ModelClass(moduleName, store);
      store.injectedModules[moduleName] = model;
    }
  });
  env.console.log(`[HMR] @medux Updated model: ${moduleName}`);
}
function getModuleMap(data) {
  if (!MetaData.moduleMap) {
    if (data) {
      MetaData.moduleMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions = {};
        const actionNames = {};
        arr.forEach(actionName => {
          actions[actionName] = (...payload) => ({
            type: moduleName + coreConfig.NSP + actionName,
            payload
          });

          actionNames[actionName] = moduleName + coreConfig.NSP + actionName;
        });
        const moduleFacade = {
          name: moduleName,
          actions,
          actionNames
        };
        prev[moduleName] = moduleFacade;
        return prev;
      }, {});
    } else {
      const cacheData = {};
      MetaData.moduleMap = new Proxy({}, {
        set(target, moduleName, val, receiver) {
          return Reflect.set(target, moduleName, val, receiver);
        },

        get(target, moduleName, receiver) {
          const val = Reflect.get(target, moduleName, receiver);

          if (val !== undefined) {
            return val;
          }

          if (!cacheData[moduleName]) {
            cacheData[moduleName] = {
              name: moduleName,
              actionNames: new Proxy({}, {
                get(__, actionName) {
                  return moduleName + coreConfig.NSP + actionName;
                }

              }),
              actions: new Proxy({}, {
                get(__, actionName) {
                  return (...payload) => ({
                    type: moduleName + coreConfig.NSP + actionName,
                    payload
                  });
                }

              })
            };
          }

          return cacheData[moduleName];
        }

      });
    }
  }

  return MetaData.moduleMap;
}
function exportComponent(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
function exportView(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}
class EmptyModel {
  constructor(moduleName, store) {
    _defineProperty(this, "initState", {});

    _defineProperty(this, "defaultRouteParams", {});

    this.moduleName = moduleName;
    this.store = store;
  }

  init() {
    return {};
  }

  destroy() {
    return;
  }

}
let RouteModel = _decorate(null, function (_initialize) {
  class RouteModel {
    constructor(moduleName, store) {
      _initialize(this);

      this.moduleName = moduleName;
      this.store = store;
    }

  }

  return {
    F: RouteModel,
    d: [{
      kind: "field",
      key: "defaultRouteParams",

      value() {
        return {};
      }

    }, {
      kind: "method",
      key: "init",
      value: function init(latestState, preState) {
        return preState[this.moduleName];
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: ActionTypes.MInit,
      value: function (initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: ActionTypes.MRouteChange,
      value: function (routeState) {
        return mergeState(this.store.getState(this.moduleName), routeState);
      }
    }, {
      kind: "method",
      key: "destroy",
      value: function destroy() {
        return;
      }
    }]
  };
});

function exportModule(moduleName, ModelClass, components, data) {
  return baseExportModule(moduleName, ModelClass, components, data);
}
let BaseModel = _decorate(null, function (_initialize) {
  class BaseModel {
    constructor(moduleName, store) {
      _initialize(this);

      this.moduleName = moduleName;
      this.store = store;
    }

  }

  return {
    F: BaseModel,
    d: [{
      kind: "field",
      key: "defaultRouteParams",
      value: void 0
    }, {
      kind: "method",
      key: "getLatestState",
      value: function getLatestState() {
        return this.store.router.latestState;
      }
    }, {
      kind: "method",
      key: "getRootState",
      value: function getRootState() {
        return this.store.getState();
      }
    }, {
      kind: "method",
      key: "getUncommittedState",
      value: function getUncommittedState() {
        return this.store.getUncommittedState();
      }
    }, {
      kind: "method",
      key: "getState",
      value: function getState() {
        return this.store.getState(this.moduleName);
      }
    }, {
      kind: "get",
      key: "actions",
      value: function actions() {
        return MetaData.moduleMap[this.moduleName].actions;
      }
    }, {
      kind: "method",
      key: "getPrivateActions",
      value: function getPrivateActions(actionsMap) {
        return MetaData.moduleMap[this.moduleName].actions;
      }
    }, {
      kind: "get",
      key: "router",
      value: function router() {
        return this.store.router;
      }
    }, {
      kind: "method",
      key: "getRouteParams",
      value: function getRouteParams() {
        return this.store.getRouteParams(this.moduleName);
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return this.store.getCurrentActionName();
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel$1(moduleName) {
        return loadModel(moduleName, this.store);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: ActionTypes.MInit,
      value: function (initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: ActionTypes.MLoading,
      value: function (payload) {
        const state = this.getState();
        const loading = mergeState(state.loading, payload);
        return mergeState(state, {
          loading
        });
      }
    }, {
      kind: "method",
      key: "destroy",
      value: function destroy() {
        return;
      }
    }]
  };
});

function initApp(router, data, initState, middlewares, storeLogger, appViewName, preloadComponents = []) {
  MetaData.currentRouter = router;
  const store = createStore(0, router, data, initState, middlewares, storeLogger);
  router.startup(store);
  const {
    AppModuleName,
    RouteModuleName
  } = coreConfig;
  const {
    moduleGetter
  } = MetaData;
  const appModule = getModule(AppModuleName);
  const routeModule = getModule(RouteModuleName);
  const AppView = appViewName ? getComponent(AppModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  const preloadModules = Object.keys(router.routeState.params).concat(Object.keys(store.getState())).reduce((data, moduleName) => {
    if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
      data[moduleName] = true;
    }

    return data;
  }, {});
  const results = Promise.all([getModuleList(Object.keys(preloadModules)), getComponentList(preloadComponents), routeModule.initModel(store), appModule.initModel(store)]);
  let setup;

  if (env.isServer) {
    setup = results.then(([modules]) => {
      return Promise.all(modules.map(mod => mod.initModel(store)));
    });
  } else {
    setup = results;
  }

  return {
    store,
    AppView,
    setup
  };
}
function reinitApp(store) {
  const {
    moduleGetter
  } = MetaData;
  const preloadModules = Object.keys(store.router.routeState.params).filter(moduleName => moduleGetter[moduleName] && moduleName !== AppModuleName);
  const {
    AppModuleName,
    RouteModuleName
  } = coreConfig;
  const appModule = getModule(AppModuleName);
  const routeModule = getModule(RouteModuleName);
  return Promise.all([getModuleList(preloadModules), routeModule.initModel(store), appModule.initModel(store)]);
}

const vueComponentsConfig = {
  setPageTitle(title) {
    return env.document.title = title;
  },

  Provider: null,
  LoadComponentOnError: ({
    message
  }) => createVNode("div", {
    "class": "g-component-error"
  }, [message]),
  LoadComponentOnLoading: () => createVNode("div", {
    "class": "g-component-loading"
  }, [createTextVNode("loading...")])
};
const setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);
const EluxContextKey = '__EluxContext__';
const EluxStoreContextKey = '__EluxStoreContext__';
function useRouter() {
  const {
    router
  } = inject(EluxContextKey, {
    documentHead: ''
  });
  return router;
}
function useStore() {
  const {
    store
  } = inject(EluxStoreContextKey, {});
  return store;
}

let clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      const arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        env.document.title = arr[1];
      }
    }, 0);
  }
}

const DocumentHead = defineComponent({
  props: {
    title: {
      type: String
    },
    html: {
      type: String
    }
  },

  data() {
    return {
      eluxContext: inject(EluxContextKey, {
        documentHead: ''
      }),
      raw: ''
    };
  },

  computed: {
    headText() {
      const title = this.title || '';
      let html = this.html || '';
      const eluxContext = this.eluxContext;

      if (!html) {
        html = eluxContext.documentHead || '<title>Elux</title>';
      }

      if (title) {
        return html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      }

      return html;
    }

  },

  mounted() {
    this.raw = this.eluxContext.documentHead;
    setClientHead(this.eluxContext, this.headText);
  },

  unmounted() {
    setClientHead(this.eluxContext, this.raw);
  },

  render() {
    if (isServer()) {
      this.eluxContext.documentHead = this.headText;
    }

    return null;
  }

});

const Switch = function (props, context) {
  const arr = [];
  const children = context.slots.default ? context.slots.default() : [];
  children.forEach(item => {
    if (item.type !== Comment) {
      arr.push(item);
    }
  });

  if (arr.length > 0) {
    return h(Fragment, null, [arr[0]]);
  }

  return h(Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
};

const Else = function (props, context) {
  const arr = [];
  const children = context.slots.default ? context.slots.default() : [];
  children.forEach(item => {
    if (item.type !== Comment) {
      arr.push(item);
    }
  });

  if (arr.length > 0) {
    return h(Fragment, null, arr);
  }

  return h(Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
};

const Link = function ({
  onClick: _onClick,
  disabled,
  href,
  route,
  action = 'push',
  root,
  ...props
}, context) {
  const {
    router
  } = inject(EluxContextKey, {
    documentHead: ''
  });

  const onClick = event => {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router[action](route, root);
  };

  !disabled && (props['onClick'] = onClick);
  disabled && (props['disabled'] = true);
  !disabled && href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return h('a', props, context.slots.default());
  } else {
    return h('div', props, context.slots.default());
  }
};

const loadComponent = (moduleName, componentName, options = {}) => {
  const loadingComponent = options.OnLoading || vueComponentsConfig.LoadComponentOnLoading;
  const errorComponent = options.OnError || vueComponentsConfig.LoadComponentOnError;

  const component = (props, context) => {
    const {
      deps
    } = inject(EluxContextKey, {
      documentHead: ''
    });
    const {
      store
    } = inject(EluxStoreContextKey, {
      store: null
    });
    let result;
    let errorMessage = '';

    try {
      result = loadComponent$1(moduleName, componentName, store, deps || {});
    } catch (e) {
      env.console.error(e);
      errorMessage = e.message || `${e}`;
    }

    if (result !== undefined) {
      if (result === null) {
        return h(loadingComponent);
      }

      if (isPromise(result)) {
        return h(defineAsyncComponent({
          loader: () => result,
          errorComponent,
          loadingComponent
        }), props, context.slots);
      }

      return h(result, props, context.slots);
    }

    return h(errorComponent, null, errorMessage);
  };

  return component;
};

let StageView;
const EWindow = defineComponent({
  props: {
    store: {
      type: Object,
      required: true
    },
    view: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const storeContext = {
      store: props.store
    };
    provide(EluxStoreContextKey, storeContext);
    return () => h(props.view, null);
  }

});
const Router = defineComponent({
  setup() {
    const {
      router
    } = inject(EluxContextKey, {
      documentHead: ''
    });
    const data = shallowRef({
      classname: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    const containerRef = ref({
      className: ''
    });
    const removeListener = router.addListener('change', ({
      routeState,
      root
    }) => {
      if (root) {
        const pages = router.getCurrentPages().reverse();
        let completeCallback;

        if (routeState.action === 'PUSH') {
          const completePromise = new Promise(resolve => {
            completeCallback = resolve;
          });
          data.value = {
            classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
            pages
          };
          env.setTimeout(() => {
            containerRef.value.className = 'elux-app elux-animation';
          }, 100);
          env.setTimeout(() => {
            containerRef.value.className = 'elux-app';
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'BACK') {
          const completePromise = new Promise(resolve => {
            completeCallback = resolve;
          });
          data.value = {
            classname: 'elux-app ' + Date.now(),
            pages: [...pages, data.value.pages[data.value.pages.length - 1]]
          };
          env.setTimeout(() => {
            containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
          }, 100);
          env.setTimeout(() => {
            data.value = {
              classname: 'elux-app ' + Date.now(),
              pages
            };
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          data.value = {
            classname: 'elux-app ' + Date.now(),
            pages
          };
        }
      }

      return;
    });
    onBeforeUnmount(() => {
      removeListener();
    });
    return () => {
      const {
        classname,
        pages
      } = data.value;
      return createVNode("div", {
        "ref": containerRef,
        "class": classname
      }, [pages.map(item => {
        const {
          store,
          pagename
        } = item;
        return createVNode("div", {
          "key": store.sid,
          "data-sid": store.sid,
          "class": "elux-window",
          "data-pagename": pagename
        }, [createVNode(EWindow, {
          "store": store,
          "view": item.pageComponent || StageView
        }, null)]);
      })]);
    };
  }

});
function renderToDocument(id, APPView, eluxContext, fromSSR, app, store) {
  StageView = APPView;
  app.provide(EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }

  app.mount(`#${id}`);
}
function renderToString(id, APPView, eluxContext, app, store) {
  StageView = APPView;
  app.provide(EluxContextKey, eluxContext);

  const htmlPromise = require('@vue/server-renderer').renderToString(app);

  return htmlPromise;
}

const routeConfig = {
  maxHistory: 10,
  maxLocationCache: env.isServer ? 10000 : 500,
  notifyNativeRouter: {
    root: true,
    internal: false
  },
  indexUrl: '/index',
  notfoundPagename: '/404',
  paramsKey: '_'
};
const setRouteConfig = buildConfigSetter(routeConfig);
const routeMeta = {
  defaultParams: {},
  pageComponents: {},
  pagenameMap: {},
  pagenameList: [],
  nativeLocationMap: {}
};
function routeJsonParse(json) {
  if (!json || json === '{}' || json.charAt(0) !== '{' || json.charAt(json.length - 1) !== '}') {
    return {};
  }

  let args = {};

  try {
    args = JSON.parse(json);
  } catch (error) {
    args = {};
  }

  return args;
}

class HistoryStack {
  constructor(limit) {
    _defineProperty(this, "records", []);

    this.limit = limit;
  }

  startup(record) {
    const oItem = this.records[0];
    this.records = [record];
    this.setActive(oItem);
  }

  getCurrentItem() {
    return this.records[0];
  }

  getEarliestItem() {
    return this.records[this.records.length - 1];
  }

  getItemAt(n) {
    return this.records[n];
  }

  getItems() {
    return [...this.records];
  }

  getLength() {
    return this.records.length;
  }

  _push(item) {
    const records = this.records;
    const oItem = records[0];
    records.unshift(item);
    const delItem = records.splice(this.limit)[0];

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }

    this.setActive(oItem);
  }

  _replace(item) {
    const records = this.records;
    const delItem = records[0];
    records[0] = item;

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }

    this.setActive(delItem);
  }

  _relaunch(item) {
    const delList = this.records;
    const oItem = delList[0];
    this.records = [item];
    delList.forEach(delItem => {
      if (delItem !== item && delItem.destroy) {
        delItem.destroy();
      }
    });
    this.setActive(oItem);
  }

  back(delta) {
    const oItem = this.records[0];
    const delList = this.records.splice(0, delta);

    if (this.records.length === 0) {
      const last = delList.pop();
      this.records.push(last);
    }

    delList.forEach(delItem => {
      if (delItem.destroy) {
        delItem.destroy();
      }
    });
    this.setActive(oItem);
  }

  setActive(oItem) {
    var _this$records$;

    const oStore = oItem == null ? void 0 : oItem.store;
    const store = (_this$records$ = this.records[0]) == null ? void 0 : _this$records$.store;

    if (store === oStore) {
      store == null ? void 0 : store.setActive(true);
    } else {
      oStore == null ? void 0 : oStore.setActive(false);
      store == null ? void 0 : store.setActive(true);
    }
  }

}

class RouteRecord {
  constructor(location, pageStack) {
    _defineProperty(this, "destroy", void 0);

    _defineProperty(this, "key", void 0);

    _defineProperty(this, "recordKey", void 0);

    this.location = location;
    this.pageStack = pageStack;
    this.recordKey = env.isServer ? '0' : ++RouteRecord.id + '';
    this.key = [pageStack.stackkey, this.recordKey].join('-');
  }

}

_defineProperty(RouteRecord, "id", 0);

class PageStack extends HistoryStack {
  constructor(windowStack, store) {
    super(20);

    _defineProperty(this, "stackkey", void 0);

    this.windowStack = windowStack;
    this.store = store;
    this.stackkey = env.isServer ? '0' : ++PageStack.id + '';
  }

  push(location) {
    const newRecord = new RouteRecord(location, this);

    this._push(newRecord);

    return newRecord;
  }

  replace(location) {
    const newRecord = new RouteRecord(location, this);

    this._replace(newRecord);

    return newRecord;
  }

  relaunch(location) {
    const newRecord = new RouteRecord(location, this);

    this._relaunch(newRecord);

    return newRecord;
  }

  findRecordByKey(recordKey) {
    for (let i = 0, k = this.records.length; i < k; i++) {
      const item = this.records[i];

      if (item.recordKey === recordKey) {
        return [item, i];
      }
    }

    return undefined;
  }

  destroy() {
    this.store.destroy();
  }

}

_defineProperty(PageStack, "id", 0);

class WindowStack extends HistoryStack {
  constructor() {
    super(routeConfig.maxHistory);
  }

  getCurrentPages() {
    return this.records.map(item => {
      const store = item.store;
      const record = item.getCurrentItem();
      const pagename = record.location.getPagename();
      return {
        pagename,
        store,
        pageComponent: routeMeta.pageComponents[pagename]
      };
    });
  }

  push(location) {
    const curHistory = this.getCurrentItem();
    const routeState = {
      pagename: location.getPagename(),
      params: location.getParams(),
      action: RouteHistoryAction.RELAUNCH,
      key: ''
    };
    const store = forkStore(curHistory.store, routeState);
    const newHistory = new PageStack(this, store);
    const newRecord = new RouteRecord(location, newHistory);
    newHistory.startup(newRecord);

    this._push(newHistory);

    return newRecord;
  }

  replace(location) {
    const curHistory = this.getCurrentItem();
    return curHistory.relaunch(location);
  }

  relaunch(location) {
    const curHistory = this.getCurrentItem();
    const newRecord = curHistory.relaunch(location);

    this._relaunch(curHistory);

    return newRecord;
  }

  countBack(delta) {
    const historyStacks = this.records;
    const backSteps = [0, 0];

    for (let i = 0, k = historyStacks.length; i < k; i++) {
      const pageStack = historyStacks[i];
      const recordNum = pageStack.getLength();
      delta = delta - recordNum;

      if (delta > 0) {
        backSteps[0]++;
      } else if (delta === 0) {
        backSteps[0]++;
        break;
      } else {
        backSteps[1] = recordNum + delta;
        break;
      }
    }

    return backSteps;
  }

  testBack(stepOrKey, rootOnly) {
    if (typeof stepOrKey === 'string') {
      return this.findRecordByKey(stepOrKey);
    }

    const delta = stepOrKey;

    if (delta === 0) {
      const record = this.getCurrentItem().getCurrentItem();
      return {
        record,
        overflow: false,
        index: [0, 0]
      };
    }

    if (rootOnly) {
      if (delta < 0 || delta >= this.records.length) {
        const record = this.getEarliestItem().getCurrentItem();
        return {
          record,
          overflow: !(delta < 0),
          index: [this.records.length - 1, 0]
        };
      } else {
        const record = this.getItemAt(delta).getCurrentItem();
        return {
          record,
          overflow: false,
          index: [delta, 0]
        };
      }
    }

    if (delta < 0) {
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {
        record,
        overflow: false,
        index: [this.records.length - 1, pageStack.records.length - 1]
      };
    }

    const [rootDelta, recordDelta] = this.countBack(delta);

    if (rootDelta < this.records.length) {
      const record = this.getItemAt(rootDelta).getItemAt(recordDelta);
      return {
        record,
        overflow: false,
        index: [rootDelta, recordDelta]
      };
    } else {
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {
        record,
        overflow: true,
        index: [this.records.length - 1, pageStack.records.length - 1]
      };
    }
  }

  findRecordByKey(key) {
    const arr = key.split('-');

    for (let i = 0, k = this.records.length; i < k; i++) {
      const pageStack = this.records[i];

      if (pageStack.stackkey === arr[0]) {
        const item = pageStack.findRecordByKey(arr[1]);

        if (item) {
          return {
            record: item[0],
            index: [i, item[1]],
            overflow: false
          };
        }
      }
    }

    return {
      record: this.getCurrentItem().getCurrentItem(),
      index: [0, 0],
      overflow: true
    };
  }

}

function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __extendDefault(target, def) {
  const clone = {};
  Object.keys(def).forEach(function (key) {
    if (target[key] === undefined) {
      clone[key] = def[key];
    } else {
      const tval = target[key];
      const dval = def[key];

      if (isPlainObject(tval) && isPlainObject(dval) && tval !== dval) {
        clone[key] = __extendDefault(tval, dval);
      } else {
        clone[key] = tval;
      }
    }
  });
  return clone;
}

function extendDefault(target, def) {
  if (!isPlainObject(target)) {
    target = {};
  }

  if (!isPlainObject(def)) {
    def = {};
  }

  return __extendDefault(target, def);
}

function __excludeDefault(data, def) {
  const result = {};
  let hasSub = false;
  Object.keys(data).forEach(key => {
    let value = data[key];
    const defaultValue = def[key];

    if (value !== defaultValue) {
      if (typeof value === typeof defaultValue && isPlainObject(value)) {
        value = __excludeDefault(value, defaultValue);
      }

      if (value !== undefined) {
        hasSub = true;
        result[key] = value;
      }
    }
  });

  if (hasSub) {
    return result;
  }

  return undefined;
}

function excludeDefault(data, def, keepTopLevel) {
  if (!isPlainObject(data)) {
    return {};
  }

  if (!isPlainObject(def)) {
    return data;
  }

  const filtered = __excludeDefault(data, def);

  if (keepTopLevel) {
    const result = {};
    Object.keys(data).forEach(function (key) {
      result[key] = filtered && filtered[key] !== undefined ? filtered[key] : {};
    });
    return result;
  }

  return filtered || {};
}

class LocationCaches {
  constructor(limit) {
    _defineProperty(this, "length", 0);

    _defineProperty(this, "first", void 0);

    _defineProperty(this, "last", void 0);

    _defineProperty(this, "data", {});

    this.limit = limit;
  }

  getItem(key) {
    const data = this.data;
    const cache = data[key];

    if (cache && cache.next) {
      const nextCache = cache.next;
      delete data[key];
      data[key] = cache;
      nextCache.prev = cache.prev;
      cache.prev = this.last;
      cache.next = undefined;
      this.last = cache;

      if (this.first === cache) {
        this.first = nextCache;
      }
    }

    return cache == null ? void 0 : cache.payload;
  }

  setItem(key, item) {
    const data = this.data;

    if (data[key]) {
      data[key].payload = item;
      return;
    }

    const cache = {
      key,
      prev: this.last,
      next: undefined,
      payload: item
    };
    data[key] = cache;

    if (this.last) {
      this.last.next = cache;
    }

    this.last = cache;

    if (!this.first) {
      this.first = cache;
    }

    const length = this.length + 1;

    if (length > this.limit) {
      const firstCache = this.first;
      delete data[firstCache.key];
      this.first = firstCache.next;
    } else {
      this.length = length;
    }

    return;
  }

}

const locationCaches = new LocationCaches(routeConfig.maxLocationCache);
const urlParser = {
  type: {
    e: 'e',
    s: 's',
    n: 'n'
  },

  getNativeUrl(pathname, query) {
    return this.getUrl('n', pathname, query ? `${routeConfig.paramsKey}=${encodeURIComponent(query)}` : '');
  },

  getEluxUrl(pathmatch, args) {
    const search = this.stringifySearch(args);
    return this.getUrl('e', pathmatch, search);
  },

  getStateUrl(pagename, payload) {
    const search = this.stringifySearch(payload);
    return this.getUrl('s', pagename, search);
  },

  parseNativeUrl(nurl) {
    const pathname = this.getPath(nurl);
    const arr = nurl.split(`${routeConfig.paramsKey}=`);
    const query = arr[1] || '';
    return {
      pathname,
      query: decodeURIComponent(query)
    };
  },

  parseStateUrl(surl) {
    const pagename = this.getPath(surl);
    const search = this.getSearch(surl);
    const payload = this.parseSearch(search);
    return {
      pagename,
      payload
    };
  },

  getUrl(type, path, search) {
    return [type, ':/', path, search && search !== '{}' ? `?${search}` : ''].join('');
  },

  getPath(url) {
    return url.substr(3).split('?', 1)[0];
  },

  getSearch(url) {
    return url.replace(/^.+?(\?|$)/, '');
  },

  stringifySearch(data) {
    return Object.keys(data).length ? JSON.stringify(data) : '';
  },

  parseSearch(search) {
    return routeJsonParse(search);
  },

  checkUrl(url) {
    const type = this.type[url.charAt(0)] || 'e';
    let path, search;
    const arr = url.split('://', 2);

    if (arr.length > 1) {
      arr.shift();
    }

    path = arr[0].split('?', 1)[0];
    path = this.checkPath(path);

    if (type === 'e' || type === 's') {
      search = url.replace(/^.+?(\?|$)/, '');

      if (search === '{}' || search.charAt(0) !== '{' || search.charAt(search.length - 1) !== '}') {
        search = '';
      }
    } else {
      let arr = url.split(`${routeConfig.paramsKey}=`, 2);

      if (arr[1]) {
        arr = arr[1].split('&', 1);

        if (arr[0]) {
          search = `${routeConfig.paramsKey}=${arr[0]}`;
        } else {
          search = '';
        }
      } else {
        search = '';
      }
    }

    return this.getUrl(type, path, search);
  },

  checkPath(path) {
    path = `/${path.replace(/^\/+|\/+$/g, '')}`;

    if (path === '/') {
      path = '/index';
    }

    return path;
  },

  withoutProtocol(url) {
    return url.replace(/^[^/]+?:\//, '');
  }

};

class LocationTransform {
  constructor(url, data) {
    _defineProperty(this, "_pagename", void 0);

    _defineProperty(this, "_payload", void 0);

    _defineProperty(this, "_params", void 0);

    _defineProperty(this, "_eurl", void 0);

    _defineProperty(this, "_nurl", void 0);

    _defineProperty(this, "_surl", void 0);

    _defineProperty(this, "_minData", void 0);

    this.url = url;
    data && this.update(data);
  }

  getPayload() {
    if (!this._payload) {
      const search = urlParser.getSearch(this.url);
      const args = urlParser.parseSearch(search);
      const {
        notfoundPagename
      } = routeConfig;
      const {
        pagenameMap
      } = routeMeta;
      const pagename = this.getPagename();
      const pathmatch = urlParser.getPath(this.url);
      const _pagename = `${pagename}/`;
      let arrArgs;

      if (pagename === notfoundPagename) {
        arrArgs = [pathmatch];
      } else {
        const _pathmatch = `${pathmatch}/`;
        arrArgs = _pathmatch.replace(_pagename, '').split('/').map(item => item ? decodeURIComponent(item) : undefined);
      }

      const pathArgs = pagenameMap[_pagename] ? pagenameMap[_pagename].pathToParams(arrArgs) : {};
      this._payload = deepMerge({}, pathArgs, args);
    }

    return this._payload;
  }

  getMinData() {
    if (!this._minData) {
      const eluxUrl = this.getEluxUrl();

      if (!this._minData) {
        const pathmatch = urlParser.getPath(eluxUrl);
        const search = urlParser.getSearch(eluxUrl);
        this._minData = {
          pathmatch,
          args: urlParser.parseSearch(search)
        };
      }
    }

    return this._minData;
  }

  toStringArgs(arr) {
    return arr.map(item => {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  }

  update(data) {
    Object.keys(data).forEach(key => {
      if (data[key] && !this[key]) {
        this[key] = data[key];
      }
    });
  }

  getPagename() {
    if (!this._pagename) {
      const {
        notfoundPagename
      } = routeConfig;
      const {
        pagenameList
      } = routeMeta;
      const pathmatch = urlParser.getPath(this.url);
      const __pathmatch = `${pathmatch}/`;

      const __pagename = pagenameList.find(name => __pathmatch.startsWith(name));

      this._pagename = __pagename ? __pagename.substr(0, __pagename.length - 1) : notfoundPagename;
    }

    return this._pagename;
  }

  getStateUrl() {
    if (!this._surl) {
      this._surl = urlParser.getStateUrl(this.getPagename(), this.getPayload());
    }

    return this._surl;
  }

  getEluxUrl() {
    if (!this._eurl) {
      const payload = this.getPayload();
      const minPayload = excludeDefault(payload, routeMeta.defaultParams, true);
      const pagename = this.getPagename();
      const {
        pagenameMap
      } = routeMeta;
      const _pagename = `${pagename}/`;
      let pathmatch;
      let pathArgs;

      if (pagenameMap[_pagename]) {
        const pathArgsArr = this.toStringArgs(pagenameMap[_pagename].paramsToPath(minPayload));
        pathmatch = _pagename + pathArgsArr.map(item => item ? encodeURIComponent(item) : '').join('/');
        pathmatch = pathmatch.replace(/\/*$/, '');
        pathArgs = pagenameMap[_pagename].pathToParams(pathArgsArr);
      } else {
        pathmatch = '/index';
        pathArgs = {};
      }

      const args = excludeDefault(minPayload, pathArgs, false);
      this._minData = {
        pathmatch,
        args
      };
      this._eurl = urlParser.getEluxUrl(pathmatch, args);
    }

    return this._eurl;
  }

  getNativeUrl(withoutProtocol) {
    if (!this._nurl) {
      const {
        nativeLocationMap
      } = routeMeta;
      const minData = this.getMinData();
      const {
        pathname,
        query
      } = nativeLocationMap.out(minData);
      this._nurl = urlParser.getNativeUrl(pathname, query);
    }

    return withoutProtocol ? urlParser.withoutProtocol(this._nurl) : this._nurl;
  }

  getParams() {
    if (!this._params) {
      const payload = this.getPayload();
      const def = routeMeta.defaultParams;
      const asyncLoadModules = Object.keys(payload).filter(moduleName => def[moduleName] === undefined);
      const modulesOrPromise = getModuleList(asyncLoadModules);

      if (isPromise(modulesOrPromise)) {
        return modulesOrPromise.then(modules => {
          modules.forEach(module => {
            def[module.moduleName] = module.routeParams;
          });

          const _params = assignDefaultData(payload);

          const modulesMap = moduleExists();
          Object.keys(_params).forEach(moduleName => {
            if (!modulesMap[moduleName]) {
              delete _params[moduleName];
            }
          });
          this._params = _params;
          return _params;
        });
      }

      const modules = modulesOrPromise;
      modules.forEach(module => {
        def[module.moduleName] = module.routeParams;
      });

      const _params = assignDefaultData(payload);

      const modulesMap = moduleExists();
      Object.keys(_params).forEach(moduleName => {
        if (!modulesMap[moduleName]) {
          delete _params[moduleName];
        }
      });
      this._params = _params;
      return _params;
    } else {
      return this._params;
    }
  }

}

function location(dataOrUrl) {
  if (typeof dataOrUrl === 'string') {
    const url = urlParser.checkUrl(dataOrUrl);
    const type = url.charAt(0);

    if (type === 'e') {
      return createFromElux(url);
    } else if (type === 's') {
      return createFromState(url);
    } else {
      return createFromNative(url);
    }
  } else if (dataOrUrl['pathmatch']) {
    const {
      pathmatch,
      args
    } = dataOrUrl;
    const eurl = urlParser.getEluxUrl(urlParser.checkPath(pathmatch), args);
    return createFromElux(eurl);
  } else if (dataOrUrl['pagename']) {
    const data = dataOrUrl;
    const {
      pagename,
      payload
    } = data;
    const surl = urlParser.getStateUrl(urlParser.checkPath(pagename), payload);
    return createFromState(surl, data);
  } else {
    const data = dataOrUrl;
    const {
      pathname,
      query
    } = data;
    const nurl = urlParser.getNativeUrl(urlParser.checkPath(pathname), query);
    return createFromNative(nurl, data);
  }
}

function createFromElux(eurl, data) {
  let item = locationCaches.getItem(eurl);

  if (!item) {
    item = new LocationTransform(eurl, {
      _eurl: eurl,
      _nurl: data == null ? void 0 : data.nurl
    });
    locationCaches.setItem(eurl, item);
  } else if (!item._eurl || !item._nurl) {
    item.update({
      _eurl: eurl,
      _nurl: data == null ? void 0 : data.nurl
    });
  }

  return item;
}

function createFromNative(nurl, data) {
  let eurl = locationCaches.getItem(nurl);

  if (!eurl) {
    const {
      nativeLocationMap
    } = routeMeta;
    data = data || urlParser.parseNativeUrl(nurl);
    const {
      pathmatch,
      args
    } = nativeLocationMap.in(data);
    eurl = urlParser.getEluxUrl(pathmatch, args);
    locationCaches.setItem(nurl, eurl);
  }

  return createFromElux(eurl, {
    nurl
  });
}

function createFromState(surl, data) {
  const eurl = `e${surl.substr(1)}`;
  let item = locationCaches.getItem(eurl);

  if (!item) {
    data = data || urlParser.parseStateUrl(surl);
    item = new LocationTransform(eurl, {
      _pagename: data.pagename,
      _payload: data.payload
    });
    locationCaches.setItem(eurl, item);
  } else if (!item._pagename || !item._payload) {
    data = data || urlParser.parseStateUrl(surl);
    item.update({
      _pagename: data.pagename,
      _payload: data.payload
    });
  }

  return item;
}

function assignDefaultData(data) {
  const def = routeMeta.defaultParams;
  return Object.keys(data).reduce((params, moduleName) => {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

const defaultNativeLocationMap = {
  in(nativeLocation) {
    const {
      pathname,
      query
    } = nativeLocation;
    return {
      pathmatch: pathname,
      args: urlParser.parseSearch(query)
    };
  },

  out(eluxLocation) {
    const {
      pathmatch,
      args
    } = eluxLocation;
    return {
      pathname: pathmatch,
      query: urlParser.stringifySearch(args)
    };
  }

};
function createRouteModule(moduleName, pagenameMap, nativeLocationMap = defaultNativeLocationMap) {
  setCoreConfig({
    RouteModuleName: moduleName
  });
  const pagenames = Object.keys(pagenameMap);

  const _pagenameMap = pagenames.sort((a, b) => b.length - a.length).reduce((map, pagename) => {
    const fullPagename = `/${pagename}/`.replace(/^\/+|\/+$/g, '/');
    const {
      pathToParams,
      paramsToPath,
      pageComponent
    } = pagenameMap[pagename];
    map[fullPagename] = {
      pathToParams,
      paramsToPath
    };
    routeMeta.pageComponents[pagename] = pageComponent;
    return map;
  }, {});

  routeMeta.pagenameMap = _pagenameMap;
  routeMeta.pagenameList = Object.keys(_pagenameMap);
  routeMeta.nativeLocationMap = nativeLocationMap;
  return exportModule(moduleName, RouteModel, {}, '/index');
}

class BaseNativeRouter {
  constructor() {
    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "eluxRouter", void 0);
  }

  onChange(key) {
    if (this.curTask) {
      this.curTask();
      this.curTask = undefined;
      return false;
    }

    return key !== this.eluxRouter.routeState.key;
  }

  startup(router) {
    this.eluxRouter = router;
  }

  execute(method, location, ...args) {
    return new Promise((resolve, reject) => {
      this.curTask = resolve;
      const result = this[method](location, ...args);

      if (!result) {
        resolve();
        this.curTask = undefined;
      } else if (isPromise(result)) {
        result.catch(e => {
          reject(e);
          env.console.error(e);
          this.curTask = undefined;
        });
      }
    });
  }

}
class BaseEluxRouter extends MultipleDispatcher {
  constructor(nativeUrl, nativeRouter, nativeData) {
    super();

    _defineProperty(this, "_curTask", void 0);

    _defineProperty(this, "_taskList", []);

    _defineProperty(this, "location", void 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "name", coreConfig.RouteModuleName);

    _defineProperty(this, "initialize", void 0);

    _defineProperty(this, "windowStack", new WindowStack());

    _defineProperty(this, "latestState", {});

    _defineProperty(this, "_taskComplete", () => {
      const task = this._taskList.shift();

      if (task) {
        this.executeTask(task);
      } else {
        this._curTask = undefined;
      }
    });

    this.nativeRouter = nativeRouter;
    this.nativeData = nativeData;
    nativeRouter.startup(this);
    const location$1 = location(nativeUrl);
    this.location = location$1;
    const pagename = location$1.getPagename();
    const paramsOrPromise = location$1.getParams();

    const callback = params => {
      const routeState = {
        pagename,
        params,
        action: RouteHistoryAction.RELAUNCH,
        key: ''
      };
      this.routeState = routeState;
      return routeState;
    };

    if (isPromise(paramsOrPromise)) {
      this.initialize = paramsOrPromise.then(callback);
    } else {
      this.initialize = Promise.resolve(callback(paramsOrPromise));
    }
  }

  startup(store) {
    const pageStack = new PageStack(this.windowStack, store);
    const routeRecord = new RouteRecord(this.location, pageStack);
    pageStack.startup(routeRecord);
    this.windowStack.startup(pageStack);
    this.routeState.key = routeRecord.key;
  }

  getCurrentPages() {
    return this.windowStack.getCurrentPages();
  }

  getCurrentStore() {
    return this.windowStack.getCurrentItem().store;
  }

  getStoreList() {
    return this.windowStack.getItems().map(({
      store
    }) => store);
  }

  getHistoryLength(root) {
    return root ? this.windowStack.getLength() : this.windowStack.getCurrentItem().getLength();
  }

  findRecordByKey(recordKey) {
    const {
      record: {
        key,
        location
      },
      overflow,
      index
    } = this.windowStack.findRecordByKey(recordKey);
    return {
      overflow,
      index,
      record: {
        key,
        location
      }
    };
  }

  findRecordByStep(delta, rootOnly) {
    const {
      record: {
        key,
        location
      },
      overflow,
      index
    } = this.windowStack.testBack(delta, rootOnly);
    return {
      overflow,
      index,
      record: {
        key,
        location
      }
    };
  }

  extendCurrent(params, pagename) {
    return {
      payload: deepMerge({}, this.routeState.params, params),
      pagename: pagename || this.routeState.pagename
    };
  }

  relaunch(dataOrUrl, root = false, nonblocking, nativeCaller = false) {
    return this.addTask(this._relaunch.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  async _relaunch(dataOrUrl, root, nativeCaller) {
    const location$1 = location(dataOrUrl);
    const pagename = location$1.getPagename();
    const params = await location$1.getParams();
    let key = '';
    const routeState = {
      pagename,
      params,
      action: RouteHistoryAction.RELAUNCH,
      key
    };
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

    if (root) {
      key = this.windowStack.relaunch(location$1).key;
    } else {
      key = this.windowStack.getCurrentItem().relaunch(location$1).key;
    }

    routeState.key = key;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      await this.nativeRouter.execute('relaunch', location$1, key);
    }

    this.location = location$1;
    this.routeState = routeState;
    const cloneState = deepClone(routeState);
    this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    await this.dispatch('change', {
      routeState: cloneState,
      root
    });
  }

  push(dataOrUrl, root = false, nonblocking, nativeCaller = false) {
    return this.addTask(this._push.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  async _push(dataOrUrl, root, nativeCaller) {
    const location$1 = location(dataOrUrl);
    const pagename = location$1.getPagename();
    const params = await location$1.getParams();
    let key = '';
    const routeState = {
      pagename,
      params,
      action: RouteHistoryAction.PUSH,
      key
    };
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

    if (root) {
      key = this.windowStack.push(location$1).key;
    } else {
      key = this.windowStack.getCurrentItem().push(location$1).key;
    }

    routeState.key = key;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      await this.nativeRouter.execute('push', location$1, key);
    }

    this.location = location$1;
    this.routeState = routeState;
    const cloneState = deepClone(routeState);

    if (root) {
      await reinitApp(this.getCurrentStore());
    } else {
      this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    }

    await this.dispatch('change', {
      routeState: cloneState,
      root
    });
  }

  replace(dataOrUrl, root = false, nonblocking, nativeCaller = false) {
    return this.addTask(this._replace.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  async _replace(dataOrUrl, root, nativeCaller) {
    const location$1 = location(dataOrUrl);
    const pagename = location$1.getPagename();
    const params = await location$1.getParams();
    let key = '';
    const routeState = {
      pagename,
      params,
      action: RouteHistoryAction.REPLACE,
      key
    };
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

    if (root) {
      key = this.windowStack.replace(location$1).key;
    } else {
      key = this.windowStack.getCurrentItem().replace(location$1).key;
    }

    routeState.key = key;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      await this.nativeRouter.execute('replace', location$1, key);
    }

    this.location = location$1;
    this.routeState = routeState;
    const cloneState = deepClone(routeState);
    this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    await this.dispatch('change', {
      routeState: cloneState,
      root
    });
  }

  back(stepOrKey = 1, root = false, options, nonblocking, nativeCaller = false) {
    if (!stepOrKey) {
      return;
    }

    return this.addTask(this._back.bind(this, stepOrKey, root, options || {}, nativeCaller), nonblocking);
  }

  async _back(stepOrKey, root, options, nativeCaller) {
    const {
      record,
      overflow,
      index
    } = this.windowStack.testBack(stepOrKey, root);

    if (overflow) {
      const url = options.overflowRedirect || routeConfig.indexUrl;
      env.setTimeout(() => this.relaunch(url, root), 0);
      return;
    }

    if (!index[0] && !index[1]) {
      return;
    }

    const key = record.key;
    const location = record.location;
    const pagename = location.getPagename();
    const params = deepMerge({}, location.getParams(), options.payload);
    const routeState = {
      key,
      pagename,
      params,
      action: RouteHistoryAction.BACK
    };
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

    if (index[0]) {
      root = true;
      this.windowStack.back(index[0]);
    }

    if (index[1]) {
      this.windowStack.getCurrentItem().back(index[1]);
    }

    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      await this.nativeRouter.execute('back', location, index, key);
    }

    this.location = location;
    this.routeState = routeState;
    const cloneState = deepClone(routeState);
    this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    await this.dispatch('change', {
      routeState,
      root
    });
  }

  executeTask(task) {
    this._curTask = task;
    task().finally(this._taskComplete);
  }

  addTask(execute, nonblocking) {
    if (env.isServer) {
      return;
    }

    if (this._curTask && !nonblocking) {
      return;
    }

    return new Promise((resolve, reject) => {
      const task = () => execute().then(resolve, reject);

      if (this._curTask) {
        this._taskList.push(task);
      } else {
        this.executeTask(task);
      }
    });
  }

  destroy() {
    this.nativeRouter.destroy();
  }

}
function toURouter(router) {
  const {
    nativeData,
    location,
    routeState,
    initialize,
    addListener,
    getCurrentPages,
    findRecordByKey,
    findRecordByStep,
    getHistoryLength,
    extendCurrent,
    relaunch,
    push,
    replace,
    back
  } = router;
  return {
    nativeData,
    location,
    routeState,
    initialize,
    addListener: addListener.bind(router),
    getCurrentPages: getCurrentPages.bind(router),
    findRecordByKey: findRecordByKey.bind(router),
    findRecordByStep: findRecordByStep.bind(router),
    extendCurrent: extendCurrent.bind(router),
    getHistoryLength: getHistoryLength.bind(router),
    relaunch: relaunch.bind(router),
    push: push.bind(router),
    replace: replace.bind(router),
    back: back.bind(router)
  };
}

const appMeta = {
  router: null,
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};
const appConfig = {
  loadComponent: null,
  useRouter: null,
  useStore: null
};
const setAppConfig = buildConfigSetter(appConfig);
function setUserConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);

  if (conf.disableNativeRouter) {
    setRouteConfig({
      notifyNativeRouter: {
        root: false,
        internal: false
      }
    });
  }
}
function createBaseApp(ins, router, render, storeInitState, storeMiddlewares = [], storeLogger) {
  const urouter = toURouter(router);
  appMeta.router = urouter;
  return Object.assign(ins, {
    render({
      id = 'root',
      ssrKey = 'eluxInitStore',
      viewName = 'main'
    } = {}) {
      const {
        state,
        components = []
      } = env[ssrKey] || {};
      return router.initialize.then(routeState => {
        const storeData = {
          [coreConfig.RouteModuleName]: routeState,
          ...state
        };
        const {
          store,
          AppView,
          setup
        } = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName, components);
        return setup.then(() => {
          render(id, AppView, {
            deps: {},
            router: urouter,
            documentHead: ''
          }, !!env[ssrKey], ins, store);
        });
      });
    }

  });
}
function createBaseSSR(ins, router, render, storeInitState, storeMiddlewares = [], storeLogger) {
  const urouter = toURouter(router);
  appMeta.router = urouter;
  return Object.assign(ins, {
    render({
      id = 'root',
      ssrKey = 'eluxInitStore',
      viewName = 'main'
    } = {}) {
      return router.initialize.then(routeState => {
        const storeData = {
          [coreConfig.RouteModuleName]: routeState
        };
        const {
          store,
          AppView,
          setup
        } = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName);
        return setup.then(() => {
          const state = store.getState();
          const eluxContext = {
            deps: {},
            router: urouter,
            documentHead: ''
          };
          return render(id, AppView, eluxContext, ins, store).then(html => {
            const match = appMeta.SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

            if (match) {
              return appMeta.SSRTPL.replace('</head>', `\r\n${eluxContext.documentHead}\r\n<script>window.${ssrKey} = ${JSON.stringify({
                state,
                components: Object.keys(eluxContext.deps)
              })};</script>\r\n</head>`).replace(match[0], match[0] + html);
            }

            return html;
          });
        });
      });
    }

  });
}
function getApi(demoteForProductionOnly, injectActions) {
  const modules = getModuleMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: (...args) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    useRouter: appConfig.useRouter,
    useStore: appConfig.useStore,
    GetRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use getRouter() instead';
      }

      return appMeta.router;
    },
    LoadComponent: appConfig.loadComponent,
    Modules: modules
  };
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
} // About 1.5x faster than the two-arg version of Array#splice()


function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }

  list.pop();
} // This implementation is based heavily on node's url.parse


function resolvePathname(to, from) {
  if (from === undefined) from = '';
  var toParts = to && to.split('/') || [];
  var fromParts = from && from.split('/') || [];
  var isToAbs = to && isAbsolute(to);
  var isFromAbs = from && isAbsolute(from);
  var mustEndAbs = isToAbs || isFromAbs;

  if (to && isAbsolute(to)) {
    // to is absolute
    fromParts = toParts;
  } else if (toParts.length) {
    // to is relative, drop the filename
    fromParts.pop();
    fromParts = fromParts.concat(toParts);
  }

  if (!fromParts.length) return '/';
  var hasTrailingSlash;

  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;

  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) fromParts.unshift('..');
  if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');
  var result = fromParts.join('/');
  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';
  return result;
}

var isProduction$1 = process.env.NODE_ENV === 'production';

function warning(condition, message) {
  if (!isProduction$1) {
    if (condition) {
      return;
    }

    var text = "Warning: " + message;

    if (typeof console !== 'undefined') {
      console.warn(text);
    }

    try {
      throw Error(text);
    } catch (x) {}
  }
}

var isProduction = process.env.NODE_ENV === 'production';
var prefix = 'Invariant failed';

function invariant(condition, message) {
  if (condition) {
    return;
  }

  if (isProduction) {
    throw new Error(prefix);
  }

  throw new Error(prefix + ": " + (message || ''));
}

function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

function hasBasename(path, prefix) {
  return path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 && '/?#'.indexOf(path.charAt(prefix.length)) !== -1;
}

function stripBasename(path, prefix) {
  return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
}

function stripTrailingSlash(path) {
  return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
}

function parsePath(path) {
  var pathname = path || '/';
  var search = '';
  var hash = '';
  var hashIndex = pathname.indexOf('#');

  if (hashIndex !== -1) {
    hash = pathname.substr(hashIndex);
    pathname = pathname.substr(0, hashIndex);
  }

  var searchIndex = pathname.indexOf('?');

  if (searchIndex !== -1) {
    search = pathname.substr(searchIndex);
    pathname = pathname.substr(0, searchIndex);
  }

  return {
    pathname: pathname,
    search: search === '?' ? '' : search,
    hash: hash === '#' ? '' : hash
  };
}

function createPath(location) {
  var pathname = location.pathname,
      search = location.search,
      hash = location.hash;
  var path = pathname || '/';
  if (search && search !== '?') path += search.charAt(0) === '?' ? search : "?" + search;
  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : "#" + hash;
  return path;
}

function createLocation(path, state, key, currentLocation) {
  var location;

  if (typeof path === 'string') {
    // Two-arg form: push(path, state)
    location = parsePath(path);
    location.state = state;
  } else {
    // One-arg form: push(location)
    location = _extends({}, path);
    if (location.pathname === undefined) location.pathname = '';

    if (location.search) {
      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
    } else {
      location.search = '';
    }

    if (location.hash) {
      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
    } else {
      location.hash = '';
    }

    if (state !== undefined && location.state === undefined) location.state = state;
  }

  try {
    location.pathname = decodeURI(location.pathname);
  } catch (e) {
    if (e instanceof URIError) {
      throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
    } else {
      throw e;
    }
  }

  if (key) location.key = key;

  if (currentLocation) {
    // Resolve incomplete/relative pathname relative to current location.
    if (!location.pathname) {
      location.pathname = currentLocation.pathname;
    } else if (location.pathname.charAt(0) !== '/') {
      location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
    }
  } else {
    // When there is no prior location and pathname is empty, set it to /
    if (!location.pathname) {
      location.pathname = '/';
    }
  }

  return location;
}

function createTransitionManager() {
  var prompt = null;

  function setPrompt(nextPrompt) {
    process.env.NODE_ENV !== "production" ? warning(prompt == null, 'A history supports only one prompt at a time') : void 0;
    prompt = nextPrompt;
    return function () {
      if (prompt === nextPrompt) prompt = null;
    };
  }

  function confirmTransitionTo(location, action, getUserConfirmation, callback) {
    // TODO: If another transition starts while we're still confirming
    // the previous one, we may end up in a weird state. Figure out the
    // best way to handle this.
    if (prompt != null) {
      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

      if (typeof result === 'string') {
        if (typeof getUserConfirmation === 'function') {
          getUserConfirmation(result, callback);
        } else {
          process.env.NODE_ENV !== "production" ? warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;
          callback(true);
        }
      } else {
        // Return false from a transition hook to cancel the transition.
        callback(result !== false);
      }
    } else {
      callback(true);
    }
  }

  var listeners = [];

  function appendListener(fn) {
    var isActive = true;

    function listener() {
      if (isActive) fn.apply(void 0, arguments);
    }

    listeners.push(listener);
    return function () {
      isActive = false;
      listeners = listeners.filter(function (item) {
        return item !== listener;
      });
    };
  }

  function notifyListeners() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    listeners.forEach(function (listener) {
      return listener.apply(void 0, args);
    });
  }

  return {
    setPrompt: setPrompt,
    confirmTransitionTo: confirmTransitionTo,
    appendListener: appendListener,
    notifyListeners: notifyListeners
  };
}

var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

function getConfirmation(message, callback) {
  callback(window.confirm(message)); // eslint-disable-line no-alert
}
/**
 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
 *
 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
 */


function supportsHistory() {
  var ua = window.navigator.userAgent;
  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;
  return window.history && 'pushState' in window.history;
}
/**
 * Returns true if browser fires popstate on hash change.
 * IE10 and IE11 do not.
 */


function supportsPopStateOnHashChange() {
  return window.navigator.userAgent.indexOf('Trident') === -1;
}
/**
 * Returns true if a given popstate event is an extraneous WebKit event.
 * Accounts for the fact that Chrome on iOS fires real popstate events
 * containing undefined state when pressing the back button.
 */


function isExtraneousPopstateEvent(event) {
  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
}

var PopStateEvent = 'popstate';
var HashChangeEvent = 'hashchange';

function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (e) {
    // IE 11 sometimes throws when accessing window.history.state
    // See https://github.com/ReactTraining/history/pull/289
    return {};
  }
}
/**
 * Creates a history object that uses the HTML5 history API including
 * pushState, replaceState, and the popstate event.
 */


function createBrowserHistory$1(props) {
  if (props === void 0) {
    props = {};
  }

  !canUseDOM ? process.env.NODE_ENV !== "production" ? invariant(false, 'Browser history needs a DOM') : invariant(false) : void 0;
  var globalHistory = window.history;
  var canUseHistory = supportsHistory();
  var needsHashChangeListener = !supportsPopStateOnHashChange();
  var _props = props,
      _props$forceRefresh = _props.forceRefresh,
      forceRefresh = _props$forceRefresh === void 0 ? false : _props$forceRefresh,
      _props$getUserConfirm = _props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
      _props$keyLength = _props.keyLength,
      keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
  var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';

  function getDOMLocation(historyState) {
    var _ref = historyState || {},
        key = _ref.key,
        state = _ref.state;

    var _window$location = window.location,
        pathname = _window$location.pathname,
        search = _window$location.search,
        hash = _window$location.hash;
    var path = pathname + search + hash;
    process.env.NODE_ENV !== "production" ? warning(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') : void 0;
    if (basename) path = stripBasename(path, basename);
    return createLocation(path, state, key);
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  }

  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function handlePopState(event) {
    // Ignore extraneous popstate events in WebKit.
    if (isExtraneousPopstateEvent(event)) return;
    handlePop(getDOMLocation(event.state));
  }

  function handleHashChange() {
    handlePop(getDOMLocation(getHistoryState()));
  }

  var forceNextPop = false;

  function handlePop(location) {
    if (forceNextPop) {
      forceNextPop = false;
      setState();
    } else {
      var action = 'POP';
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (ok) {
          setState({
            action: action,
            location: location
          });
        } else {
          revertPop(location);
        }
      });
    }
  }

  function revertPop(fromLocation) {
    var toLocation = history.location; // TODO: We could probably make this more reliable by
    // keeping a list of keys we've seen in sessionStorage.
    // Instead, we just default to 0 for keys we don't know.

    var toIndex = allKeys.indexOf(toLocation.key);
    if (toIndex === -1) toIndex = 0;
    var fromIndex = allKeys.indexOf(fromLocation.key);
    if (fromIndex === -1) fromIndex = 0;
    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  }

  var initialLocation = getDOMLocation(getHistoryState());
  var allKeys = [initialLocation.key]; // Public interface

  function createHref(location) {
    return basename + createPath(location);
  }

  function push(path, state) {
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'PUSH';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key,
          state = location.state;

      if (canUseHistory) {
        globalHistory.pushState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.href = href;
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          var nextKeys = allKeys.slice(0, prevIndex + 1);
          nextKeys.push(location.key);
          allKeys = nextKeys;
          setState({
            action: action,
            location: location
          });
        }
      } else {
        process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;
        window.location.href = href;
      }
    });
  }

  function replace(path, state) {
    process.env.NODE_ENV !== "production" ? warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
    var action = 'REPLACE';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var href = createHref(location);
      var key = location.key,
          state = location.state;

      if (canUseHistory) {
        globalHistory.replaceState({
          key: key,
          state: state
        }, null, href);

        if (forceRefresh) {
          window.location.replace(href);
        } else {
          var prevIndex = allKeys.indexOf(history.location.key);
          if (prevIndex !== -1) allKeys[prevIndex] = location.key;
          setState({
            action: action,
            location: location
          });
        }
      } else {
        process.env.NODE_ENV !== "production" ? warning(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;
        window.location.replace(href);
      }
    });
  }

  function go(n) {
    globalHistory.go(n);
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  var listenerCount = 0;

  function checkDOMListeners(delta) {
    listenerCount += delta;

    if (listenerCount === 1 && delta === 1) {
      window.addEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.addEventListener(HashChangeEvent, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(PopStateEvent, handlePopState);
      if (needsHashChangeListener) window.removeEventListener(HashChangeEvent, handleHashChange);
    }
  }

  var isBlocked = false;

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    var unblock = transitionManager.setPrompt(prompt);

    if (!isBlocked) {
      checkDOMListeners(1);
      isBlocked = true;
    }

    return function () {
      if (isBlocked) {
        isBlocked = false;
        checkDOMListeners(-1);
      }

      return unblock();
    };
  }

  function listen(listener) {
    var unlisten = transitionManager.appendListener(listener);
    checkDOMListeners(1);
    return function () {
      checkDOMListeners(-1);
      unlisten();
    };
  }

  var history = {
    length: globalHistory.length,
    action: 'POP',
    location: initialLocation,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    block: block,
    listen: listen
  };
  return history;
}

setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: true
  }
});
function createServerHistory(url) {
  const [pathname, search] = url.split('?');
  return {
    push() {
      return undefined;
    },

    replace() {
      return undefined;
    },

    block() {
      return () => undefined;
    },

    location: {
      pathname,
      search
    }
  };
}
function createBrowserHistory() {
  return createBrowserHistory$1();
}
class BrowserNativeRouter extends BaseNativeRouter {
  constructor(_history) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    this._history = _history;
    const {
      root,
      internal
    } = routeConfig.notifyNativeRouter;

    if (root || internal) {
      this._unlistenHistory = this._history.block((locationData, action) => {
        if (action === 'POP') {
          env.setTimeout(() => this.eluxRouter.back(1), 100);
          return false;
        }

        return undefined;
      });
    }
  }

  push(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  }

  replace(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  }

  relaunch(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  }

  back(location, index, key) {
    if (!env.isServer) {
      this._history.replace(location.getNativeUrl(true));
    }

    return undefined;
  }

  destroy() {
    this._unlistenHistory && this._unlistenHistory();
  }

}
function createRouter(browserHistory, nativeData) {
  const browserNativeRouter = new BrowserNativeRouter(browserHistory);
  const {
    pathname,
    search
  } = browserHistory.location;
  return new BaseEluxRouter(urlParser.getUrl('n', pathname, search), browserNativeRouter, nativeData);
}

setCoreConfig({
  MutableData: true
});
setAppConfig({
  loadComponent,
  useRouter,
  useStore
});
function setConfig(conf) {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}
function createApp(moduleGetter, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  const app = createApp$1(Router);
  const history = createBrowserHistory();
  const router = createRouter(history, {});
  return createBaseApp(app, router, renderToDocument, reactive, storeMiddlewares, storeLogger);
}
function createSSR(moduleGetter, url, nativeData, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  const app = createSSRApp(Router);
  const history = createServerHistory(url);
  const router = createRouter(history, nativeData);
  return createBaseSSR(app, router, renderToString, reactive, storeMiddlewares, storeLogger);
}

export { BaseModel, DocumentHead, Else, EmptyModel, Link, LoadingState, Switch, createApp, createRouteModule, createSSR, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getComponent, getModule, isServer, loadModel, location, modelHotReplacement, reducer, routeJsonParse, setConfig, setLoading };
