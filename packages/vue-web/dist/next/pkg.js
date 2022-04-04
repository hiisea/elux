import { inject, createVNode, createTextVNode, h, defineAsyncComponent, defineComponent, shallowRef, ref, onBeforeUnmount, provide, Comment, Fragment, reactive, createApp as createApp$1, createSSRApp } from 'vue';
import { renderToString } from '@elux/vue-components/server';

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

function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}
function toPromise(resultOrPromise) {
  if (isPromise(resultOrPromise)) {
    return resultOrPromise;
  }

  return Promise.resolve(resultOrPromise);
}
function promiseCaseCallback(resultOrPromise, callback) {
  if (isPromise(resultOrPromise)) {
    return resultOrPromise.then(result => callback(result));
  }

  return callback(resultOrPromise);
}
function buildConfigSetter(data) {
  return config => Object.keys(data).forEach(key => {
    config[key] !== undefined && (data[key] = config[key]);
  });
}
function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
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
class SingleDispatcher {
  constructor() {
    this.listenerId = 0;
    this.listenerMap = {};
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
class TaskCounter extends SingleDispatcher {
  constructor(deferSecond) {
    super();
    this.list = [];
    this.ctimer = 0;
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
        this.dispatch('Start');
        this.ctimer = env.setTimeout(() => {
          this.ctimer = 0;

          if (this.list.length > 0) {
            this.dispatch('Depth');
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

        this.dispatch('Stop');
      }
    }

    return this;
  }

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
function isServer() {
  return env.isServer;
}

function isEluxComponent(data) {
  return data['__elux_component__'];
}
const MetaData = {
  moduleApiMap: null,
  moduleCaches: {},
  componentCaches: {},
  reducersMap: {},
  effectsMap: {},
  clientRouter: undefined
};
const coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  StageModuleName: 'stage',
  StageViewName: 'main',
  SSRDataKey: 'eluxSSRData',
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
  ModuleGetter: {},
  StoreInitState: () => ({}),
  StoreMiddlewares: [],
  StoreLogger: () => undefined,
  SetPageTitle: title => {
    if (env.document) {
      env.document.title = title;
    }
  },
  StoreProvider: undefined,
  LoadComponent: undefined,
  LoadComponentOnError: undefined,
  LoadComponentOnLoading: undefined,
  UseRouter: undefined,
  UseStore: undefined,
  AppRender: undefined
};
const setCoreConfig = buildConfigSetter(coreConfig);
function mergeState(target = {}, ...args) {
  if (coreConfig.MutableData) {
    return Object.assign(target, ...args);
  }

  return Object.assign({}, target, ...args);
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
function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: `${moduleName}${coreConfig.NSP}_loadingState`,
    payload: [loadingState]
  };
}
function errorAction(error) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  const processed = !!error[errorProcessed];
  const {
    code = '',
    message = 'unkown error',
    detail
  } = error;
  const actionError = {
    code,
    message,
    detail
  };
  Object.defineProperty(actionError, errorProcessed, {
    value: processed,
    enumerable: false,
    writable: true
  });
  return {
    type: getErrorActionType(),
    payload: [actionError]
  };
}
function getErrorActionType() {
  return coreConfig.StageModuleName + coreConfig.NSP + '_error';
}
function getInitActionType(moduleName) {
  return moduleName + coreConfig.NSP + '_initState';
}

function getModule(moduleName) {
  if (MetaData.moduleCaches[moduleName]) {
    return MetaData.moduleCaches[moduleName];
  }

  const moduleOrPromise = coreConfig.ModuleGetter[moduleName]();

  if (isPromise(moduleOrPromise)) {
    const promiseModule = moduleOrPromise.then(({
      default: module
    }) => {
      injectActions(new module.ModelClass(moduleName, null));
      MetaData.moduleCaches[moduleName] = module;
      return module;
    }, reason => {
      MetaData.moduleCaches[moduleName] = undefined;
      throw reason;
    });
    MetaData.moduleCaches[moduleName] = promiseModule;
    return promiseModule;
  }

  injectActions(new moduleOrPromise.ModelClass(moduleName, null));
  MetaData.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}
function getComponent(moduleName, componentName) {
  const key = [moduleName, componentName].join(coreConfig.NSP);

  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key];
  }

  const moduleCallback = module => {
    const componentOrFun = module.components[componentName];

    if (isEluxComponent(componentOrFun)) {
      MetaData.componentCaches[key] = componentOrFun;
      return componentOrFun;
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
function getEntryComponent() {
  return getComponent(coreConfig.StageModuleName, coreConfig.StageViewName);
}
function getModuleApiMap(data) {
  if (!MetaData.moduleApiMap) {
    if (data) {
      MetaData.moduleApiMap = Object.keys(data).reduce((prev, moduleName) => {
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
      MetaData.moduleApiMap = new Proxy({}, {
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

  return MetaData.moduleApiMap;
}
function injectComponent(moduleName, componentName, store) {
  return promiseCaseCallback(getComponent(moduleName, componentName), component => {
    if (component.__elux_component__ === 'view' && !env.isServer) {
      return promiseCaseCallback(store.mount(moduleName, 'update'), () => component);
    }

    return component;
  });
}
function injectActions(model, hmr) {
  const moduleName = model.moduleName;
  const handlers = model;

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

function transformAction(actionName, handler, listenerModule, actionHandlerMap, hmr) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    env.console.warn(`Action duplicate : ${actionName}.`);
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }

  return desc;
}

var _class$1;
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
let EmptyModel = (_class$1 = class EmptyModel {
  get state() {
    return this.store.getState(this.moduleName);
  }

  constructor(moduleName, store) {
    this.moduleName = moduleName;
    this.store = store;
  }

  onMount() {
    const actions = MetaData.moduleApiMap[this.moduleName].actions;
    this.store.dispatch(actions._initState({}));
  }

  onActive() {
    return;
  }

  onInactive() {
    return;
  }

  _initState(state) {
    return state;
  }

}, _applyDecoratedDescriptor(_class$1.prototype, "_initState", [reducer], Object.getOwnPropertyDescriptor(_class$1.prototype, "_initState"), _class$1.prototype), _class$1);
function exportModuleFacade(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(key => {
    const component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn(`The exported component must implement interface EluxComponent: ${moduleName}.${key}`);
    }
  });
  return {
    moduleName,
    ModelClass,
    components: components,
    data,
    state: {},
    actions: {}
  };
}
function setLoading(item, store, _moduleName, _groupName) {
  const moduleName = _moduleName || coreConfig.StageModuleName;
  const groupName = _groupName || 'globalLoading';
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
function effect(loadingKey) {
  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingKey !== null && !env.isServer) {
      const injectLoading = function (store, curAction, effectPromise) {
        let loadingForModuleName;
        let loadingForGroupName;

        if (loadingKey === undefined) {
          loadingForModuleName = coreConfig.StageModuleName;
          loadingForGroupName = 'globalLoading';
        } else {
          [loadingForModuleName, loadingForGroupName] = loadingKey.split('.');
        }

        if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }

        setLoading(effectPromise, store, loadingForModuleName, loadingForGroupName);
      };

      const decorators = fun.__decorators__ || [];
      fun.__decorators__ = decorators;
      decorators.push([injectLoading, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
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
  isActive,
  actionName,
  payload,
  priority,
  handers,
  state,
  effect
}) => {
  if (reduxDevTools) {
    const type = [`${id}${isActive ? '' : '*'}|`, actionName, `(${handers.length})`].join('');
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

function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}
const preMiddleware = ({
  getStore
}) => next => action => {
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

  if (!state[moduleName] && action.type !== getInitActionType(moduleName)) {
    return promiseCaseCallback(store.mount(moduleName, 'update'), () => next(action));
  }

  return next(action);
};
class CoreRouter {
  constructor(location, action, nativeRequest) {
    this.listenerId = 0;
    this.listenerMap = {};
    this.location = location;
    this.action = action;
    this.nativeRequest = nativeRequest;

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

class Store {
  constructor(sid, router) {
    this.state = coreConfig.StoreInitState();
    this.injectedModels = {};
    this.mountedModules = {};
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

  getCurrentAction() {
    return this.currentAction;
  }

  mount(moduleName, env) {
    if (!coreConfig.ModuleGetter[moduleName]) {
      return;
    }

    const mountedModules = this.mountedModules;
    const injectedModels = this.injectedModels;

    const errorCallback = err => {
      if (!this.state[moduleName]) {
        delete mountedModules[moduleName];
        delete injectedModels[moduleName];
      }

      throw err;
    };

    const getModuleCallback = module => {
      const model = new module.ModelClass(moduleName, this);
      this.injectedModels[moduleName] = model;
      return model.onMount(env);
    };

    if (!mountedModules[moduleName]) {
      let result;

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

  setActive() {
    if (!this.active) {
      this.active = true;
      Object.keys(this.injectedModels).forEach(moduleName => {
        const model = this.injectedModels[moduleName];
        model.onActive();
      });
    }
  }

  setInactive() {
    if (this.active) {
      this.active = false;
      Object.keys(this.injectedModels).forEach(moduleName => {
        const model = this.injectedModels[moduleName];
        model.onInactive();
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
      const injectedModels = this.injectedModels;
      const implemented = {};
      orderList = orderList.filter(moduleName => {
        if (implemented[moduleName] || !handlers[moduleName]) {
          return false;
        }

        implemented[moduleName] = true;
        return injectedModels[moduleName];
      });
      logs.handers = orderList;

      if (isReducer) {
        const newState = {};
        const uncommittedState = this.uncommittedState = { ...prevState
        };
        orderList.forEach(moduleName => {
          const model = injectedModels[moduleName];
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
          const model = injectedModels[moduleName];
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
        if (actionName === getErrorActionType()) {
          return Promise.reject(actionData);
        }
      }
    }

    return undefined;
  }

}
function modelHotReplacement(moduleName, ModelClass) {
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

var _class;
function exportModule(moduleName, ModelClass, components, data) {
  return exportModuleFacade(moduleName, ModelClass, components, data);
}
function getApi(demoteForProductionOnly, injectActions) {
  const modules = getModuleApiMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: (...args) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetClientRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use useRouter() instead';
      }

      return MetaData.clientRouter;
    },
    LoadComponent: coreConfig.LoadComponent,
    Modules: modules,
    useRouter: coreConfig.UseRouter,
    useStore: coreConfig.UseStore
  };
}
let BaseModel = (_class = class BaseModel {
  get state() {
    return this.store.getState(this.moduleName);
  }

  constructor(moduleName, store) {
    this.store = void 0;
    this.moduleName = moduleName;
    this.store = store;
  }

  onActive() {
    return;
  }

  onInactive() {
    return;
  }

  getRouter() {
    return this.store.router;
  }

  getPrevState() {
    const runtime = this.store.router.runtime;
    return runtime.prevState[this.moduleName];
  }

  getRootState(type) {
    const runtime = this.store.router.runtime;
    let state;

    if (type === 'previous') {
      state = runtime.prevState;
    } else if (type === 'uncommitted') {
      state = this.store.getUncommittedState();
    } else {
      state = this.store.getState();
    }

    return state;
  }

  get actions() {
    return MetaData.moduleApiMap[this.moduleName].actions;
  }

  getPrivateActions(actionsMap) {
    return MetaData.moduleApiMap[this.moduleName].actions;
  }

  getCurrentAction() {
    const store = this.store;
    return store.getCurrentAction();
  }

  dispatch(action) {
    return this.store.dispatch(action);
  }

  _initState(state) {
    return state;
  }

  _updateState(subject, state) {
    return mergeState(this.state, state);
  }

  _loadingState(loadingState) {
    return mergeState(this.state, loadingState);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "_initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_initState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_updateState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_updateState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_loadingState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_loadingState"), _class.prototype)), _class);

function buildApp(ins, router) {
  const store = router.getCurrentPage().store;
  const ssrData = env[coreConfig.SSRDataKey];
  const AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render({
      id = 'root'
    } = {}) {
      return router.init(ssrData || {}).then(() => {
        AppRender.toDocument(id, {
          router,
          documentHead: ''
        }, !!ssrData, ins, store);
      });
    }

  });
}
function buildSSR(ins, router) {
  const store = router.getCurrentPage().store;
  const AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render({
      id = 'root'
    } = {}) {
      return router.init({}).then(() => {
        store.destroy();
        const eluxContext = {
          router,
          documentHead: ''
        };
        return AppRender.toString(id, eluxContext, ins, store).then(html => {
          const {
            SSRTPL,
            SSRDataKey
          } = coreConfig;
          const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

          if (match) {
            const state = store.getState();
            return SSRTPL.replace('</head>', `\r\n${eluxContext.documentHead}\r\n<script>window.${SSRDataKey} = ${JSON.stringify(state)};</script>\r\n</head>`).replace(match[0], match[0] + html);
          }

          return html;
        });
      });
    }

  });
}

const ErrorCodes = {
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW'
};
function nativeUrlToUrl(nativeUrl) {
  const [path = '', search = '', hash = ''] = nativeUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
}
function urlToNativeUrl(eluxUrl) {
  const [path = '', search = '', hash = ''] = eluxUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
}
function urlToLocation(url) {
  const [path = '', search = '', hash = ''] = url.split(/[?#]/);
  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {
    parse
  } = routeConfig.QueryString;
  const searchQuery = parse(search);
  const hashQuery = parse(hash);
  return {
    url: `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`,
    pathname,
    search,
    hash,
    searchQuery,
    hashQuery
  };
}
function locationToUrl({
  url,
  pathname,
  search,
  hash,
  searchQuery,
  hashQuery
}) {
  if (url) {
    [pathname, search, hash] = url.split(/[?#]/);
  }

  pathname = '/' + (pathname || '').replace(/^\/|\/$/g, '');
  const {
    stringify
  } = routeConfig.QueryString;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';
  return `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
}
function locationToNativeLocation(location) {
  const pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return { ...location,
    pathname,
    url
  };
}
function nativeLocationToLocation(location) {
  const pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return { ...location,
    pathname,
    url
  };
}
function testChangeAction(location, routeAction) {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_testRouteChange`,
    payload: [location, routeAction]
  };
}
function beforeChangeAction(location, routeAction) {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_beforeRouteChange`,
    payload: [location, routeAction]
  };
}
function afterChangeAction(location, routeAction) {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_afterRouteChange`,
    payload: [location, routeAction]
  };
}
const routeConfig = {
  NotifyNativeRouter: {
    window: true,
    page: false
  },
  HomeUrl: '/',
  QueryString: {
    parse: str => ({}),
    stringify: () => ''
  },
  NativePathnameMapping: {
    in: pathname => pathname === '/' ? routeConfig.HomeUrl : pathname,
    out: pathname => pathname === routeConfig.HomeUrl ? '/' : pathname
  }
};
const setRouteConfig = buildConfigSetter(routeConfig);

class HistoryStack {
  constructor(limit) {
    this.currentRecord = undefined;
    this.records = [];
    this.limit = limit;
  }

  init(record) {
    this.records = [record];
    this.currentRecord = record;
    record.setActive();
  }

  onChanged() {
    if (this.currentRecord !== this.records[0]) {
      this.currentRecord.setInactive();
      this.currentRecord = this.records[0];
      this.currentRecord.setActive();
    }
  }

  getCurrentItem() {
    return this.currentRecord;
  }

  getEarliestItem() {
    return this.records[this.records.length - 1];
  }

  getItemAt(n) {
    return this.records[n];
  }

  getLength() {
    return this.records.length;
  }

  push(item) {
    const records = this.records;
    records.unshift(item);

    if (records.length > this.limit) {
      const delItem = records.pop();
      delItem !== item && delItem.destroy();
    }

    this.onChanged();
  }

  replace(item) {
    const records = this.records;
    const delItem = records[0];
    records[0] = item;
    delItem !== item && delItem.destroy();
    this.onChanged();
  }

  relaunch(item) {
    const delList = this.records;
    this.records = [item];
    this.currentRecord = item;
    delList.forEach(delItem => {
      delItem !== item && delItem.destroy();
    });
    this.onChanged();
  }

  back(delta) {
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
    this.onChanged();
  }

}
class RouteRecord {
  constructor(location, pageStack) {
    this.key = void 0;
    this.location = location;
    this.pageStack = pageStack;
    this.key = [pageStack.key, pageStack.id++].join('-');
  }

  setActive() {
    return;
  }

  setInactive() {
    return;
  }

  destroy() {
    return;
  }

}
class PageStack extends HistoryStack {
  constructor(windowStack, location, store) {
    super(20);
    this.id = 0;
    this.key = void 0;
    this._store = void 0;
    this.windowStack = windowStack;
    this._store = store;
    this.key = '' + windowStack.id++;
    this.init(new RouteRecord(location, this));
  }

  get store() {
    return this._store;
  }

  replaceStore(store) {
    if (this._store !== store) {
      this._store.destroy();

      this._store = store;
      store.setActive();
    }
  }

  findRecordByKey(key) {
    for (let i = 0, k = this.records.length; i < k; i++) {
      const item = this.records[i];

      if (item.key === key) {
        return [item, i];
      }
    }

    return undefined;
  }

  setActive() {
    this.store.setActive();
  }

  setInactive() {
    this.store.setInactive();
  }

  destroy() {
    this.store.destroy();
  }

}
class WindowStack extends HistoryStack {
  constructor(location, store) {
    super(10);
    this.id = 0;
    this.init(new PageStack(this, location, store));
  }

  getCurrentWindowPage() {
    const item = this.getCurrentItem();
    const store = item.store;
    const record = item.getCurrentItem();
    const url = record.location.url;
    return {
      url,
      store
    };
  }

  getWindowPages() {
    return this.records.map(item => {
      const store = item.store;
      const record = item.getCurrentItem();
      const url = record.location.url;
      return {
        url,
        store
      };
    });
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
        index: [this.records.length - 1, pageStack.getLength() - 1]
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
        index: [this.records.length - 1, pageStack.getLength() - 1]
      };
    }
  }

  findRecordByKey(key) {
    const arr = key.split('-');

    for (let i = 0, k = this.records.length; i < k; i++) {
      const pageStack = this.records[i];

      if (pageStack.key === arr[0]) {
        const item = pageStack.findRecordByKey(key);

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

class BaseNativeRouter {
  constructor(nativeRequest) {
    this.curTask = void 0;
    this.nativeRequest = nativeRequest;
  }

  onSuccess(key) {
    var _this$curTask;

    (_this$curTask = this.curTask) == null ? void 0 : _this$curTask.resolve();
  }

  onError(key) {
    var _this$curTask2;

    (_this$curTask2 = this.curTask) == null ? void 0 : _this$curTask2.reject();
  }

  execute(method, location, key, backIndex) {
    const result = this[method](locationToNativeLocation(location), key, backIndex);

    if (result) {
      return new Promise((resolve, reject) => {
        this.curTask = {
          resolve,
          reject
        };
      });
    }
  }

}
class Router extends CoreRouter {
  constructor(nativeRouter) {
    super(urlToLocation(nativeUrlToUrl(nativeRouter.nativeRequest.request.url)), 'relaunch', nativeRouter.nativeRequest);
    this.curTask = void 0;
    this.taskList = [];
    this.windowStack = void 0;

    this.onTaskComplete = () => {
      const task = this.taskList.shift();

      if (task) {
        this.curTask = task;
        const onTaskComplete = this.onTaskComplete;
        env.setTimeout(() => task[0]().finally(onTaskComplete).then(task[1], task[2]), 0);
      } else {
        this.curTask = undefined;
      }
    };

    this.nativeRouter = nativeRouter;
    this.windowStack = new WindowStack(this.location, new Store(0, this));
  }

  addTask(execute) {
    return new Promise((resolve, reject) => {
      const task = [() => setLoading(execute(), this.getCurrentPage().store), resolve, reject];

      if (this.curTask) {
        this.taskList.push(task);
      } else {
        this.curTask = task;
        task[0]().finally(this.onTaskComplete).then(task[1], task[2]);
      }
    });
  }

  getHistoryLength(target = 'page') {
    return target === 'window' ? this.windowStack.getLength() : this.windowStack.getCurrentItem().getLength();
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

  getCurrentPage() {
    return this.windowStack.getCurrentWindowPage();
  }

  getWindowPages() {
    return this.windowStack.getWindowPages();
  }

  async mountStore(payload, prevStore, newStore, historyStore) {
    const prevState = prevStore.getState();
    this.runtime = {
      timestamp: Date.now(),
      payload,
      prevState: coreConfig.MutableData ? deepClone(prevState) : prevState,
      completed: false
    };

    if (newStore === historyStore) {
      this.runtime.completed = true;
      return;
    }

    try {
      await newStore.mount(coreConfig.StageModuleName, 'route');
    } catch (err) {
      env.console.error(err);
    }

    this.runtime.completed = true;
  }

  init(prevState) {
    const task = [this._init.bind(this, prevState), () => undefined, () => undefined];
    this.curTask = task;
    return task[0]().finally(this.onTaskComplete);
  }

  async _init(prevState) {
    this.runtime = {
      timestamp: Date.now(),
      payload: null,
      prevState,
      completed: false
    };
    const store = this.getCurrentPage().store;

    try {
      await store.mount(coreConfig.StageModuleName, 'init');
      await store.dispatch(testChangeAction(this.location, this.action));
    } catch (err) {
      if (err.code === ErrorCodes.ROUTE_REDIRECT) {
        this.taskList = [];
        throw err;
      }

      env.console.error(err);
    }

    this.runtime.completed = true;
  }

  redirectOnServer(urlOrLocation) {
    if (env.isServer) {
      const url = urlOrLocation.url || locationToUrl(urlOrLocation);
      const nativeUrl = urlToNativeUrl(url);
      const err = {
        code: ErrorCodes.ROUTE_REDIRECT,
        message: 'Route change in server is not allowed.',
        detail: nativeUrl
      };
      throw err;
    }
  }

  relaunch(urlOrLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._relaunch.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  async _relaunch(urlOrLocation, target, payload, _nativeCaller) {
    const action = 'relaunch';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);

    if (target === 'window') {
      pageStack.relaunch(newRecord);
      this.windowStack.relaunch(pageStack);
    } else {
      pageStack.relaunch(newRecord);
    }

    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }

    await this.dispatch({
      location,
      action,
      prevStore,
      newStore,
      windowChanged: target === 'window'
    });
    newStore.dispatch(afterChangeAction(location, action));
  }

  replace(urlOrLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._replace.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  async _replace(urlOrLocation, target, payload, _nativeCaller) {
    const action = 'replace';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);

    if (target === 'window') {
      pageStack.relaunch(newRecord);
    } else {
      pageStack.replace(newRecord);
    }

    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }

    await this.dispatch({
      location,
      action,
      prevStore,
      newStore,
      windowChanged: target === 'window'
    });
    newStore.dispatch(afterChangeAction(location, action));
  }

  push(urlOrLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._push.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  async _push(urlOrLocation, target, payload, _nativeCaller) {
    const action = 'push';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    let newRecord;

    if (target === 'window') {
      const newPageStack = new PageStack(this.windowStack, location, newStore);
      newRecord = newPageStack.getCurrentItem();
      this.windowStack.push(newPageStack);
      await this.mountStore(payload, prevStore, newStore);
    } else {
      newRecord = new RouteRecord(location, pageStack);
      pageStack.push(newRecord);
      pageStack.replaceStore(newStore);
      await this.mountStore(payload, prevStore, newStore);
    }

    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }

    await this.dispatch({
      location,
      action,
      prevStore,
      newStore,
      windowChanged: target === 'window'
    });
    newStore.dispatch(afterChangeAction(location, action));
  }

  back(stepOrKey = 1, target = 'page', payload = null, overflowRedirect = '', _nativeCaller = false) {
    if (!stepOrKey) {
      return;
    }

    this.redirectOnServer({
      url: overflowRedirect || routeConfig.HomeUrl
    });
    return this.addTask(this._back.bind(this, stepOrKey, target, payload, overflowRedirect, _nativeCaller));
  }

  async _back(stepOrKey, target, payload, overflowRedirect, _nativeCaller) {
    const action = 'back';
    const {
      record,
      overflow,
      index
    } = this.windowStack.testBack(stepOrKey, target === 'window');

    if (overflow) {
      const url = overflowRedirect || routeConfig.HomeUrl;
      this.relaunch({
        url
      }, 'window');
      const err = {
        code: ErrorCodes.ROUTE_BACK_OVERFLOW,
        message: 'Overflowed on route backward.',
        detail: stepOrKey
      };
      throw setProcessedError(err, true);
    }

    if (!index[0] && !index[1]) {
      throw 'Route backward invalid.';
    }

    const location = record.location;
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const NotifyNativeRouter = [];

    if (index[0]) {
      NotifyNativeRouter[0] = routeConfig.NotifyNativeRouter.window;
      this.windowStack.back(index[0]);
    }

    if (index[1]) {
      NotifyNativeRouter[1] = routeConfig.NotifyNativeRouter.page;
      this.windowStack.getCurrentItem().back(index[1]);
    }

    const pageStack = this.windowStack.getCurrentItem();
    const historyStore = pageStack.store;
    let newStore = historyStore;

    if (index[1] !== 0) {
      newStore = prevStore.clone();
      pageStack.replaceStore(newStore);
    }

    await this.mountStore(payload, prevStore, newStore);

    if (!_nativeCaller && NotifyNativeRouter.length) {
      await this.nativeRouter.execute(action, location, record.key, index);
    }

    await this.dispatch({
      location,
      action,
      prevStore,
      newStore,
      windowChanged: !!index[0]
    });
    newStore.dispatch(afterChangeAction(location, action));
  }

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

  var provided = typeof message === 'function' ? message() : message;
  var value = provided ? prefix + ": " + provided : prefix;
  throw new Error(value);
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


function createBrowserHistory(props) {
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
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory(nativeRequest) {
  const [pathname, search = '', hash = ''] = nativeRequest.request.url.split(/[?#]/);
  return {
    push() {
      return;
    },

    replace() {
      return;
    },

    block() {
      return () => undefined;
    },

    location: {
      pathname,
      search,
      hash
    }
  };
}

class BrowserNativeRouter extends BaseNativeRouter {
  constructor(history, nativeRequest) {
    super(nativeRequest);
    this.unlistenHistory = void 0;
    this.router = void 0;
    this.history = history;
    this.router = new Router(this);
    const {
      window,
      page
    } = routeConfig.NotifyNativeRouter;

    if (window || page) {
      this.unlistenHistory = this.history.block((locationData, action) => {
        if (action === 'POP') {
          env.setTimeout(() => this.router.back(1), 100);
          return false;
        }

        return undefined;
      });
    }
  }

  push(location, key) {
    this.history.push(location);
    return false;
  }

  replace(location, key) {
    this.history.push(location);
    return false;
  }

  relaunch(location, key) {
    this.history.push(location);
    return false;
  }

  back(location, key, index) {
    this.history.replace(location);
    return false;
  }

  destroy() {
    this.unlistenHistory && this.unlistenHistory();
  }

}

function createClientRouter() {
  const history = createBrowserHistory();
  const nativeRequest = {
    request: {
      url: locationToUrl(history.location)
    },
    response: {}
  };
  const browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}
function createServerRouter(nativeRequest) {
  const history = createServerHistory(nativeRequest);
  const browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}

const EluxContextKey = '__EluxContext__';
const EluxStoreContextKey = '__EluxStoreContext__';
function UseRouter() {
  const {
    router
  } = inject(EluxContextKey, {});
  return router;
}
function UseStore() {
  const {
    store
  } = inject(EluxStoreContextKey, {});
  return store;
}

const LoadComponentOnError = ({
  message
}) => createVNode("div", {
  "class": "g-component-error"
}, [message]);
const LoadComponentOnLoading = () => createVNode("div", {
  "class": "g-component-loading"
}, [createTextVNode("loading...")]);
const LoadComponent = (moduleName, componentName, options = {}) => {
  const loadingComponent = options.onLoading || coreConfig.LoadComponentOnLoading;
  const errorComponent = options.onError || coreConfig.LoadComponentOnError;

  const component = (props, context) => {
    const store = coreConfig.UseStore();
    let result;
    let errorMessage = '';

    try {
      result = injectComponent(moduleName, componentName, store);

      if (env.isServer && isPromise(result)) {
        result = undefined;
        throw 'can not use async component in SSR';
      }
    } catch (e) {
      env.console.error(e);
      errorMessage = e.message || `${e}`;
    }

    if (result) {
      if (isPromise(result)) {
        return h(defineAsyncComponent({
          loader: () => result,
          errorComponent,
          loadingComponent
        }), props, context.slots);
      } else {
        return h(result, props, context.slots);
      }
    } else {
      return h(errorComponent, null, errorMessage);
    }
  };

  return component;
};

const AppRender = {
  toDocument(id, eluxContext, fromSSR, app, store) {
    app.provide(EluxContextKey, eluxContext);

    if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }

    app.mount(`#${id}`);
  },

  toString(id, eluxContext, app, store) {
    app.provide(EluxContextKey, eluxContext);
    return renderToString(app);
  }

};

const RouterComponent = defineComponent({
  setup() {
    const router = coreConfig.UseRouter();
    const data = shallowRef({
      classname: 'elux-app',
      pages: router.getWindowPages().reverse()
    });
    const containerRef = ref({
      className: ''
    });
    const removeListener = router.addListener(({
      action,
      windowChanged
    }) => {
      const pages = router.getWindowPages().reverse();
      return new Promise(completeCallback => {
        if (windowChanged) {
          if (action === 'push') {
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
          } else if (action === 'back') {
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
          } else if (action === 'relaunch') {
            data.value = {
              classname: 'elux-app',
              pages
            };
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            classname: 'elux-app',
            pages
          };
          env.setTimeout(completeCallback, 50);
        }
      });
    });
    onBeforeUnmount(() => {
      removeListener();
    });
    const appView = getEntryComponent();
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
          url
        } = item;
        return createVNode("div", {
          "key": store.sid,
          "data-sid": store.sid,
          "class": "elux-window",
          "data-url": url
        }, [createVNode(EWindow, {
          "store": store,
          "view": appView
        }, null)]);
      })]);
    };
  }

});
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

let clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(() => {
      clientTimer = 0;
      const arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        coreConfig.SetPageTitle(arr[1]);
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
      eluxContext: inject(EluxContextKey, {}),
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
    if (env.isServer) {
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
  to = '',
  target = 'page',
  action = 'push',
  ...props
}, context) {
  const router = coreConfig.UseRouter();

  const onClick = event => {
    event.preventDefault();

    if (!disabled) {
      _onClick && _onClick(event);
      to && router[action](action === 'back' ? parseInt(to) : {
        url: to
      }, target);
    }
  };

  props['onClick'] = onClick;
  props['action'] = action;
  props['target'] = target;
  props['to'] = to;
  disabled && (props['disabled'] = true);
  let href = action !== 'back' ? to : '';

  if (href) {
    href = urlToNativeUrl(href);
  } else {
    href = '#';
  }

  props['href'] = href;
  return h('a', props, context.slots.default());
};

setCoreConfig({
  MutableData: true,
  StoreInitState: () => reactive({}),
  UseStore,
  UseRouter,
  AppRender,
  LoadComponent,
  LoadComponentOnError,
  LoadComponentOnLoading
});

const appConfig = Symbol();
function setConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);

  if (conf.DisableNativeRouter) {
    setRouteConfig({
      NotifyNativeRouter: {
        window: false,
        page: false
      }
    });
  }

  return appConfig;
}
function patchActions(typeName, json) {
  if (json) {
    getModuleApiMap(JSON.parse(json));
  }
}

function createApp(appConfig) {
  const router = createClientRouter();
  const app = createApp$1(RouterComponent);
  return buildApp(app, router);
}
function createSSR(appConfig, nativeRequest) {
  const router = createServerRouter(nativeRequest);
  const app = createSSRApp(RouterComponent);
  return buildSSR(app, router);
}

export { BaseModel, DocumentHead, Else, EmptyModel, ErrorCodes, Link, Switch, createApp, createSSR, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, nativeLocationToLocation, nativeUrlToUrl, patchActions, reducer, setConfig, setLoading, urlToLocation, urlToNativeUrl };
