import { inject, createVNode, createTextVNode, defineComponent, shallowRef, onBeforeUnmount, h, provide, ref, computed, Comment, Fragment, reactive, createApp as createApp$1 } from 'vue';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';

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
  DepthTimeOnLoading: 1,
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
  Platform: '',
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

function moduleExists(moduleName) {
  return !!coreConfig.ModuleGetter[moduleName];
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
function injectModule(moduleOrName, moduleGetter) {
  if (typeof moduleOrName === 'string') {
    coreConfig.ModuleGetter[moduleOrName] = moduleGetter;
  } else {
    coreConfig.ModuleGetter[moduleOrName.moduleName] = () => moduleOrName;
  }
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
          actionName = actionName.trim();

          if (actionName) {
            actionName = actionName.replace(new RegExp(`^this[${coreConfig.NSP}]`), `${moduleName}${coreConfig.NSP}`);
            const arr = actionName.split(coreConfig.NSP);

            if (arr[1]) {
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
            } else {
              transformAction(moduleName + coreConfig.NSP + actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
            }
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
  constructor() {
    this.listenerId = 0;
    this.listenerMap = {};
    this.action = 'init';
    this.routeKey = '';

    if (!MetaData.clientRouter) {
      MetaData.clientRouter = this;
    }
  }

  getHistoryUrls(target) {
    throw new Error('Method not implemented.');
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
    this.currentAction = void 0;
    this.uncommittedState = {};
    this.active = false;

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

          if (this.active) {
            injectedModels[moduleName].onActive();
          }
        }, errorCallback);
      } else {
        mountedModules[moduleName] = true;

        if (this.active) {
          injectedModels[moduleName].onActive();
        }
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
      const page = MetaData.clientRouter.getActivePage();
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

  const GetComponent = (moduleName, componentName) => {
    const result = getComponent(moduleName, componentName);

    if (isPromise(result)) {
      return result;
    } else {
      return Promise.resolve(result);
    }
  };

  const GetData = moduleName => {
    const result = getModule(moduleName);

    if (isPromise(result)) {
      return result.then(mod => mod.data);
    } else {
      return Promise.resolve(result.data);
    }
  };

  return {
    GetActions: (...args) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetClientRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetClientRouter() in the server side, please use useRouter() instead';
      }

      return MetaData.clientRouter;
    },
    LoadComponent: coreConfig.LoadComponent,
    GetComponent: GetComponent,
    GetData: GetData,
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
    const moduleName = this.moduleName;
    const privateActions = Object.keys(actionsMap);
    privateActions.push('_initState', '_updateState', '_loadingState');
    return privateActions.reduce((map, actionName) => {
      map[actionName] = (...payload) => ({
        type: moduleName + coreConfig.NSP + actionName,
        payload
      });

      return map;
    }, {});
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

function buildProvider(ins, router) {
  const AppRender = coreConfig.AppRender;
  return AppRender.toProvider({
    router
  }, ins);
}
function getTplInSSR() {
  return coreConfig.SSRTPL;
}

const ErrorCodes = {
  ROUTE_RETURN: 'ELIX.ROUTE_RETURN',
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
  const [path = '', query = '', hash = ''] = url.split(/[?#]/);
  const arr = `?${query}`.match(/(.*)[?&]__c=([^&]+)(.*$)/);
  let search = query;
  let classname = '';

  if (arr) {
    classname = arr[2];
    search = (arr[1] + arr[3]).substr(1);
  }

  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {
    parse
  } = routeConfig.QueryString;
  const searchQuery = parse(search);
  const hashQuery = parse(hash);
  return {
    url: `${pathname}${query ? '?' + query : ''}${hash ? '#' + hash : ''}`,
    pathname,
    search,
    hash,
    classname,
    searchQuery,
    hashQuery
  };
}
function locationToUrl({
  url,
  pathname,
  search,
  hash,
  classname,
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

  if (classname) {
    search = `?${search}`.replace(/[?&]__c=[^&]+/, '').substr(1);
    search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
  }

  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';
  url = `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
  return url;
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
    out: pathname => pathname
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

  getItems() {
    return [...this.records];
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
    this.title = void 0;
    this.location = location;
    this.pageStack = pageStack;
    this.key = [pageStack.key, pageStack.id++].join('_');
    this.title = '';
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

  getRecords() {
    return this.records.map(item => item.getCurrentItem());
  }

  getCurrentWindowPage() {
    const item = this.getCurrentItem();
    const store = item.store;
    const record = item.getCurrentItem();
    const location = record.location;
    return {
      store,
      location
    };
  }

  getCurrentPages() {
    return this.records.map(item => {
      const store = item.store;
      const record = item.getCurrentItem();
      const location = record.location;
      return {
        store,
        location
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
    const arr = key.split('_');

    if (arr[0] && arr[1]) {
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
    }

    return {
      record: this.getCurrentItem().getCurrentItem(),
      index: [0, 0],
      overflow: true
    };
  }

}

class BaseNativeRouter {
  constructor() {
    this.router = void 0;
    this.routeKey = '';
    this.curTask = void 0;
    this.router = new Router(this);
  }

  onSuccess() {
    if (this.curTask) {
      const {
        resolve,
        timeout
      } = this.curTask;
      this.curTask = undefined;
      env.clearTimeout(timeout);
      this.routeKey = '';
      resolve();
    }
  }

  testExecute(method, location, backIndex) {
    const testMethod = '_' + method;
    this[testMethod] && this[testMethod](locationToNativeLocation(location), backIndex);
  }

  execute(method, location, key, backIndex) {
    const nativeLocation = locationToNativeLocation(location);
    const result = this[method](nativeLocation, key, backIndex);

    if (result) {
      this.routeKey = key;
      return new Promise(resolve => {
        const timeout = env.setTimeout(() => {
          env.console.error('Native router timeout: ' + nativeLocation.url);
          this.onSuccess();
        }, 2000);
        this.curTask = {
          resolve,
          timeout
        };
      });
    }
  }

}
let clientDocumentHeadTimer = 0;
class Router extends CoreRouter {
  constructor(nativeRouter) {
    super();
    this.curTask = void 0;
    this.taskList = [];
    this.windowStack = void 0;
    this.documentHead = '';

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
  }

  addTask(execute) {
    return new Promise((resolve, reject) => {
      const task = [() => setLoading(execute(), this.getActivePage().store), resolve, reject];

      if (this.curTask) {
        this.taskList.push(task);
      } else {
        this.curTask = task;
        task[0]().finally(this.onTaskComplete).then(task[1], task[2]);
      }
    });
  }

  getDocumentHead() {
    return this.documentHead;
  }

  setDocumentHead(html) {
    this.documentHead = html;

    if (!env.isServer && !clientDocumentHeadTimer) {
      clientDocumentHeadTimer = env.setTimeout(() => {
        clientDocumentHeadTimer = 0;
        const arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];

        if (arr[1]) {
          coreConfig.SetPageTitle(arr[1]);
        }
      }, 0);
    }
  }

  savePageTitle() {
    const arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];
    const title = arr[1] || '';
    this.windowStack.getCurrentItem().getCurrentItem().title = title;
  }

  nativeInitiated() {
    return !this.nativeRouter.routeKey;
  }

  getHistoryLength(target = 'page') {
    return target === 'window' ? this.windowStack.getLength() - 1 : this.windowStack.getCurrentItem().getLength() - 1;
  }

  getHistory(target = 'page') {
    return target === 'window' ? this.windowStack.getRecords().slice(1) : this.windowStack.getCurrentItem().getItems().slice(1);
  }

  findRecordByKey(recordKey) {
    const {
      record: {
        key,
        location,
        title
      },
      overflow,
      index
    } = this.windowStack.findRecordByKey(recordKey);
    return {
      overflow,
      index,
      record: {
        key,
        location,
        title
      }
    };
  }

  findRecordByStep(delta, rootOnly) {
    const {
      record: {
        key,
        location,
        title
      },
      overflow,
      index
    } = this.windowStack.testBack(delta, !!rootOnly);
    return {
      overflow,
      index,
      record: {
        key,
        location,
        title
      }
    };
  }

  getActivePage() {
    return this.windowStack.getCurrentWindowPage();
  }

  getCurrentPages() {
    return this.windowStack.getCurrentPages();
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

  redirectOnServer(partialLocation) {
    if (env.isServer) {
      const url = locationToUrl(partialLocation);
      const nativeUrl = urlToNativeUrl(url);
      const err = {
        code: ErrorCodes.ROUTE_REDIRECT,
        message: 'Route change in server is not allowed.',
        detail: nativeUrl
      };
      throw err;
    }
  }

  init(routerInitOptions, prevState) {
    this.init = () => Promise.resolve();

    this.initOptions = routerInitOptions;
    this.location = urlToLocation(nativeUrlToUrl(routerInitOptions.url));
    this.action = 'init';
    this.windowStack = new WindowStack(this.location, new Store(0, this));
    this.routeKey = this.findRecordByStep(0).record.key;
    this.runtime = {
      timestamp: Date.now(),
      payload: null,
      prevState,
      completed: false
    };
    const task = [this._init.bind(this), () => undefined, () => undefined];
    this.curTask = task;
    return task[0]().finally(this.onTaskComplete);
  }

  async _init() {
    const {
      action,
      location,
      routeKey
    } = this;
    await this.nativeRouter.execute(action, location, routeKey);
    const store = this.getActivePage().store;

    try {
      await store.mount(coreConfig.StageModuleName, 'init');
      await store.dispatch(testChangeAction(this.location, this.action));
    } catch (err) {
      if (err.code === ErrorCodes.ROUTE_RETURN || err.code === ErrorCodes.ROUTE_REDIRECT) {
        this.taskList = [];
        throw err;
      }

      env.console.error(err);
    }

    this.runtime.completed = true;
    this.dispatch({
      location,
      action,
      prevStore: store,
      newStore: store,
      windowChanged: true
    });
  }

  relaunch(partialLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(partialLocation);
    return this.addTask(this._relaunch.bind(this, partialLocation, target, payload, _nativeCaller));
  }

  async _relaunch(partialLocation, target, payload, _nativeCaller) {
    const action = 'relaunch';
    const location = urlToLocation(locationToUrl(partialLocation));
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }

    const prevStore = this.getActivePage().store;

    try {
      await prevStore.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!_nativeCaller) {
        throw err;
      }
    }

    await prevStore.dispatch(beforeChangeAction(location, action));
    this.savePageTitle();
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);
    this.routeKey = newRecord.key;

    if (target === 'window') {
      pageStack.relaunch(newRecord);
      this.windowStack.relaunch(pageStack);
    } else {
      pageStack.relaunch(newRecord);
    }

    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);

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

  replace(partialLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(partialLocation);
    return this.addTask(this._replace.bind(this, partialLocation, target, payload, _nativeCaller));
  }

  async _replace(partialLocation, target, payload, _nativeCaller) {
    const action = 'replace';
    const location = urlToLocation(locationToUrl(partialLocation));
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }

    const prevStore = this.getActivePage().store;

    try {
      await prevStore.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!_nativeCaller) {
        throw err;
      }
    }

    await prevStore.dispatch(beforeChangeAction(location, action));
    this.savePageTitle();
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);
    this.routeKey = newRecord.key;

    if (target === 'window') {
      pageStack.relaunch(newRecord);
    } else {
      pageStack.replace(newRecord);
    }

    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);

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

  push(partialLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(partialLocation);
    return this.addTask(this._push.bind(this, partialLocation, target, payload, _nativeCaller));
  }

  async _push(partialLocation, target, payload, _nativeCaller) {
    const action = 'push';
    const location = urlToLocation(locationToUrl(partialLocation));
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }

    const prevStore = this.getActivePage().store;

    try {
      await prevStore.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!_nativeCaller) {
        throw err;
      }
    }

    await prevStore.dispatch(beforeChangeAction(location, action));
    this.savePageTitle();
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    let newRecord;

    if (target === 'window') {
      const newPageStack = new PageStack(this.windowStack, location, newStore);
      newRecord = newPageStack.getCurrentItem();
      this.routeKey = newRecord.key;
      this.windowStack.push(newPageStack);
      await this.mountStore(payload, prevStore, newStore);
    } else {
      newRecord = new RouteRecord(location, pageStack);
      this.routeKey = newRecord.key;
      pageStack.push(newRecord);
      pageStack.replaceStore(newStore);
      await this.mountStore(payload, prevStore, newStore);
    }

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

  back(stepOrKeyOrCallback = 1, target = 'page', payload = null, overflowRedirect = '', _nativeCaller = false) {
    if (!stepOrKeyOrCallback) {
      return Promise.resolve();
    }

    if (overflowRedirect !== null) {
      this.redirectOnServer({
        url: overflowRedirect || routeConfig.HomeUrl
      });
    }

    let stepOrKey;

    if (typeof stepOrKeyOrCallback === 'function') {
      const items = this.getHistory(target);
      const i = items.findIndex(stepOrKeyOrCallback);
      stepOrKey = i > -1 ? items[i].key : '';
    } else {
      stepOrKey = stepOrKeyOrCallback;
    }

    return this.addTask(this._back.bind(this, stepOrKey, target, payload, overflowRedirect, _nativeCaller));
  }

  async _back(stepOrKey, target, payload, overflowRedirect, _nativeCaller) {
    const action = 'back';
    const {
      record,
      overflow,
      index
    } = this.windowStack.testBack(stepOrKey, target === 'window');

    if (overflow || !index[0] && !index[1]) {
      if (overflowRedirect !== null) {
        const url = overflowRedirect || routeConfig.HomeUrl;
        this.relaunch({
          url
        }, 'window');
      }

      const err = {
        code: ErrorCodes.ROUTE_BACK_OVERFLOW,
        message: 'Overflowed on route backward.',
        detail: stepOrKey
      };
      throw setProcessedError(err, true);
    }

    const location = record.location;
    const title = record.title;
    const NotifyNativeRouter = [];

    if (index[0]) {
      NotifyNativeRouter[0] = routeConfig.NotifyNativeRouter.window;
    }

    if (index[1]) {
      NotifyNativeRouter[1] = routeConfig.NotifyNativeRouter.page;
    }

    if (!_nativeCaller && NotifyNativeRouter.length) {
      this.nativeRouter.testExecute(action, location, index);
    }

    const prevStore = this.getActivePage().store;

    try {
      await prevStore.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!_nativeCaller) {
        throw err;
      }
    }

    await prevStore.dispatch(beforeChangeAction(location, action));
    this.savePageTitle();
    this.location = location;
    this.action = action;
    this.routeKey = record.key;

    if (index[0]) {
      this.windowStack.back(index[0]);
    }

    if (index[1]) {
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

    this.setDocumentHead(`<title>${title}</title>`);
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

setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: false
  }
});
class MPNativeRouter extends BaseNativeRouter {
  constructor(history) {
    super();
    this.unlistenHistory = void 0;
    this.history = history;
    const {
      window,
      page
    } = routeConfig.NotifyNativeRouter;

    if (window || page) {
      this.unlistenHistory = history.onRouteChange(({
        pathname,
        search,
        action
      }) => {
        let key = this.routeKey;

        if (!key) {
          const nativeUrl = [pathname, search].filter(Boolean).join('?');
          const url = nativeUrlToUrl(nativeUrl);

          if (action === 'POP') {
            const arr = `?${search}`.match(/[?&]__k=(\w+)/);
            key = arr ? arr[1] : '';

            if (!key) {
              this.router.back(-1, 'page', null, '', true);
            } else {
              this.router.back(key, 'page', null, '', true);
            }
          } else if (action === 'REPLACE') {
            this.router.replace({
              url
            }, 'window', null, true);
          } else if (action === 'PUSH') {
            this.router.push({
              url
            }, 'window', null, true);
          } else {
            this.router.relaunch({
              url
            }, 'window', null, true);
          }
        } else {
          this.onSuccess();
        }
      });
    }
  }

  addKey(url, key) {
    return url.indexOf('?') > -1 ? `${url.replace(/[?&]__k=(\w+)/, '')}&__k=${key}` : `${url}?__k=${key}`;
  }

  init(location, key) {
    return true;
  }

  _push(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  push(location, key) {
    this.history.navigateTo({
      url: this.addKey(location.url, key)
    });
    return true;
  }

  _replace(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'replace' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  replace(location, key) {
    this.history.redirectTo({
      url: this.addKey(location.url, key)
    });
    return true;
  }

  relaunch(location, key) {
    if (this.history.isTabPage(location.pathname)) {
      this.history.switchTab({
        url: location.url
      });
    } else {
      this.history.reLaunch({
        url: this.addKey(location.url, key)
      });
    }

    return true;
  }

  back(location, key, index) {
    this.history.navigateBack({
      delta: index[0]
    });
    return true;
  }

  destroy() {
    this.unlistenHistory && this.unlistenHistory();
  }

}
function createRouter(history) {
  const mpNativeRouter = new MPNativeRouter(history);
  return mpNativeRouter.router;
}

setCoreConfig({
  SetPageTitle: title => Taro.setNavigationBarTitle({
    title
  })
});
let TaroRouter;
let beforeOnShow;
let tabPages = undefined;
let curLocation;
const eventBus = new SingleDispatcher();

function routeToPathname(route) {
  return `/${route.replace(/^\/+|\/+$/g, '')}`;
}

function queryTosearch(query = {}) {
  const parts = [];
  Object.keys(query).forEach(key => {
    parts.push(`${key}=${query[key]}`);
  });
  return parts.join('&');
}

const taroHistory = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,

  isTabPage(pathname) {
    if (!tabPages) {
      const tabConfig = env.__taroAppConfig.tabBar;

      if (tabConfig) {
        tabPages = (tabConfig.list || tabConfig.items).reduce((obj, item) => {
          obj[routeToPathname(item.pagePath)] = true;
          return obj;
        }, {});
      } else {
        tabPages = {};
      }
    }

    return !!tabPages[pathname];
  },

  getLocation() {
    if (!curLocation) {
      if (process.env.TARO_ENV === 'h5') {
        TaroRouter.history.listen(({
          location: {
            pathname,
            search
          },
          action
        }) => {
          if (action !== 'POP' && taroHistory.isTabPage(pathname)) {
            action = 'RELAUNCH';
          }

          curLocation = {
            pathname,
            search: search.replace(/^\?/, ''),
            action
          };
        });
        const {
          pathname,
          search
        } = TaroRouter.history.location;
        curLocation = {
          pathname,
          search: search.replace(/^\?/, ''),
          action: 'RELAUNCH'
        };
      } else {
        const arr = Taro.getCurrentPages();
        let path;
        let query;

        if (arr.length === 0) {
          ({
            path,
            query
          } = Taro.getLaunchOptionsSync());
        } else {
          const current = arr[arr.length - 1];
          path = current.route;
          query = current.options;
        }

        if (!path) {
          return {
            pathname: '',
            search: '',
            action: 'RELAUNCH'
          };
        }

        curLocation = {
          pathname: routeToPathname(path),
          search: queryTosearch(query),
          action: 'RELAUNCH'
        };
      }
    }

    return curLocation;
  },

  onRouteChange(callback) {
    return eventBus.addListener(callback);
  }

};

if (process.env.TARO_ENV === 'h5') {
  TaroRouter = require('@tarojs/router');

  beforeOnShow = () => undefined;
} else {
  TaroRouter = {};
  let prevPageInfo;

  beforeOnShow = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    const currentPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
    };
    curLocation = {
      pathname: currentPageInfo.pathname,
      search: currentPageInfo.search,
      action: 'RELAUNCH'
    };

    if (prevPageInfo) {
      let action = 'PUSH';

      if (currentPageInfo.count < prevPageInfo.count) {
        action = 'POP';
      } else if (currentPageInfo.count === prevPageInfo.count) {
        if (currentPageInfo.count === 1) {
          action = 'RELAUNCH';
        } else {
          action = 'REPLACE';
        }
      }

      curLocation.action = action;
    }

    prevPageInfo = {
      count: currentPageInfo.count
    };
  };
}

function onShow() {
  beforeOnShow();
  eventBus.dispatch(taroHistory.getLocation());
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
const vueComponentsConfig = {
  renderToString: undefined
};

const AppRender = {
  toDocument(id, eluxContext, fromSSR, app) {
    app.provide(EluxContextKey, eluxContext);

    if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }

    app.mount(`#${id}`);
  },

  toString(id, eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return vueComponentsConfig.renderToString(app);
  },

  toProvider(eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return () => createVNode("div", null, null);
  }

};

const LoadComponentOnError = ({
  message
}) => createVNode("div", {
  "class": "g-component-error"
}, [message]);
const LoadComponentOnLoading = () => createVNode("div", {
  "class": "g-component-loading"
}, [createTextVNode("loading...")]);
const LoadComponent = (moduleName, componentName, options = {}) => {
  const OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  const OnError = options.onError || coreConfig.LoadComponentOnError;
  const component = defineComponent({
    name: 'EluxComponentLoader',

    setup(props, context) {
      const store = coreConfig.UseStore();
      const View = shallowRef(OnLoading);

      const execute = curStore => {
        try {
          const result = injectComponent(moduleName, componentName, curStore || store);

          if (isPromise(result)) {
            if (env.isServer) {
              throw 'can not use async component in SSR';
            }

            result.then(view => {
              active && (View.value = view || 'not found!');
            }, e => {
              env.console.error(e);
              active && (View.value = e.message || `${e}` || 'error');
            });
          } else {
            View.value = result;
          }
        } catch (e) {
          env.console.error(e);
          View.value = e.message || `${e}` || 'error';
        }
      };

      let active = true;
      onBeforeUnmount(() => {
        active = false;
      });
      execute();
      return () => {
        if (typeof View.value === 'string') {
          return h(OnError, {
            message: View.value
          });
        } else {
          return h(View.value, props, context.slots);
        }
      };
    }

  });
  return component;
};

const EWindow = defineComponent({
  name: 'EluxWindow',
  props: {
    store: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const AppView = getEntryComponent();
    const storeContext = {
      store: props.store
    };
    provide(EluxStoreContextKey, storeContext);
    return () => h(AppView, null);
  }

});

defineComponent({
  name: 'EluxRouter',

  setup() {
    const router = coreConfig.UseRouter();
    const data = shallowRef({
      className: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    const containerRef = ref({
      className: ''
    });
    const removeListener = router.addListener(({
      action,
      windowChanged
    }) => {
      const pages = router.getCurrentPages().reverse();
      return new Promise(completeCallback => {
        if (windowChanged) {
          if (action === 'push') {
            data.value = {
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
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
              className: 'elux-app ' + Date.now(),
              pages: [...pages, data.value.pages[data.value.pages.length - 1]]
            };
            env.setTimeout(() => {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(() => {
              data.value = {
                className: 'elux-app ' + Date.now(),
                pages
              };
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            data.value = {
              className: 'elux-app',
              pages
            };
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            className: 'elux-app',
            pages
          };
          env.setTimeout(completeCallback, 50);
        }
      });
    });
    onBeforeUnmount(() => {
      removeListener();
    });
    return () => {
      const {
        className,
        pages
      } = data.value;
      return createVNode("div", {
        "ref": containerRef,
        "class": className
      }, [pages.map((item, index) => {
        const {
          store,
          location: {
            url,
            classname
          }
        } = item;
        const props = {
          class: `elux-window${classname ? ' ' + classname : ''}`,
          key: store.sid,
          sid: store.sid,
          url,
          style: {
            zIndex: index + 1
          }
        };
        return classname.startsWith('_') ? createVNode("article", props, [createVNode(EWindow, {
          "store": store
        }, null)]) : createVNode("div", props, [createVNode(EWindow, {
          "store": store
        }, null)]);
      })]);
    };
  }

});

const DocumentHead = defineComponent({
  name: 'EluxDocumentHead',
  props: ['title', 'html'],

  setup(props) {
    const documentHead = computed(() => {
      let documentHead = props.html || '';

      if (props.title) {
        if (/<title>.*?<\/title>/.test(documentHead)) {
          documentHead = documentHead.replace(/<title>.*?<\/title>/, `<title>${props.title}</title>`);
        } else {
          documentHead = `<title>${props.title}</title>` + documentHead;
        }
      }

      return documentHead;
    });
    const router = coreConfig.UseRouter();
    return () => {
      router.setDocumentHead(documentHead.value);
      return null;
    };
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
Switch.displayName = 'EluxSwitch';

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
Else.displayName = 'EluxElse';

const Link = defineComponent({
  name: 'EluxLink',
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'payload', 'classname'],

  setup(props, context) {
    const route = computed(() => {
      const {
        to = '',
        action = 'push',
        classname = ''
      } = props;
      let back;
      let url;
      let href;

      if (action === 'back') {
        back = to || 1;
      } else {
        url = classname ? locationToUrl({
          url: to.toString(),
          classname
        }) : to.toString();
        href = urlToNativeUrl(url);
      }

      return {
        back,
        url,
        href
      };
    });
    const router = coreConfig.UseRouter();

    const onClick = event => {
      event.preventDefault();
      const {
        back,
        url
      } = route.value;
      const {
        disabled,
        onClick,
        action = 'push',
        target = 'page',
        payload
      } = props;

      if (!disabled) {
        onClick && onClick(event);
        router[action](back || {
          url
        }, target, payload);
      }
    };

    return () => {
      const {
        back,
        url,
        href
      } = route.value;
      const {
        disabled,
        action = 'push',
        target = 'page',
        classname = ''
      } = props;
      const linkProps = {};
      linkProps['onClick'] = onClick;
      linkProps['action'] = action;
      linkProps['target'] = target;
      linkProps['to'] = (back || url) + '';
      linkProps['href'] = href;
      href && (linkProps['href'] = href);
      classname && (linkProps['classname'] = classname);
      disabled && (linkProps['disabled'] = true);

      if (coreConfig.Platform === 'taro') {
        return h('span', linkProps, context.slots);
      } else {
        return h('a', linkProps, context.slots);
      }
    };
  }

});

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

setCoreConfig({
  Platform: 'taro'
});
const EluxPage = defineComponent({
  setup() {
    const router = coreConfig.UseRouter();
    const store = ref();
    let unlink;
    useDidShow(() => {
      if (!unlink) {
        unlink = router.addListener(({
          newStore
        }) => {
          store.value = newStore;
        });
      }

      onShow();
    });
    useDidHide(() => {
      if (unlink) {
        unlink();
        unlink = undefined;
      }
    });
    onBeforeUnmount(() => {
      if (unlink) {
        unlink();
        unlink = undefined;
      }
    });
    return () => store.value ? createVNode(EWindow, {
      "store": store.value,
      "key": store.value.sid
    }, null) : createVNode("div", {
      "className": "g-page-loading"
    }, [createTextVNode("Loading...")]);
  }

});
let cientSingleton;
function createApp(appConfig, appOptions = {}) {
  if (!cientSingleton) {
    const onLaunch = appOptions.onLaunch;

    appOptions.onLaunch = function (options) {
      const location = taroHistory.getLocation();
      router.init({
        url: locationToUrl(location)
      }, {});
      onLaunch && onLaunch(options);
    };

    cientSingleton = createApp$1(appOptions);
    const router = createRouter(taroHistory);
    buildProvider(cientSingleton, router);
  }

  return cientSingleton;
}

export { BaseModel, DocumentHead, Else, EluxPage, EmptyModel, ErrorCodes, Link, Switch, createApp, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, patchActions, reducer, setConfig, setLoading, urlToLocation, urlToNativeUrl };
