import { inject, createVNode, createTextVNode, defineComponent, shallowRef, onBeforeUnmount, watch, h, shallowReactive, provide, ref, computed, Comment, Fragment, reactive, createApp as createApp$1, createSSRApp } from 'vue';
import { renderToString } from '@elux/vue-web/server';

var root;

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

var env = root;
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

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}

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
    return resultOrPromise.then(function (result) {
      return callback(result);
    });
  }

  return callback(resultOrPromise);
}
function buildConfigSetter(data) {
  return function (config) {
    return Object.keys(data).forEach(function (key) {
      config[key] !== undefined && (data[key] = config[key]);
    });
  };
}
function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

function isObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize, target, inject) {
  Object.keys(inject).forEach(function (key) {
    var src = target[key];
    var val = inject[key];

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

function deepMerge(target) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  args = args.filter(function (item) {
    return isObject(item) && Object.keys(item).length;
  });

  if (args.length === 0) {
    return target;
  }

  if (!isObject(target)) {
    target = {};
  }

  args.forEach(function (inject, index) {
    var lastArg = false;
    var last2Arg = null;

    if (index === args.length - 1) {
      lastArg = true;
    } else if (index === args.length - 2) {
      last2Arg = args[index + 1];
    }

    Object.keys(inject).forEach(function (key) {
      var src = target[key];
      var val = inject[key];

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
var SingleDispatcher = function () {
  function SingleDispatcher() {
    this.listenerId = 0;
    this.listenerMap = {};
  }

  var _proto = SingleDispatcher.prototype;

  _proto.addListener = function addListener(callback) {
    this.listenerId++;
    var id = "" + this.listenerId;
    var listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto.dispatch = function dispatch(data) {
    var listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach(function (id) {
      listenerMap[id](data);
    });
  };

  return SingleDispatcher;
}();
var TaskCounter = function (_SingleDispatcher) {
  _inheritsLoose(TaskCounter, _SingleDispatcher);

  function TaskCounter(deferSecond) {
    var _this;

    _this = _SingleDispatcher.call(this) || this;
    _this.list = [];
    _this.ctimer = 0;
    _this.deferSecond = deferSecond;
    return _this;
  }

  var _proto2 = TaskCounter.prototype;

  _proto2.addItem = function addItem(promise, note) {
    var _this2 = this;

    if (note === void 0) {
      note = '';
    }

    if (!this.list.some(function (item) {
      return item.promise === promise;
    })) {
      this.list.push({
        promise: promise,
        note: note
      });
      promise.finally(function () {
        return _this2.completeItem(promise);
      });

      if (this.list.length === 1 && !this.ctimer) {
        this.dispatch('Start');
        this.ctimer = env.setTimeout(function () {
          _this2.ctimer = 0;

          if (_this2.list.length > 0) {
            _this2.dispatch('Depth');
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  };

  _proto2.completeItem = function completeItem(promise) {
    var i = this.list.findIndex(function (item) {
      return item.promise === promise;
    });

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
  };

  return TaskCounter;
}(SingleDispatcher);
function compose() {
  for (var _len2 = arguments.length, funcs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    funcs[_key2] = arguments[_key2];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}
function isServer() {
  return env.isServer;
}

function isEluxComponent(data) {
  return data['__elux_component__'];
}
var MetaData = {
  moduleApiMap: null,
  moduleCaches: {},
  componentCaches: {},
  reducersMap: {},
  effectsMap: {},
  clientRouter: undefined
};
var coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 1,
  StageModuleName: 'stage',
  StageViewName: 'main',
  SSRDataKey: 'eluxSSRData',
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
  ModuleGetter: {},
  StoreInitState: function StoreInitState() {
    return {};
  },
  StoreMiddlewares: [],
  StoreLogger: function StoreLogger() {
    return undefined;
  },
  SetPageTitle: function SetPageTitle(title) {
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
var setCoreConfig = buildConfigSetter(coreConfig);
function mergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  if (coreConfig.MutableData) {
    return Object.assign.apply(Object, [target].concat(args));
  }

  return Object.assign.apply(Object, [{}, target].concat(args));
}

var errorProcessed = '__eluxProcessed__';
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
    type: "" + moduleName + coreConfig.NSP + "_loadingState",
    payload: [loadingState]
  };
}
function errorAction(error) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  var processed = !!error[errorProcessed];
  var _error = error,
      _error$code = _error.code,
      code = _error$code === void 0 ? '' : _error$code,
      _error$message = _error.message,
      message = _error$message === void 0 ? 'unkown error' : _error$message,
      detail = _error.detail;
  var actionError = {
    code: code,
    message: message,
    detail: detail
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

  var moduleOrPromise = coreConfig.ModuleGetter[moduleName]();

  if (isPromise(moduleOrPromise)) {
    var promiseModule = moduleOrPromise.then(function (_ref) {
      var module = _ref.default;
      injectActions(new module.ModelClass(moduleName, null));
      MetaData.moduleCaches[moduleName] = module;
      return module;
    }, function (reason) {
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
  var key = [moduleName, componentName].join(coreConfig.NSP);

  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key];
  }

  var moduleCallback = function moduleCallback(module) {
    var componentOrFun = module.components[componentName];

    if (isEluxComponent(componentOrFun)) {
      MetaData.componentCaches[key] = componentOrFun;
      return componentOrFun;
    }

    var promiseComponent = componentOrFun().then(function (_ref2) {
      var component = _ref2.default;
      MetaData.componentCaches[key] = component;
      return component;
    }, function (reason) {
      MetaData.componentCaches[key] = undefined;
      throw reason;
    });
    MetaData.componentCaches[key] = promiseComponent;
    return promiseComponent;
  };

  var moduleOrPromise = getModule(moduleName);

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
      MetaData.moduleApiMap = Object.keys(data).reduce(function (prev, moduleName) {
        var arr = data[moduleName];
        var actions = {};
        var actionNames = {};
        arr.forEach(function (actionName) {
          actions[actionName] = function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
            }

            return {
              type: moduleName + coreConfig.NSP + actionName,
              payload: payload
            };
          };

          actionNames[actionName] = moduleName + coreConfig.NSP + actionName;
        });
        var moduleFacade = {
          name: moduleName,
          actions: actions,
          actionNames: actionNames
        };
        prev[moduleName] = moduleFacade;
        return prev;
      }, {});
    } else {
      var cacheData = {};
      MetaData.moduleApiMap = new Proxy({}, {
        set: function set(target, moduleName, val, receiver) {
          return Reflect.set(target, moduleName, val, receiver);
        },
        get: function get(target, moduleName, receiver) {
          var val = Reflect.get(target, moduleName, receiver);

          if (val !== undefined) {
            return val;
          }

          if (!cacheData[moduleName]) {
            cacheData[moduleName] = {
              name: moduleName,
              actionNames: new Proxy({}, {
                get: function get(__, actionName) {
                  return moduleName + coreConfig.NSP + actionName;
                }
              }),
              actions: new Proxy({}, {
                get: function get(__, actionName) {
                  return function () {
                    for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      payload[_key2] = arguments[_key2];
                    }

                    return {
                      type: moduleName + coreConfig.NSP + actionName,
                      payload: payload
                    };
                  };
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
    coreConfig.ModuleGetter[moduleOrName.moduleName] = function () {
      return moduleOrName;
    };
  }
}
function injectComponent(moduleName, componentName, store) {
  return promiseCaseCallback(getComponent(moduleName, componentName), function (component) {
    if (component.__elux_component__ === 'view' && !env.isServer) {
      return promiseCaseCallback(store.mount(moduleName, 'update'), function () {
        return component;
      });
    }

    return component;
  });
}
function injectActions(model, hmr) {
  var moduleName = model.moduleName;
  var handlers = model;

  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          actionNames.split(coreConfig.MSP).forEach(function (actionName) {
            actionName = actionName.trim();

            if (actionName) {
              actionName = actionName.replace(new RegExp("^this[" + coreConfig.NSP + "]"), "" + moduleName + coreConfig.NSP);
              var arr = actionName.split(coreConfig.NSP);

              if (arr[1]) {
                transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
              } else {
                transformAction(moduleName + coreConfig.NSP + actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
              }
            }
          });
        }
      })();
    }
  }
}

function transformAction(actionName, handler, listenerModule, actionHandlerMap, hmr) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    env.console.warn("Action duplicate : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
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
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
function exportView(component) {
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}
var EmptyModel = (_class$1 = function () {
  function EmptyModel(moduleName, store) {
    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = EmptyModel.prototype;

  _proto.onMount = function onMount() {
    var actions = MetaData.moduleApiMap[this.moduleName].actions;
    this.store.dispatch(actions._initState({}));
  };

  _proto.onActive = function onActive() {
    return;
  };

  _proto.onInactive = function onInactive() {
    return;
  };

  _proto._initState = function _initState(state) {
    return state;
  };

  _createClass(EmptyModel, [{
    key: "state",
    get: function get() {
      return this.store.getState(this.moduleName);
    }
  }]);

  return EmptyModel;
}(), _applyDecoratedDescriptor(_class$1.prototype, "_initState", [reducer], Object.getOwnPropertyDescriptor(_class$1.prototype, "_initState"), _class$1.prototype), _class$1);
function exportModuleFacade(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(function (key) {
    var component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn("The exported component must implement interface EluxComponent: " + moduleName + "." + key);
    }
  });
  return {
    moduleName: moduleName,
    ModelClass: ModelClass,
    components: components,
    data: data,
    state: {},
    actions: {}
  };
}
function setLoading(item, store, _moduleName, _groupName) {
  var moduleName = _moduleName || coreConfig.StageModuleName;
  var groupName = _groupName || 'globalLoading';
  var key = moduleName + coreConfig.NSP + groupName;
  var loadings = store.loadingGroups;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(coreConfig.DepthTimeOnLoading);
    loadings[key].addListener(function (loadingState) {
      var _moduleLoadingAction;

      var action = moduleLoadingAction(moduleName, (_moduleLoadingAction = {}, _moduleLoadingAction[groupName] = loadingState, _moduleLoadingAction));
      store.dispatch(action);
    });
  }

  loadings[key].addItem(item);
  return item;
}
function effectLogger(before, after) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

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

  var fun = descriptor.value;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
function effect(loadingKey) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingKey !== null && !env.isServer) {
      var injectLoading = function injectLoading(store, curAction, effectPromise) {
        var loadingForModuleName;
        var loadingForGroupName;

        if (loadingKey === undefined) {
          loadingForModuleName = coreConfig.StageModuleName;
          loadingForGroupName = 'globalLoading';
        } else {
          var _loadingKey$split = loadingKey.split('.');

          loadingForModuleName = _loadingKey$split[0];
          loadingForGroupName = _loadingKey$split[1];
        }

        if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }

        setLoading(effectPromise, store, loadingForModuleName, loadingForGroupName);
      };

      var decorators = fun.__decorators__ || [];
      fun.__decorators__ = decorators;
      decorators.push([injectLoading, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}

function _extends$1() {
  _extends$1 = Object.assign || function (target) {
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

  return _extends$1.apply(this, arguments);
}

var reduxDevTools;

if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = env.__REDUX_DEVTOOLS_EXTENSION__.connect({
    features: {}
  });
  reduxDevTools.init({});
  reduxDevTools.subscribe(function (_ref) {
    var type = _ref.type,
        payload = _ref.payload;

    if (type === 'DISPATCH' && payload.type === 'COMMIT') {
      reduxDevTools.init({});
    }
  });
}

var effects = [];
var devLogger = function devLogger(_ref2) {
  var id = _ref2.id,
      isActive = _ref2.isActive,
      actionName = _ref2.actionName,
      payload = _ref2.payload,
      priority = _ref2.priority,
      handers = _ref2.handers,
      state = _ref2.state,
      effect = _ref2.effect;

  if (reduxDevTools) {
    var type = ["" + id + (isActive ? '' : '*') + "|", actionName, "(" + handers.length + ")"].join('');
    var _logItem = {
      type: type,
      payload: payload,
      priority: priority,
      handers: handers
    };

    if (effect) {
      effects.push(_logItem);
    } else {
      _logItem.effects = [].concat(effects);
      effects.length = 0;
      reduxDevTools.send(_logItem, state);
    }
  }
};

function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}
var preMiddleware = function preMiddleware(_ref) {
  var getStore = _ref.getStore;
  return function (next) {
    return function (action) {
      if (action.type === getErrorActionType()) {
        var actionData = getActionData(action);

        if (isProcessedError(actionData[0])) {
          return undefined;
        }

        actionData[0] = setProcessedError(actionData[0], true);
      }

      var _action$type$split = action.type.split(coreConfig.NSP),
          moduleName = _action$type$split[0],
          actionName = _action$type$split[1];

      if (!moduleName || !actionName || !coreConfig.ModuleGetter[moduleName]) {
        return undefined;
      }

      var store = getStore();
      var state = store.getState();

      if (!state[moduleName] && action.type !== getInitActionType(moduleName)) {
        return promiseCaseCallback(store.mount(moduleName, 'update'), function () {
          return next(action);
        });
      }

      return next(action);
    };
  };
};
var CoreRouter = function () {
  function CoreRouter() {
    this.listenerId = 0;
    this.listenerMap = {};
    this.action = 'init';
    this.routeKey = '';

    if (!MetaData.clientRouter) {
      MetaData.clientRouter = this;
    }
  }

  var _proto = CoreRouter.prototype;

  _proto.addListener = function addListener(callback) {
    this.listenerId++;
    var id = "" + this.listenerId;
    var listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto.dispatch = function dispatch(data) {
    var listenerMap = this.listenerMap;
    var promiseResults = [];
    Object.keys(listenerMap).forEach(function (id) {
      var result = listenerMap[id](data);

      if (isPromise(result)) {
        promiseResults.push(result);
      }
    });

    if (promiseResults.length === 0) {
      return undefined;
    } else if (promiseResults.length === 1) {
      return promiseResults[0];
    } else {
      return Promise.all(promiseResults).then(function () {
        return undefined;
      });
    }
  };

  return CoreRouter;
}();

function applyEffect(effectResult, store, model, action, dispatch, decorators) {
  if (decorators === void 0) {
    decorators = [];
  }

  var decoratorBeforeResults = [];
  decorators.forEach(function (decorator, index) {
    decoratorBeforeResults[index] = decorator[0].call(model, store, action, effectResult);
  });
  return effectResult.then(function (reslove) {
    decorators.forEach(function (decorator, index) {
      if (decorator[1]) {
        decorator[1].call(model, 'Resolved', decoratorBeforeResults[index], reslove);
      }
    });
    return reslove;
  }, function (error) {
    decorators.forEach(function (decorator, index) {
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

var Store = function () {
  function Store(sid, uid, router) {
    var _this = this;

    this.state = coreConfig.StoreInitState();
    this.injectedModels = {};
    this.mountedModules = {};
    this.currentListeners = [];
    this.nextListeners = [];
    this.currentAction = void 0;
    this.uncommittedState = {};
    this.active = false;

    this.dispatch = function (action) {
      throw 'Dispatching action while constructing your middleware is not allowed.';
    };

    this.loadingGroups = {};
    this.sid = sid;
    this.uid = uid;
    this.router = router;
    var middlewareAPI = {
      getStore: function getStore() {
        return _this;
      },
      dispatch: function dispatch(action) {
        return _this.dispatch(action);
      }
    };

    var _dispatch = function _dispatch(action) {
      _this.respondHandler(action, true);

      return _this.respondHandler(action, false);
    };

    var chain = [preMiddleware].concat(coreConfig.StoreMiddlewares).map(function (middleware) {
      return middleware(middlewareAPI);
    });
    this.dispatch = compose.apply(void 0, chain)(_dispatch);
  }

  var _proto2 = Store.prototype;

  _proto2.clone = function clone(brand) {
    return new Store(this.sid + 1, brand ? this.uid + 1 : this.uid, this.router);
  };

  _proto2.hotReplaceModel = function hotReplaceModel(moduleName, ModelClass) {
    var orignModel = this.injectedModels[moduleName];

    if (orignModel) {
      var model = new ModelClass(moduleName, this);
      this.injectedModels[moduleName] = model;

      if (this.active) {
        orignModel.onInactive();
        model.onActive();
      }
    }
  };

  _proto2.getCurrentAction = function getCurrentAction() {
    return this.currentAction;
  };

  _proto2.mount = function mount(moduleName, env) {
    var _this2 = this;

    if (!coreConfig.ModuleGetter[moduleName]) {
      return;
    }

    var mountedModules = this.mountedModules;
    var injectedModels = this.injectedModels;

    var errorCallback = function errorCallback(err) {
      if (!_this2.state[moduleName]) {
        delete mountedModules[moduleName];
        delete injectedModels[moduleName];
      }

      throw err;
    };

    var getModuleCallback = function getModuleCallback(module) {
      var model = new module.ModelClass(moduleName, _this2);
      _this2.injectedModels[moduleName] = model;
      return model.onMount(env);
    };

    if (!mountedModules[moduleName]) {
      var _result;

      try {
        var moduleOrPromise = getModule(moduleName);
        _result = promiseCaseCallback(moduleOrPromise, getModuleCallback);
      } catch (err) {
        errorCallback(err);
      }

      if (isPromise(_result)) {
        mountedModules[moduleName] = _result.then(function () {
          mountedModules[moduleName] = true;

          if (_this2.active) {
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

    var result = mountedModules[moduleName];
    return result === true ? undefined : result;
  };

  _proto2.setActive = function setActive() {
    var _this3 = this;

    if (!this.active) {
      this.active = true;
      Object.keys(this.injectedModels).forEach(function (moduleName) {
        var model = _this3.injectedModels[moduleName];
        model.onActive();
      });
    }
  };

  _proto2.setInactive = function setInactive() {
    var _this4 = this;

    if (this.active) {
      this.active = false;
      Object.keys(this.injectedModels).forEach(function (moduleName) {
        var model = _this4.injectedModels[moduleName];
        model.onInactive();
      });
    }
  };

  _proto2.ensureCanMutateNextListeners = function ensureCanMutateNextListeners() {
    if (this.nextListeners === this.currentListeners) {
      this.nextListeners = this.currentListeners.slice();
    }
  };

  _proto2.destroy = function destroy() {
    this.setInactive();

    this.dispatch = function () {};

    this.mount = function () {};
  };

  _proto2.update = function update(newState) {
    this.state = mergeState(this.state, newState);
    var listeners = this.currentListeners = this.nextListeners;

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }
  };

  _proto2.getState = function getState(moduleName) {
    return moduleName ? this.state[moduleName] : this.state;
  };

  _proto2.getUncommittedState = function getUncommittedState() {
    return this.uncommittedState;
  };

  _proto2.subscribe = function subscribe(listener) {
    var _this5 = this;

    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    var isSubscribed = true;
    this.ensureCanMutateNextListeners();
    this.nextListeners.push(listener);
    return function () {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      _this5.ensureCanMutateNextListeners();

      var index = _this5.nextListeners.indexOf(listener);

      _this5.nextListeners.splice(index, 1);

      _this5.currentListeners = [];
    };
  };

  _proto2.respondHandler = function respondHandler(action, isReducer) {
    var _this6 = this;

    var handlersMap = isReducer ? MetaData.reducersMap : MetaData.effectsMap;
    var actionName = action.type;
    var actionPriority = action.priority || [];
    var actionData = getActionData(action);

    var _actionName$split = actionName.split(coreConfig.NSP),
        actionModuleName = _actionName$split[0];

    var commonHandlers = handlersMap[action.type];
    var universalActionType = actionName.replace(new RegExp("[^" + coreConfig.NSP + "]+"), '*');
    var universalHandlers = handlersMap[universalActionType];

    var handlers = _extends$1({}, commonHandlers, universalHandlers);

    var handlerModuleNames = Object.keys(handlers);
    var prevState = this.getState();
    var logs = {
      id: this.sid,
      isActive: this.active,
      actionName: actionName,
      payload: actionData,
      priority: actionPriority,
      handers: [],
      state: 'No Change',
      effect: !isReducer
    };
    var storeLogger = coreConfig.StoreLogger;

    if (handlerModuleNames.length > 0) {
      var _orderList;

      var orderList = [];
      handlerModuleNames.forEach(function (moduleName) {
        if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });

      (_orderList = orderList).unshift.apply(_orderList, actionPriority);

      var injectedModels = this.injectedModels;
      var implemented = {};
      orderList = orderList.filter(function (moduleName) {
        if (implemented[moduleName] || !handlers[moduleName]) {
          return false;
        }

        implemented[moduleName] = true;
        return injectedModels[moduleName];
      });
      logs.handers = orderList;

      if (isReducer) {
        var newState = {};

        var uncommittedState = this.uncommittedState = _extends$1({}, prevState);

        orderList.forEach(function (moduleName) {
          var model = injectedModels[moduleName];
          var handler = handlers[moduleName];
          var result = handler.apply(model, actionData);

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
        var effectHandlers = [];
        orderList.forEach(function (moduleName) {
          var model = injectedModels[moduleName];
          var handler = handlers[moduleName];
          _this6.currentAction = action;
          var result = handler.apply(model, actionData);
          effectHandlers.push(applyEffect(toPromise(result), _this6, model, action, _this6.dispatch, handler.__decorators__));
        });
        var task = effectHandlers.length === 1 ? effectHandlers[0] : Promise.all(effectHandlers);
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
  };

  return Store;
}();
function modelHotReplacement(moduleName, ModelClass) {
  var moduleCache = MetaData.moduleCaches[moduleName];

  if (moduleCache) {
    promiseCaseCallback(moduleCache, function (module) {
      module.ModelClass = ModelClass;
      var newModel = new ModelClass(moduleName, null);
      injectActions(newModel, true);
      var page = MetaData.clientRouter.getActivePage();
      page.store.hotReplaceModel(moduleName, ModelClass);
    });
  }

  env.console.log("[HMR] @Elux Updated model: " + moduleName);
}

var _class;
function exportModule(moduleName, ModelClass, components, data) {
  return exportModuleFacade(moduleName, ModelClass, components, data);
}
function getApi(demoteForProductionOnly, injectActions) {
  var modules = getModuleApiMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);

  var GetComponent = function GetComponent(moduleName, componentName) {
    var result = getComponent(moduleName, componentName);

    if (isPromise(result)) {
      return result;
    } else {
      return Promise.resolve(result);
    }
  };

  var GetData = function GetData(moduleName) {
    var result = getModule(moduleName);

    if (isPromise(result)) {
      return result.then(function (mod) {
        return mod.data;
      });
    } else {
      return Promise.resolve(result.data);
    }
  };

  return {
    GetActions: function GetActions() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return args.reduce(function (prev, moduleName) {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetClientRouter: function GetClientRouter() {
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
var BaseModel = (_class = function () {
  function BaseModel(moduleName, store) {
    this.store = void 0;
    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = BaseModel.prototype;

  _proto.onActive = function onActive() {
    return;
  };

  _proto.onInactive = function onInactive() {
    return;
  };

  _proto.getRouter = function getRouter() {
    return this.store.router;
  };

  _proto.getPrevState = function getPrevState() {
    var runtime = this.store.router.runtime;
    return runtime.prevState[this.moduleName];
  };

  _proto.getRootState = function getRootState(type) {
    var runtime = this.store.router.runtime;
    var state;

    if (type === 'previous') {
      state = runtime.prevState;
    } else if (type === 'uncommitted') {
      state = this.store.getUncommittedState();
    } else {
      state = this.store.getState();
    }

    return state;
  };

  _proto.getPrivateActions = function getPrivateActions(actionsMap) {
    var moduleName = this.moduleName;
    var privateActions = Object.keys(actionsMap);
    privateActions.push('_initState', '_updateState', '_loadingState');
    return privateActions.reduce(function (map, actionName) {
      map[actionName] = function () {
        for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          payload[_key2] = arguments[_key2];
        }

        return {
          type: moduleName + coreConfig.NSP + actionName,
          payload: payload
        };
      };

      return map;
    }, {});
  };

  _proto.getCurrentAction = function getCurrentAction() {
    var store = this.store;
    return store.getCurrentAction();
  };

  _proto.dispatch = function dispatch(action) {
    return this.store.dispatch(action);
  };

  _proto._initState = function _initState(state) {
    return state;
  };

  _proto._updateState = function _updateState(subject, state) {
    return mergeState(this.state, state);
  };

  _proto._loadingState = function _loadingState(loadingState) {
    return mergeState(this.state, loadingState);
  };

  _createClass(BaseModel, [{
    key: "state",
    get: function get() {
      return this.store.getState(this.moduleName);
    }
  }, {
    key: "actions",
    get: function get() {
      return MetaData.moduleApiMap[this.moduleName].actions;
    }
  }]);

  return BaseModel;
}(), (_applyDecoratedDescriptor(_class.prototype, "_initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_initState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_updateState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_updateState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_loadingState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_loadingState"), _class.prototype)), _class);

function buildApp(ins, router, routerOptions) {
  var ssrData = env[coreConfig.SSRDataKey];
  var AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render: function render(_temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          _ref$id = _ref.id,
          id = _ref$id === void 0 ? 'root' : _ref$id;

      return router.init(routerOptions, ssrData || {}).then(function () {
        AppRender.toDocument(id, {
          router: router
        }, !!ssrData, ins);
      });
    }
  });
}
function buildSSR(ins, router, routerOptions) {
  var AppRender = coreConfig.AppRender;
  return Object.assign(ins, {
    render: function render(_temp2) {
      var _ref2 = _temp2 === void 0 ? {} : _temp2,
          _ref2$id = _ref2.id,
          id = _ref2$id === void 0 ? 'root' : _ref2$id;

      return router.init(routerOptions, {}).then(function () {
        var store = router.getActivePage().store;
        store.destroy();
        var eluxContext = {
          router: router
        };
        return AppRender.toString(id, eluxContext, ins).then(function (html) {
          var SSRTPL = coreConfig.SSRTPL,
              SSRDataKey = coreConfig.SSRDataKey;
          var match = SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + id + "['\"][^<>]*>", 'm'));

          if (match) {
            var state = store.getState();
            return SSRTPL.replace('</head>', "\r\n" + router.getDocumentHead() + "\r\n<script>window." + SSRDataKey + " = " + JSON.stringify(state) + ";</script>\r\n</head>").replace(match[0], match[0] + html);
          }

          return html;
        });
      });
    }
  });
}
function getTplInSSR() {
  return coreConfig.SSRTPL;
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function createCommonjsModule(fn) {
  var module = { exports: {} };
	return fn(module, module.exports), module.exports;
}

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime_1 = createCommonjsModule(function (module) {
var runtime = function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.

  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }

  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function (obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []); // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.

    generator._invoke = makeInvokeMethod(innerFn, self, context);
    return generator;
  }

  exports.wrap = wrap; // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.

  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed"; // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.

  var ContinueSentinel = {}; // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.

  function Generator() {}

  function GeneratorFunction() {}

  function GeneratorFunctionPrototype() {} // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.


  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));

  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"); // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function (genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || // For the native GeneratorFunction constructor, the best we can
    // do is to check its .name property.
    (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = function (genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }

    genFun.prototype = Object.create(Gp);
    return genFun;
  }; // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.


  exports.awrap = function (arg) {
    return {
      __await: arg
    };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);

      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;

        if (value && typeof value === "object" && hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function (value) {
            invoke("next", value, resolve, reject);
          }, function (err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function (unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function (error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function (resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise = // If enqueue has been called before, then we want to wait until
      // all previous Promises have been resolved before calling invoke,
      // so that results are always delivered in the correct order. If
      // enqueue has not been called before, then it is important to
      // call invoke immediately, without waiting on a callback to fire,
      // so that the async generator function has the opportunity to do
      // any necessary setup in a predictable way. This predictability
      // is why the Promise constructor synchronously invokes its
      // executor callback, and why async functions synchronously
      // execute code before the first await. Since we implement simple
      // async functions in terms of async generators, it is especially
      // important to get this right, even though it requires care.
      previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, // Avoid propagating failures to Promises returned by later
      // invocations of the iterator.
      callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    } // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).


    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator; // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.

  exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
    : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;
    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        } // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume


        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;

        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);

          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;
        var record = tryCatch(innerFn, self, context);

        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done ? GenStateCompleted : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };
        } else if (record.type === "throw") {
          state = GenStateCompleted; // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.

          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  } // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.


  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];

    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value; // Resume execution at the desired location (see delegateYield).

      context.next = delegate.nextLoc; // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.

      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }
    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    } // The delegate iterator is finished, so forget it and continue with
    // the outer generator.


    context.delegate = null;
    return ContinueSentinel;
  } // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.


  defineIteratorMethods(Gp);
  define(Gp, toStringTagSymbol, "Generator"); // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.

  define(Gp, iteratorSymbol, function () {
    return this;
  });
  define(Gp, "toString", function () {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{
      tryLoc: "root"
    }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function (object) {
    var keys = [];

    for (var key in object) {
      keys.push(key);
    }

    keys.reverse(); // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.

    return function next() {
      while (keys.length) {
        var key = keys.pop();

        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      } // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.


      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];

      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1,
            next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;
          return next;
        };

        return next.next = next;
      }
    } // Return an iterator with no values.


    return {
      next: doneResult
    };
  }

  exports.values = values;

  function doneResult() {
    return {
      value: undefined$1,
      done: true
    };
  }

  Context.prototype = {
    constructor: Context,
    reset: function (skipTempReset) {
      this.prev = 0;
      this.next = 0; // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.

      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined$1;
      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },
    stop: function () {
      this.done = true;
      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;

      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },
    dispatchException: function (exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;

      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }
          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }
          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },
    abrupt: function (type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },
    complete: function (record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },
    finish: function (finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch": function (tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];

        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;

          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }

          return thrown;
        }
      } // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.


      throw new Error("illegal catch attempt");
    },
    delegateYield: function (iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  }; // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.

  return exports;
}( // If this script is executing as a CommonJS module, use module.exports
// as the regeneratorRuntime namespace. Otherwise create a new empty
// object. Either way, the resulting object will be used to initialize
// the regeneratorRuntime variable at the top of this file.
module.exports );

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}
});

var regenerator = runtime_1;

var ErrorCodes = {
  ROUTE_RETURN: 'ELIX.ROUTE_RETURN',
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW'
};
function nativeUrlToUrl(nativeUrl) {
  var _nativeUrl$split = nativeUrl.split(/[?#]/),
      _nativeUrl$split$ = _nativeUrl$split[0],
      path = _nativeUrl$split$ === void 0 ? '' : _nativeUrl$split$,
      _nativeUrl$split$2 = _nativeUrl$split[1],
      search = _nativeUrl$split$2 === void 0 ? '' : _nativeUrl$split$2,
      _nativeUrl$split$3 = _nativeUrl$split[2],
      hash = _nativeUrl$split$3 === void 0 ? '' : _nativeUrl$split$3;

  var pathname = routeConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return "" + pathname + (search ? "?" + search : '') + (hash ? "#" + hash : '');
}
function urlToNativeUrl(eluxUrl) {
  var _eluxUrl$split = eluxUrl.split(/[?#]/),
      _eluxUrl$split$ = _eluxUrl$split[0],
      path = _eluxUrl$split$ === void 0 ? '' : _eluxUrl$split$,
      _eluxUrl$split$2 = _eluxUrl$split[1],
      search = _eluxUrl$split$2 === void 0 ? '' : _eluxUrl$split$2,
      _eluxUrl$split$3 = _eluxUrl$split[2],
      hash = _eluxUrl$split$3 === void 0 ? '' : _eluxUrl$split$3;

  var pathname = routeConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return "" + pathname + (search ? "?" + search : '') + (hash ? "#" + hash : '');
}
function urlToLocation(url, state) {
  var _url$split = url.split(/[?#]/),
      _url$split$ = _url$split[0],
      path = _url$split$ === void 0 ? '' : _url$split$,
      _url$split$2 = _url$split[1],
      query = _url$split$2 === void 0 ? '' : _url$split$2,
      _url$split$3 = _url$split[2],
      hash = _url$split$3 === void 0 ? '' : _url$split$3;

  var arr = ("?" + query).match(/[?&]__c=([^&]*)/) || ['', ''];
  var classname = arr[1];
  var search = ("?" + query).replace(/[?&]__c=[^&]*/g, '').substr(1);
  var pathname = '/' + path.replace(/^\/|\/$/g, '');
  var parse = routeConfig.QueryString.parse;
  var searchQuery = parse(search);
  var hashQuery = parse(hash);

  if (classname) {
    search = search ? search + "&__c=" + classname : "__c=" + classname;
  }

  return {
    url: "" + pathname + (search ? "?" + search : '') + (hash ? "#" + hash : ''),
    pathname: pathname,
    search: search,
    hash: hash,
    classname: classname,
    searchQuery: searchQuery,
    hashQuery: hashQuery,
    state: state
  };
}
function locationToUrl(_ref, defClassname) {
  var url = _ref.url,
      pathname = _ref.pathname,
      search = _ref.search,
      hash = _ref.hash,
      classname = _ref.classname,
      searchQuery = _ref.searchQuery,
      hashQuery = _ref.hashQuery;

  if (url) {
    var _url$split2 = url.split(/[?#]/);

    pathname = _url$split2[0];
    search = _url$split2[1];
    hash = _url$split2[2];
  }

  pathname = '/' + (pathname || '').replace(/^\/|\/$/g, '');
  var stringify = routeConfig.QueryString.stringify;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';

  if (!/[?&]__c=/.test("?" + search) && defClassname && classname === undefined) {
    classname = defClassname;
  }

  if (typeof classname === 'string') {
    search = ("?" + search).replace(/[?&]__c=[^&]*/g, '').substr(1);

    if (classname) {
      search = search ? search + "&__c=" + classname : "__c=" + classname;
    }
  }

  url = "" + pathname + (search ? "?" + search : '') + (hash ? "#" + hash : '');
  return url;
}
function locationToNativeLocation(location) {
  var pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return _extends$1({}, location, {
    pathname: pathname,
    url: url
  });
}
function nativeLocationToLocation(location) {
  var pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return _extends$1({}, location, {
    pathname: pathname,
    url: url
  });
}
function testChangeAction(location, routeAction) {
  return {
    type: "" + coreConfig.StageModuleName + coreConfig.NSP + "_testRouteChange",
    payload: [location, routeAction]
  };
}
function beforeChangeAction(location, routeAction) {
  return {
    type: "" + coreConfig.StageModuleName + coreConfig.NSP + "_beforeRouteChange",
    payload: [location, routeAction]
  };
}
function afterChangeAction(location, routeAction) {
  return {
    type: "" + coreConfig.StageModuleName + coreConfig.NSP + "_afterRouteChange",
    payload: [location, routeAction]
  };
}
var routeConfig = {
  NotifyNativeRouter: {
    window: true,
    page: false
  },
  QueryString: {
    parse: function parse(str) {
      return {};
    },
    stringify: function stringify() {
      return '';
    }
  },
  NativePathnameMapping: {
    in: function _in(pathname) {
      return pathname;
    },
    out: function out(pathname) {
      return pathname;
    }
  }
};
var setRouteConfig = buildConfigSetter(routeConfig);

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var HistoryStack = function () {
  function HistoryStack(limit) {
    this.currentRecord = undefined;
    this.records = [];
    this.limit = limit;
  }

  var _proto = HistoryStack.prototype;

  _proto.init = function init(record) {
    this.records = [record];
    this.currentRecord = record;
    record.setActive();
  };

  _proto.onChanged = function onChanged() {
    if (this.currentRecord !== this.records[0]) {
      this.currentRecord.setInactive();
      this.currentRecord = this.records[0];
      this.currentRecord.setActive();
    }
  };

  _proto.getCurrentItem = function getCurrentItem() {
    return this.currentRecord;
  };

  _proto.getEarliestItem = function getEarliestItem() {
    return this.records[this.records.length - 1];
  };

  _proto.getItemAt = function getItemAt(n) {
    return this.records[n];
  };

  _proto.getItems = function getItems() {
    return [].concat(this.records);
  };

  _proto.getLength = function getLength() {
    return this.records.length;
  };

  _proto.push = function push(item) {
    var records = this.records;
    records.unshift(item);

    if (records.length > this.limit) {
      var delItem = records.pop();
      delItem !== item && delItem.destroy();
    }

    this.onChanged();
  };

  _proto.replace = function replace(item) {
    var records = this.records;
    var delItem = records[0];
    records[0] = item;
    delItem !== item && delItem.destroy();
    this.onChanged();
  };

  _proto.relaunch = function relaunch(item) {
    var delList = this.records;
    this.records = [item];
    this.currentRecord = item;
    delList.forEach(function (delItem) {
      delItem !== item && delItem.destroy();
    });
    this.onChanged();
  };

  _proto.back = function back(delta) {
    var delList = this.records.splice(0, delta);

    if (this.records.length === 0) {
      var last = delList.pop();
      this.records.push(last);
    }

    delList.forEach(function (delItem) {
      if (delItem.destroy) {
        delItem.destroy();
      }
    });
    this.onChanged();
  };

  return HistoryStack;
}();
var RouteRecord = function () {
  function RouteRecord(location, pageStack) {
    this.key = void 0;
    this.title = void 0;
    this.location = location;
    this.pageStack = pageStack;
    this.key = [pageStack.key, pageStack.id++].join('_');
    this.title = '';
  }

  var _proto2 = RouteRecord.prototype;

  _proto2.setActive = function setActive() {
    return;
  };

  _proto2.setInactive = function setInactive() {
    return;
  };

  _proto2.destroy = function destroy() {
    return;
  };

  return RouteRecord;
}();
var PageStack = function (_HistoryStack) {
  _inheritsLoose(PageStack, _HistoryStack);

  function PageStack(windowStack, location, store) {
    var _this;

    _this = _HistoryStack.call(this, 20) || this;
    _this.id = 0;
    _this.key = void 0;
    _this._store = void 0;
    _this.windowStack = windowStack;
    _this._store = store;
    _this.key = '' + windowStack.id++;

    _this.init(new RouteRecord(location, _assertThisInitialized(_this)));

    return _this;
  }

  var _proto3 = PageStack.prototype;

  _proto3.replaceStore = function replaceStore(store) {
    if (this._store !== store) {
      this._store.destroy();

      this._store = store;
      store.setActive();
    }
  };

  _proto3.findRecordByKey = function findRecordByKey(key) {
    for (var i = 0, k = this.records.length; i < k; i++) {
      var item = this.records[i];

      if (item.key === key) {
        return [item, i];
      }
    }

    return undefined;
  };

  _proto3.setActive = function setActive() {
    this.store.setActive();
  };

  _proto3.setInactive = function setInactive() {
    this.store.setInactive();
  };

  _proto3.destroy = function destroy() {
    this.store.destroy();
  };

  _createClass(PageStack, [{
    key: "store",
    get: function get() {
      return this._store;
    }
  }]);

  return PageStack;
}(HistoryStack);
var WindowStack = function (_HistoryStack2) {
  _inheritsLoose(WindowStack, _HistoryStack2);

  function WindowStack(location, store) {
    var _this2;

    _this2 = _HistoryStack2.call(this, 10) || this;
    _this2.id = 0;

    _this2.init(new PageStack(_assertThisInitialized(_this2), location, store));

    return _this2;
  }

  var _proto4 = WindowStack.prototype;

  _proto4.getRecords = function getRecords() {
    return this.records.map(function (item) {
      return item.getCurrentItem();
    });
  };

  _proto4.getCurrentWindowPage = function getCurrentWindowPage() {
    var item = this.getCurrentItem();
    var store = item.store;
    var record = item.getCurrentItem();
    var location = record.location;
    return {
      store: store,
      location: location
    };
  };

  _proto4.getCurrentPages = function getCurrentPages() {
    return this.records.map(function (item) {
      var store = item.store;
      var record = item.getCurrentItem();
      var location = record.location;
      return {
        store: store,
        location: location
      };
    });
  };

  _proto4.countBack = function countBack(delta) {
    var historyStacks = this.records;
    var backSteps = [0, 0];

    for (var i = 0, k = historyStacks.length; i < k; i++) {
      var _pageStack = historyStacks[i];

      var recordNum = _pageStack.getLength();

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
  };

  _proto4.testBack = function testBack(stepOrKey, rootOnly) {
    if (typeof stepOrKey === 'string') {
      return this.findRecordByKey(stepOrKey);
    }

    var delta = stepOrKey;

    if (delta === 0) {
      var record = this.getCurrentItem().getCurrentItem();
      return {
        record: record,
        overflow: false,
        index: [0, 0]
      };
    }

    if (rootOnly) {
      if (delta < 0 || delta >= this.records.length) {
        var _record = this.getEarliestItem().getCurrentItem();

        return {
          record: _record,
          overflow: !(delta < 0),
          index: [this.records.length - 1, 0]
        };
      } else {
        var _record2 = this.getItemAt(delta).getCurrentItem();

        return {
          record: _record2,
          overflow: false,
          index: [delta, 0]
        };
      }
    }

    if (delta < 0) {
      var _pageStack2 = this.getEarliestItem();

      var _record3 = _pageStack2.getEarliestItem();

      return {
        record: _record3,
        overflow: false,
        index: [this.records.length - 1, _pageStack2.getLength() - 1]
      };
    }

    var _this$countBack = this.countBack(delta),
        rootDelta = _this$countBack[0],
        recordDelta = _this$countBack[1];

    if (rootDelta < this.records.length) {
      var _record4 = this.getItemAt(rootDelta).getItemAt(recordDelta);

      return {
        record: _record4,
        overflow: false,
        index: [rootDelta, recordDelta]
      };
    } else {
      var _pageStack3 = this.getEarliestItem();

      var _record5 = _pageStack3.getEarliestItem();

      return {
        record: _record5,
        overflow: true,
        index: [this.records.length - 1, _pageStack3.getLength() - 1]
      };
    }
  };

  _proto4.findRecordByKey = function findRecordByKey(key) {
    var arr = key.split('_');

    if (arr[0] && arr[1]) {
      for (var i = 0, k = this.records.length; i < k; i++) {
        var _pageStack4 = this.records[i];

        if (_pageStack4.key === arr[0]) {
          var item = _pageStack4.findRecordByKey(key);

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
  };

  return WindowStack;
}(HistoryStack);

var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    this.router = void 0;
    this.routeKey = '';
    this.curTask = void 0;
    this.router = new Router(this);
  }

  var _proto = BaseNativeRouter.prototype;

  _proto.onSuccess = function onSuccess() {
    if (this.curTask) {
      var _this$curTask = this.curTask,
          resolve = _this$curTask.resolve,
          timeout = _this$curTask.timeout;
      this.curTask = undefined;
      env.clearTimeout(timeout);
      this.routeKey = '';
      resolve();
    }
  };

  _proto.testExecute = function testExecute(method, location, backIndex) {
    var testMethod = '_' + method;
    this[testMethod] && this[testMethod](locationToNativeLocation(location), backIndex);
  };

  _proto.execute = function execute(method, location, key, backIndex) {
    var _this = this;

    var nativeLocation = locationToNativeLocation(location);
    var result = this[method](nativeLocation, key, backIndex);

    if (result) {
      this.routeKey = key;
      return new Promise(function (resolve) {
        var timeout = env.setTimeout(function () {
          env.console.error('Native router timeout: ' + nativeLocation.url);

          _this.onSuccess();
        }, 2000);
        _this.curTask = {
          resolve: resolve,
          timeout: timeout
        };
      });
    }
  };

  return BaseNativeRouter;
}();
var clientDocumentHeadTimer = 0;
var Router = function (_CoreRouter) {
  _inheritsLoose(Router, _CoreRouter);

  function Router(nativeRouter) {
    var _this2;

    _this2 = _CoreRouter.call(this) || this;
    _this2.curTask = void 0;
    _this2.taskList = [];
    _this2.windowStack = void 0;
    _this2.documentHead = '';

    _this2.onTaskComplete = function () {
      var task = _this2.taskList.shift();

      if (task) {
        _this2.curTask = task;
        var onTaskComplete = _this2.onTaskComplete;
        env.setTimeout(function () {
          return task[0]().finally(onTaskComplete).then(task[1], task[2]);
        }, 0);
      } else {
        _this2.curTask = undefined;
      }
    };

    _this2.nativeRouter = nativeRouter;
    return _this2;
  }

  var _proto2 = Router.prototype;

  _proto2.addTask = function addTask(execute) {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      var task = [function () {
        return setLoading(execute(), _this3.getActivePage().store);
      }, resolve, reject];

      if (_this3.curTask) {
        _this3.taskList.push(task);
      } else {
        _this3.curTask = task;
        task[0]().finally(_this3.onTaskComplete).then(task[1], task[2]);
      }
    });
  };

  _proto2.getDocumentHead = function getDocumentHead() {
    return this.documentHead;
  };

  _proto2.setDocumentHead = function setDocumentHead(html) {
    var _this4 = this;

    this.documentHead = html;

    if (!env.isServer && !clientDocumentHeadTimer) {
      clientDocumentHeadTimer = env.setTimeout(function () {
        clientDocumentHeadTimer = 0;
        var arr = _this4.documentHead.match(/<title>(.*?)<\/title>/) || [];

        if (arr[1]) {
          coreConfig.SetPageTitle(arr[1]);
        }
      }, 0);
    }
  };

  _proto2.savePageTitle = function savePageTitle() {
    var arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];
    var title = arr[1] || '';
    this.windowStack.getCurrentItem().getCurrentItem().title = title;
  };

  _proto2.nativeInitiated = function nativeInitiated() {
    return !this.nativeRouter.routeKey;
  };

  _proto2.getHistoryLength = function getHistoryLength(target) {
    return target === 'window' ? this.windowStack.getLength() - 1 : this.windowStack.getCurrentItem().getLength() - 1;
  };

  _proto2.getHistory = function getHistory(target) {
    return target === 'window' ? this.windowStack.getRecords().slice(1) : this.windowStack.getCurrentItem().getItems().slice(1);
  };

  _proto2.findRecordByKey = function findRecordByKey(recordKey) {
    var _this$windowStack$fin = this.windowStack.findRecordByKey(recordKey),
        _this$windowStack$fin2 = _this$windowStack$fin.record,
        key = _this$windowStack$fin2.key,
        location = _this$windowStack$fin2.location,
        title = _this$windowStack$fin2.title,
        overflow = _this$windowStack$fin.overflow,
        index = _this$windowStack$fin.index;

    return {
      overflow: overflow,
      index: index,
      record: {
        key: key,
        location: location,
        title: title
      }
    };
  };

  _proto2.findRecordByStep = function findRecordByStep(delta, rootOnly) {
    var _this$windowStack$tes = this.windowStack.testBack(delta, !!rootOnly),
        _this$windowStack$tes2 = _this$windowStack$tes.record,
        key = _this$windowStack$tes2.key,
        location = _this$windowStack$tes2.location,
        title = _this$windowStack$tes2.title,
        overflow = _this$windowStack$tes.overflow,
        index = _this$windowStack$tes.index;

    return {
      overflow: overflow,
      index: index,
      record: {
        key: key,
        location: location,
        title: title
      }
    };
  };

  _proto2.getActivePage = function getActivePage() {
    return this.windowStack.getCurrentWindowPage();
  };

  _proto2.getCurrentPages = function getCurrentPages() {
    return this.windowStack.getCurrentPages();
  };

  _proto2.mountStore = function () {
    var _mountStore = _asyncToGenerator(regenerator.mark(function _callee(prevStore, newStore, historyStore) {
      var prevState;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              prevState = prevStore.getState();
              this.runtime = {
                timestamp: Date.now(),
                prevState: coreConfig.MutableData ? deepClone(prevState) : prevState,
                completed: false
              };

              if (!(newStore === historyStore)) {
                _context.next = 5;
                break;
              }

              this.runtime.completed = true;
              return _context.abrupt("return");

            case 5:
              _context.prev = 5;
              _context.next = 8;
              return newStore.mount(coreConfig.StageModuleName, 'route');

            case 8:
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](5);
              env.console.error(_context.t0);

            case 13:
              this.runtime.completed = true;

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[5, 10]]);
    }));

    function mountStore(_x, _x2, _x3) {
      return _mountStore.apply(this, arguments);
    }

    return mountStore;
  }();

  _proto2.redirectOnServer = function redirectOnServer(url) {
    if (env.isServer) {
      var nativeUrl = urlToNativeUrl(url);
      var err = {
        code: ErrorCodes.ROUTE_REDIRECT,
        message: 'Route change in server is not allowed.',
        detail: nativeUrl
      };
      throw err;
    }
  };

  _proto2.init = function init(routerInitOptions, prevState) {
    this.init = function () {
      return Promise.resolve();
    };

    this.initOptions = routerInitOptions;
    this.location = urlToLocation(nativeUrlToUrl(routerInitOptions.url), undefined);
    this.action = 'init';
    this.windowStack = new WindowStack(this.location, new Store(0, 0, this));
    this.routeKey = this.findRecordByStep(0).record.key;
    this.runtime = {
      timestamp: Date.now(),
      prevState: prevState,
      completed: false
    };
    var task = [this._init.bind(this), function () {
      return undefined;
    }, function () {
      return undefined;
    }];
    this.curTask = task;
    return task[0]().finally(this.onTaskComplete);
  };

  _proto2._init = function () {
    var _init2 = _asyncToGenerator(regenerator.mark(function _callee2() {
      var action, location, routeKey, store;
      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              action = this.action, location = this.location, routeKey = this.routeKey;
              _context2.next = 3;
              return this.nativeRouter.execute(action, location, routeKey);

            case 3:
              store = this.getActivePage().store;
              _context2.prev = 4;
              _context2.next = 7;
              return store.mount(coreConfig.StageModuleName, 'init');

            case 7:
              _context2.next = 9;
              return store.dispatch(testChangeAction(this.location, this.action));

            case 9:
              _context2.next = 17;
              break;

            case 11:
              _context2.prev = 11;
              _context2.t0 = _context2["catch"](4);

              if (!(_context2.t0.code === ErrorCodes.ROUTE_RETURN || _context2.t0.code === ErrorCodes.ROUTE_REDIRECT)) {
                _context2.next = 16;
                break;
              }

              this.taskList = [];
              throw _context2.t0;

            case 16:
              env.console.error(_context2.t0);

            case 17:
              this.runtime.completed = true;
              this.dispatch({
                location: location,
                action: action,
                prevStore: store,
                newStore: store,
                windowChanged: true
              });

            case 19:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[4, 11]]);
    }));

    function _init() {
      return _init2.apply(this, arguments);
    }

    return _init;
  }();

  _proto2.computeUrl = function computeUrl(partialLocation, action, target) {
    var curClassname = this.location.classname;
    var defClassname = curClassname;

    if (action === 'relaunch') {
      defClassname = target === 'window' ? '' : curClassname;
    }

    return locationToUrl(partialLocation, defClassname);
  };

  _proto2.relaunch = function relaunch(partialLocation, target, refresh, _nativeCaller) {
    if (refresh === void 0) {
      refresh = false;
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    return this.addTask(this._relaunch.bind(this, partialLocation, target, refresh, _nativeCaller));
  };

  _proto2._relaunch = function () {
    var _relaunch2 = _asyncToGenerator(regenerator.mark(function _callee3(partialLocation, target, refresh, _nativeCaller) {
      var action, url, location, NotifyNativeRouter, prevStore, newStore, pageStack, newRecord;
      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              action = 'relaunch';
              url = this.computeUrl(partialLocation, action, target);
              this.redirectOnServer(url);
              location = urlToLocation(url, partialLocation.state);
              NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

              if (!_nativeCaller && NotifyNativeRouter) {
                this.nativeRouter.testExecute(action, location);
              }

              prevStore = this.getActivePage().store;
              _context3.prev = 7;
              _context3.next = 10;
              return prevStore.dispatch(testChangeAction(location, action));

            case 10:
              _context3.next = 16;
              break;

            case 12:
              _context3.prev = 12;
              _context3.t0 = _context3["catch"](7);

              if (_nativeCaller) {
                _context3.next = 16;
                break;
              }

              throw _context3.t0;

            case 16:
              _context3.next = 18;
              return prevStore.dispatch(beforeChangeAction(location, action));

            case 18:
              this.savePageTitle();
              this.location = location;
              this.action = action;
              newStore = prevStore.clone(refresh);
              pageStack = this.windowStack.getCurrentItem();
              newRecord = new RouteRecord(location, pageStack);
              this.routeKey = newRecord.key;

              if (target === 'window') {
                pageStack.relaunch(newRecord);
                this.windowStack.relaunch(pageStack);
              } else {
                pageStack.relaunch(newRecord);
              }

              pageStack.replaceStore(newStore);
              _context3.next = 29;
              return this.mountStore(prevStore, newStore);

            case 29:
              if (!(!_nativeCaller && NotifyNativeRouter)) {
                _context3.next = 32;
                break;
              }

              _context3.next = 32;
              return this.nativeRouter.execute(action, location, newRecord.key);

            case 32:
              _context3.next = 34;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: prevStore,
                newStore: newStore,
                windowChanged: target === 'window'
              });

            case 34:
              newStore.dispatch(afterChangeAction(location, action));

            case 35:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this, [[7, 12]]);
    }));

    function _relaunch(_x4, _x5, _x6, _x7) {
      return _relaunch2.apply(this, arguments);
    }

    return _relaunch;
  }();

  _proto2.replace = function replace(partialLocation, target, refresh, _nativeCaller) {
    if (refresh === void 0) {
      refresh = false;
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    return this.addTask(this._replace.bind(this, partialLocation, target, refresh, _nativeCaller));
  };

  _proto2._replace = function () {
    var _replace2 = _asyncToGenerator(regenerator.mark(function _callee4(partialLocation, target, refresh, _nativeCaller) {
      var action, url, location, NotifyNativeRouter, prevStore, newStore, pageStack, newRecord;
      return regenerator.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              action = 'replace';
              url = this.computeUrl(partialLocation, action, target);
              this.redirectOnServer(url);
              location = urlToLocation(url, partialLocation.state);
              NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

              if (!_nativeCaller && NotifyNativeRouter) {
                this.nativeRouter.testExecute(action, location);
              }

              prevStore = this.getActivePage().store;
              _context4.prev = 7;
              _context4.next = 10;
              return prevStore.dispatch(testChangeAction(location, action));

            case 10:
              _context4.next = 16;
              break;

            case 12:
              _context4.prev = 12;
              _context4.t0 = _context4["catch"](7);

              if (_nativeCaller) {
                _context4.next = 16;
                break;
              }

              throw _context4.t0;

            case 16:
              _context4.next = 18;
              return prevStore.dispatch(beforeChangeAction(location, action));

            case 18:
              this.savePageTitle();
              this.location = location;
              this.action = action;
              newStore = prevStore.clone(refresh);
              pageStack = this.windowStack.getCurrentItem();
              newRecord = new RouteRecord(location, pageStack);
              this.routeKey = newRecord.key;

              if (target === 'window') {
                pageStack.relaunch(newRecord);
              } else {
                pageStack.replace(newRecord);
              }

              pageStack.replaceStore(newStore);
              _context4.next = 29;
              return this.mountStore(prevStore, newStore);

            case 29:
              if (!(!_nativeCaller && NotifyNativeRouter)) {
                _context4.next = 32;
                break;
              }

              _context4.next = 32;
              return this.nativeRouter.execute(action, location, newRecord.key);

            case 32:
              _context4.next = 34;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: prevStore,
                newStore: newStore,
                windowChanged: target === 'window'
              });

            case 34:
              newStore.dispatch(afterChangeAction(location, action));

            case 35:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this, [[7, 12]]);
    }));

    function _replace(_x8, _x9, _x10, _x11) {
      return _replace2.apply(this, arguments);
    }

    return _replace;
  }();

  _proto2.push = function push(partialLocation, target, refresh, _nativeCaller) {
    if (refresh === void 0) {
      refresh = false;
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    return this.addTask(this._push.bind(this, partialLocation, target, refresh, _nativeCaller));
  };

  _proto2._push = function () {
    var _push2 = _asyncToGenerator(regenerator.mark(function _callee5(partialLocation, target, refresh, _nativeCaller) {
      var action, url, location, NotifyNativeRouter, prevStore, newStore, pageStack, newRecord, newPageStack;
      return regenerator.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              action = 'push';
              url = this.computeUrl(partialLocation, action, target);
              this.redirectOnServer(url);
              location = urlToLocation(url, partialLocation.state);
              NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

              if (!_nativeCaller && NotifyNativeRouter) {
                this.nativeRouter.testExecute(action, location);
              }

              prevStore = this.getActivePage().store;
              _context5.prev = 7;
              _context5.next = 10;
              return prevStore.dispatch(testChangeAction(location, action));

            case 10:
              _context5.next = 16;
              break;

            case 12:
              _context5.prev = 12;
              _context5.t0 = _context5["catch"](7);

              if (_nativeCaller) {
                _context5.next = 16;
                break;
              }

              throw _context5.t0;

            case 16:
              _context5.next = 18;
              return prevStore.dispatch(beforeChangeAction(location, action));

            case 18:
              this.savePageTitle();
              this.location = location;
              this.action = action;
              newStore = prevStore.clone(target === 'window' || refresh);
              pageStack = this.windowStack.getCurrentItem();

              if (!(target === 'window')) {
                _context5.next = 32;
                break;
              }

              newPageStack = new PageStack(this.windowStack, location, newStore);
              newRecord = newPageStack.getCurrentItem();
              this.routeKey = newRecord.key;
              this.windowStack.push(newPageStack);
              _context5.next = 30;
              return this.mountStore(prevStore, newStore);

            case 30:
              _context5.next = 38;
              break;

            case 32:
              newRecord = new RouteRecord(location, pageStack);
              this.routeKey = newRecord.key;
              pageStack.push(newRecord);
              pageStack.replaceStore(newStore);
              _context5.next = 38;
              return this.mountStore(prevStore, newStore);

            case 38:
              if (!(!_nativeCaller && NotifyNativeRouter)) {
                _context5.next = 41;
                break;
              }

              _context5.next = 41;
              return this.nativeRouter.execute(action, location, newRecord.key);

            case 41:
              _context5.next = 43;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: prevStore,
                newStore: newStore,
                windowChanged: target === 'window'
              });

            case 43:
              newStore.dispatch(afterChangeAction(location, action));

            case 44:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this, [[7, 12]]);
    }));

    function _push(_x12, _x13, _x14, _x15) {
      return _push2.apply(this, arguments);
    }

    return _push;
  }();

  _proto2.back = function back(stepOrKeyOrCallback, target, refresh, overflowRedirect, _nativeCaller) {
    if (refresh === void 0) {
      refresh = false;
    }

    if (overflowRedirect === void 0) {
      overflowRedirect = '';
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    if (!stepOrKeyOrCallback) {
      return this.replace(this.location, 'page', refresh);
    }

    return this.addTask(this._back.bind(this, stepOrKeyOrCallback, target, refresh, overflowRedirect, _nativeCaller));
  };

  _proto2._back = function () {
    var _back2 = _asyncToGenerator(regenerator.mark(function _callee6(stepOrKeyOrCallback, target, refresh, overflowRedirect, _nativeCaller) {
      var action, stepOrKey, items, i, _this$windowStack$tes3, record, overflow, index, prevStore, location, title, NotifyNativeRouter, pageStack, historyStore, newStore;

      return regenerator.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              action = 'back';
              this.redirectOnServer(overflowRedirect || '/');
              stepOrKey = '';

              if (typeof stepOrKeyOrCallback === 'function') {
                items = this.getHistory(target);
                i = items.findIndex(stepOrKeyOrCallback);

                if (i > -1) {
                  stepOrKey = items[i].key;
                }
              } else {
                stepOrKey = stepOrKeyOrCallback;
              }

              if (stepOrKey) {
                _context6.next = 6;
                break;
              }

              return _context6.abrupt("return", this.backError(stepOrKey, overflowRedirect));

            case 6:
              _this$windowStack$tes3 = this.windowStack.testBack(stepOrKey, target === 'window'), record = _this$windowStack$tes3.record, overflow = _this$windowStack$tes3.overflow, index = _this$windowStack$tes3.index;

              if (!overflow) {
                _context6.next = 9;
                break;
              }

              return _context6.abrupt("return", this.backError(stepOrKey, overflowRedirect));

            case 9:
              if (!(!index[0] && !index[1])) {
                _context6.next = 11;
                break;
              }

              return _context6.abrupt("return");

            case 11:
              prevStore = this.getActivePage().store;
              location = record.location;
              title = record.title;
              NotifyNativeRouter = [];

              if (index[0]) {
                NotifyNativeRouter[0] = routeConfig.NotifyNativeRouter.window;
              }

              if (index[1]) {
                NotifyNativeRouter[1] = routeConfig.NotifyNativeRouter.page;
              }

              if (!_nativeCaller && NotifyNativeRouter.length) {
                this.nativeRouter.testExecute(action, location, index);
              }

              _context6.prev = 18;
              _context6.next = 21;
              return prevStore.dispatch(testChangeAction(location, action));

            case 21:
              _context6.next = 27;
              break;

            case 23:
              _context6.prev = 23;
              _context6.t0 = _context6["catch"](18);

              if (_nativeCaller) {
                _context6.next = 27;
                break;
              }

              throw _context6.t0;

            case 27:
              _context6.next = 29;
              return prevStore.dispatch(beforeChangeAction(location, action));

            case 29:
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

              pageStack = this.windowStack.getCurrentItem();
              historyStore = pageStack.store;
              newStore = historyStore;

              if (index[1] !== 0) {
                newStore = prevStore.clone(refresh);
                pageStack.replaceStore(newStore);
              }

              _context6.next = 41;
              return this.mountStore(prevStore, newStore);

            case 41:
              if (!(!_nativeCaller && NotifyNativeRouter.length)) {
                _context6.next = 44;
                break;
              }

              _context6.next = 44;
              return this.nativeRouter.execute(action, location, record.key, index);

            case 44:
              this.setDocumentHead("<title>" + title + "</title>");
              _context6.next = 47;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: prevStore,
                newStore: newStore,
                windowChanged: !!index[0]
              });

            case 47:
              newStore.dispatch(afterChangeAction(location, action));

            case 48:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this, [[18, 23]]);
    }));

    function _back(_x16, _x17, _x18, _x19, _x20) {
      return _back2.apply(this, arguments);
    }

    return _back;
  }();

  _proto2.backError = function backError(stepOrKey, redirect) {
    var prevStore = this.getActivePage().store;
    var backOverflow = {
      code: ErrorCodes.ROUTE_BACK_OVERFLOW,
      message: 'Overflowed on route backward.',
      detail: {
        stepOrKey: stepOrKey,
        redirect: redirect
      }
    };
    return prevStore.dispatch(errorAction(backOverflow));
  };

  return Router;
}(CoreRouter);

function isAbsolute$1(e) {
  return "/" === e.charAt(0);
}

function spliceOne$1(e, t) {
  for (var s = t, n = s + 1, i = e.length; n < i; s += 1, n += 1) e[s] = e[n];

  e.pop();
}

function resolvePathname$3(e, t) {
  void 0 === t && (t = "");
  var s,
      n = e && e.split("/") || [],
      i = t && t.split("/") || [],
      l = e && isAbsolute$1(e),
      r = t && isAbsolute$1(t),
      o = l || r;
  if (e && isAbsolute$1(e) ? i = n : n.length && (i.pop(), i = i.concat(n)), !i.length) return "/";

  if (i.length) {
    var u = i[i.length - 1];
    s = "." === u || ".." === u || "" === u;
  } else s = !1;

  for (var a = 0, c = i.length; 0 <= c; c--) {
    var f = i[c];
    "." === f ? spliceOne$1(i, c) : ".." === f ? (spliceOne$1(i, c), a++) : a && (spliceOne$1(i, c), a--);
  }

  if (!o) for (; a--; a) i.unshift("..");
  !o || "" === i[0] || i[0] && isAbsolute$1(i[0]) || i.unshift("");
  var h = i.join("/");
  return s && "/" !== h.substr(-1) && (h += "/"), h;
}

var resolvePathname_min = resolvePathname$3;

function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
} // About 1.5x faster than the two-arg version of Array#splice()


function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
    list[i] = list[k];
  }

  list.pop();
} // This implementation is based heavily on node's url.parse


function resolvePathname$2(to, from) {
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

var resolvePathname_1 = resolvePathname$2;

var resolvePathname$1 = createCommonjsModule(function (module) {

if (process.env.NODE_ENV === 'production') {
  module.exports = resolvePathname_min;
} else {
  module.exports = resolvePathname_1;
}
});

function valueOf$1(e) {
  return e.valueOf ? e.valueOf() : Object.prototype.valueOf.call(e);
}

function valueEqual$3(u, r) {
  if (u === r) return !0;
  if (null == u || null == r) return !1;
  if (Array.isArray(u)) return Array.isArray(r) && u.length === r.length && u.every(function (e, u) {
    return valueEqual$3(e, r[u]);
  });
  if ("object" != typeof u && "object" != typeof r) return !1;
  var e = valueOf$1(u),
      t = valueOf$1(r);
  return e !== u || t !== r ? valueEqual$3(e, t) : Object.keys(Object.assign({}, u, r)).every(function (e) {
    return valueEqual$3(u[e], r[e]);
  });
}

var valueEqual_min = valueEqual$3;

function valueOf(obj) {
  return obj.valueOf ? obj.valueOf() : Object.prototype.valueOf.call(obj);
}

function valueEqual$2(a, b) {
  // Test for strict equality first.
  if (a === b) return true; // Otherwise, if either of them == null they are not equal.

  if (a == null || b == null) return false;

  if (Array.isArray(a)) {
    return Array.isArray(b) && a.length === b.length && a.every(function (item, index) {
      return valueEqual$2(item, b[index]);
    });
  }

  if (typeof a === 'object' || typeof b === 'object') {
    var aValue = valueOf(a);
    var bValue = valueOf(b);
    if (aValue !== a || bValue !== b) return valueEqual$2(aValue, bValue);
    return Object.keys(Object.assign({}, a, b)).every(function (key) {
      return valueEqual$2(a[key], b[key]);
    });
  }

  return false;
}

var valueEqual_1 = valueEqual$2;

var valueEqual$1 = createCommonjsModule(function (module) {

if (process.env.NODE_ENV === 'production') {
  module.exports = valueEqual_min;
} else {
  module.exports = valueEqual_1;
}
});

var isProduction$1 = process.env.NODE_ENV === 'production';

function warning$1(condition, message) {
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

var tinyWarning_cjs = warning$1;

var isProduction = process.env.NODE_ENV === 'production';
var prefix = 'Invariant failed';

function invariant$1(condition, message) {
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

var tinyInvariant_cjs = invariant$1;

var history_min = createCommonjsModule(function (module, exports) {

function _interopDefault(t) {
  return t && "object" == typeof t && "default" in t ? t.default : t;
}

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var resolvePathname = _interopDefault(resolvePathname$1),
    valueEqual = _interopDefault(valueEqual$1);



var invariant = _interopDefault(tinyInvariant_cjs);

function _extends() {
  return (_extends = Object.assign || function (t) {
    for (var n = 1; n < arguments.length; n++) {
      var e = arguments[n];

      for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && (t[a] = e[a]);
    }

    return t;
  }).apply(this, arguments);
}

function addLeadingSlash(t) {
  return "/" === t.charAt(0) ? t : "/" + t;
}

function stripLeadingSlash(t) {
  return "/" === t.charAt(0) ? t.substr(1) : t;
}

function hasBasename(t, n) {
  return 0 === t.toLowerCase().indexOf(n.toLowerCase()) && -1 !== "/?#".indexOf(t.charAt(n.length));
}

function stripBasename(t, n) {
  return hasBasename(t, n) ? t.substr(n.length) : t;
}

function stripTrailingSlash(t) {
  return "/" === t.charAt(t.length - 1) ? t.slice(0, -1) : t;
}

function parsePath(t) {
  var n = t || "/",
      e = "",
      a = "",
      r = n.indexOf("#");
  -1 !== r && (a = n.substr(r), n = n.substr(0, r));
  var o = n.indexOf("?");
  return -1 !== o && (e = n.substr(o), n = n.substr(0, o)), {
    pathname: n,
    search: "?" === e ? "" : e,
    hash: "#" === a ? "" : a
  };
}

function createPath(t) {
  var n = t.pathname,
      e = t.search,
      a = t.hash,
      r = n || "/";
  return e && "?" !== e && (r += "?" === e.charAt(0) ? e : "?" + e), a && "#" !== a && (r += "#" === a.charAt(0) ? a : "#" + a), r;
}

function createLocation(t, n, e, a) {
  var r;
  "string" == typeof t ? (r = parsePath(t)).state = n : (void 0 === (r = _extends({}, t)).pathname && (r.pathname = ""), r.search ? "?" !== r.search.charAt(0) && (r.search = "?" + r.search) : r.search = "", r.hash ? "#" !== r.hash.charAt(0) && (r.hash = "#" + r.hash) : r.hash = "", void 0 !== n && void 0 === r.state && (r.state = n));

  try {
    r.pathname = decodeURI(r.pathname);
  } catch (t) {
    throw t instanceof URIError ? new URIError('Pathname "' + r.pathname + '" could not be decoded. This is likely caused by an invalid percent-encoding.') : t;
  }

  return e && (r.key = e), a ? r.pathname ? "/" !== r.pathname.charAt(0) && (r.pathname = resolvePathname(r.pathname, a.pathname)) : r.pathname = a.pathname : r.pathname || (r.pathname = "/"), r;
}

function locationsAreEqual(t, n) {
  return t.pathname === n.pathname && t.search === n.search && t.hash === n.hash && t.key === n.key && valueEqual(t.state, n.state);
}

function createTransitionManager() {
  var o = null;
  var a = [];
  return {
    setPrompt: function (t) {
      return o = t, function () {
        o === t && (o = null);
      };
    },
    confirmTransitionTo: function (t, n, e, a) {
      if (null != o) {
        var r = "function" == typeof o ? o(t, n) : o;
        "string" == typeof r ? "function" == typeof e ? e(r, a) : a(!0) : a(!1 !== r);
      } else a(!0);
    },
    appendListener: function (t) {
      var n = !0;

      function e() {
        n && t.apply(void 0, arguments);
      }

      return a.push(e), function () {
        n = !1, a = a.filter(function (t) {
          return t !== e;
        });
      };
    },
    notifyListeners: function () {
      for (var t = arguments.length, n = new Array(t), e = 0; e < t; e++) n[e] = arguments[e];

      a.forEach(function (t) {
        return t.apply(void 0, n);
      });
    }
  };
}

var canUseDOM = !("undefined" == typeof window || !window.document || !window.document.createElement);

function getConfirmation(t, n) {
  n(window.confirm(t));
}

function supportsHistory() {
  var t = window.navigator.userAgent;
  return (-1 === t.indexOf("Android 2.") && -1 === t.indexOf("Android 4.0") || -1 === t.indexOf("Mobile Safari") || -1 !== t.indexOf("Chrome") || -1 !== t.indexOf("Windows Phone")) && window.history && "pushState" in window.history;
}

function supportsPopStateOnHashChange() {
  return -1 === window.navigator.userAgent.indexOf("Trident");
}

function supportsGoWithoutReloadUsingHash() {
  return -1 === window.navigator.userAgent.indexOf("Firefox");
}

function isExtraneousPopstateEvent(t) {
  return void 0 === t.state && -1 === navigator.userAgent.indexOf("CriOS");
}

var PopStateEvent = "popstate",
    HashChangeEvent = "hashchange";

function getHistoryState() {
  try {
    return window.history.state || {};
  } catch (t) {
    return {};
  }
}

function createBrowserHistory(t) {
  void 0 === t && (t = {}), canUseDOM || invariant(!1);
  var s = window.history,
      c = supportsHistory(),
      n = !supportsPopStateOnHashChange(),
      e = t,
      a = e.forceRefresh,
      h = void 0 !== a && a,
      r = e.getUserConfirmation,
      u = void 0 === r ? getConfirmation : r,
      o = e.keyLength,
      i = void 0 === o ? 6 : o,
      f = t.basename ? stripTrailingSlash(addLeadingSlash(t.basename)) : "";

  function l(t) {
    var n = t || {},
        e = n.key,
        a = n.state,
        r = window.location,
        o = r.pathname + r.search + r.hash;
    return f && (o = stripBasename(o, f)), createLocation(o, a, e);
  }

  function d() {
    return Math.random().toString(36).substr(2, i);
  }

  var v = createTransitionManager();

  function p(t) {
    _extends(T, t), T.length = s.length, v.notifyListeners(T.location, T.action);
  }

  function g(t) {
    isExtraneousPopstateEvent(t) || w(l(t.state));
  }

  function P() {
    w(l(getHistoryState()));
  }

  var m = !1;

  function w(n) {
    if (m) m = !1, p();else {
      v.confirmTransitionTo(n, "POP", u, function (t) {
        t ? p({
          action: "POP",
          location: n
        }) : function (t) {
          var n = T.location,
              e = H.indexOf(n.key);
          -1 === e && (e = 0);
          var a = H.indexOf(t.key);
          -1 === a && (a = 0);
          var r = e - a;
          r && (m = !0, L(r));
        }(n);
      });
    }
  }

  var y = l(getHistoryState()),
      H = [y.key];

  function x(t) {
    return f + createPath(t);
  }

  function L(t) {
    s.go(t);
  }

  var O = 0;

  function E(t) {
    1 === (O += t) && 1 === t ? (window.addEventListener(PopStateEvent, g), n && window.addEventListener(HashChangeEvent, P)) : 0 === O && (window.removeEventListener(PopStateEvent, g), n && window.removeEventListener(HashChangeEvent, P));
  }

  var S = !1;
  var T = {
    length: s.length,
    action: "POP",
    location: y,
    createHref: x,
    push: function (t, n) {
      var i = createLocation(t, n, d(), T.location);
      v.confirmTransitionTo(i, "PUSH", u, function (t) {
        if (t) {
          var n = x(i),
              e = i.key,
              a = i.state;
          if (c) {
            if (s.pushState({
              key: e,
              state: a
            }, null, n), h) window.location.href = n;else {
              var r = H.indexOf(T.location.key),
                  o = H.slice(0, r + 1);
              o.push(i.key), H = o, p({
                action: "PUSH",
                location: i
              });
            }
          } else window.location.href = n;
        }
      });
    },
    replace: function (t, n) {
      var o = "REPLACE",
          i = createLocation(t, n, d(), T.location);
      v.confirmTransitionTo(i, o, u, function (t) {
        if (t) {
          var n = x(i),
              e = i.key,
              a = i.state;
          if (c) {
            if (s.replaceState({
              key: e,
              state: a
            }, null, n), h) window.location.replace(n);else {
              var r = H.indexOf(T.location.key);
              -1 !== r && (H[r] = i.key), p({
                action: o,
                location: i
              });
            }
          } else window.location.replace(n);
        }
      });
    },
    go: L,
    goBack: function () {
      L(-1);
    },
    goForward: function () {
      L(1);
    },
    block: function (t) {
      void 0 === t && (t = !1);
      var n = v.setPrompt(t);
      return S || (E(1), S = !0), function () {
        return S && (S = !1, E(-1)), n();
      };
    },
    listen: function (t) {
      var n = v.appendListener(t);
      return E(1), function () {
        E(-1), n();
      };
    }
  };
  return T;
}

var HashChangeEvent$1 = "hashchange",
    HashPathCoders = {
  hashbang: {
    encodePath: function (t) {
      return "!" === t.charAt(0) ? t : "!/" + stripLeadingSlash(t);
    },
    decodePath: function (t) {
      return "!" === t.charAt(0) ? t.substr(1) : t;
    }
  },
  noslash: {
    encodePath: stripLeadingSlash,
    decodePath: addLeadingSlash
  },
  slash: {
    encodePath: addLeadingSlash,
    decodePath: addLeadingSlash
  }
};

function stripHash(t) {
  var n = t.indexOf("#");
  return -1 === n ? t : t.slice(0, n);
}

function getHashPath() {
  var t = window.location.href,
      n = t.indexOf("#");
  return -1 === n ? "" : t.substring(n + 1);
}

function pushHashPath(t) {
  window.location.hash = t;
}

function replaceHashPath(t) {
  window.location.replace(stripHash(window.location.href) + "#" + t);
}

function createHashHistory(t) {
  void 0 === t && (t = {}), canUseDOM || invariant(!1);
  var n = window.history,
      e = (supportsGoWithoutReloadUsingHash(), t),
      a = e.getUserConfirmation,
      i = void 0 === a ? getConfirmation : a,
      r = e.hashType,
      o = void 0 === r ? "slash" : r,
      s = t.basename ? stripTrailingSlash(addLeadingSlash(t.basename)) : "",
      c = HashPathCoders[o],
      h = c.encodePath,
      u = c.decodePath;

  function f() {
    var t = u(getHashPath());
    return s && (t = stripBasename(t, s)), createLocation(t);
  }

  var l = createTransitionManager();

  function d(t) {
    _extends(E, t), E.length = n.length, l.notifyListeners(E.location, E.action);
  }

  var v = !1,
      p = null;

  function g() {
    var t = getHashPath(),
        n = h(t);
    if (t !== n) replaceHashPath(n);else {
      var e = f(),
          a = E.location;
      if (!v && function (t, n) {
        return t.pathname === n.pathname && t.search === n.search && t.hash === n.hash;
      }(a, e)) return;
      if (p === createPath(e)) return;
      p = null, function (n) {
        if (v) v = !1, d();else {
          l.confirmTransitionTo(n, "POP", i, function (t) {
            t ? d({
              action: "POP",
              location: n
            }) : function (t) {
              var n = E.location,
                  e = y.lastIndexOf(createPath(n));
              -1 === e && (e = 0);
              var a = y.lastIndexOf(createPath(t));
              -1 === a && (a = 0);
              var r = e - a;
              r && (v = !0, H(r));
            }(n);
          });
        }
      }(e);
    }
  }

  var P = getHashPath(),
      m = h(P);
  P !== m && replaceHashPath(m);
  var w = f(),
      y = [createPath(w)];

  function H(t) {
    n.go(t);
  }

  var x = 0;

  function L(t) {
    1 === (x += t) && 1 === t ? window.addEventListener(HashChangeEvent$1, g) : 0 === x && window.removeEventListener(HashChangeEvent$1, g);
  }

  var O = !1;
  var E = {
    length: n.length,
    action: "POP",
    location: w,
    createHref: function (t) {
      var n = document.querySelector("base"),
          e = "";
      return n && n.getAttribute("href") && (e = stripHash(window.location.href)), e + "#" + h(s + createPath(t));
    },
    push: function (t, n) {
      var o = createLocation(t, void 0, void 0, E.location);
      l.confirmTransitionTo(o, "PUSH", i, function (t) {
        if (t) {
          var n = createPath(o),
              e = h(s + n);

          if (getHashPath() !== e) {
            p = n, pushHashPath(e);
            var a = y.lastIndexOf(createPath(E.location)),
                r = y.slice(0, a + 1);
            r.push(n), y = r, d({
              action: "PUSH",
              location: o
            });
          } else d();
        }
      });
    },
    replace: function (t, n) {
      var r = "REPLACE",
          o = createLocation(t, void 0, void 0, E.location);
      l.confirmTransitionTo(o, r, i, function (t) {
        if (t) {
          var n = createPath(o),
              e = h(s + n);
          getHashPath() !== e && (p = n, replaceHashPath(e));
          var a = y.indexOf(createPath(E.location));
          -1 !== a && (y[a] = n), d({
            action: r,
            location: o
          });
        }
      });
    },
    go: H,
    goBack: function () {
      H(-1);
    },
    goForward: function () {
      H(1);
    },
    block: function (t) {
      void 0 === t && (t = !1);
      var n = l.setPrompt(t);
      return O || (L(1), O = !0), function () {
        return O && (O = !1, L(-1)), n();
      };
    },
    listen: function (t) {
      var n = l.appendListener(t);
      return L(1), function () {
        L(-1), n();
      };
    }
  };
  return E;
}

function clamp(t, n, e) {
  return Math.min(Math.max(t, n), e);
}

function createMemoryHistory(t) {
  void 0 === t && (t = {});
  var n = t,
      r = n.getUserConfirmation,
      e = n.initialEntries,
      a = void 0 === e ? ["/"] : e,
      o = n.initialIndex,
      i = void 0 === o ? 0 : o,
      s = n.keyLength,
      c = void 0 === s ? 6 : s,
      h = createTransitionManager();

  function u(t) {
    _extends(g, t), g.length = g.entries.length, h.notifyListeners(g.location, g.action);
  }

  function f() {
    return Math.random().toString(36).substr(2, c);
  }

  var l = clamp(i, 0, a.length - 1),
      d = a.map(function (t) {
    return createLocation(t, void 0, "string" == typeof t ? f() : t.key || f());
  }),
      v = createPath;

  function p(t) {
    var n = clamp(g.index + t, 0, g.entries.length - 1),
        e = g.entries[n];
    h.confirmTransitionTo(e, "POP", r, function (t) {
      t ? u({
        action: "POP",
        location: e,
        index: n
      }) : u();
    });
  }

  var g = {
    length: d.length,
    action: "POP",
    location: d[l],
    index: l,
    entries: d,
    createHref: v,
    push: function (t, n) {
      var a = createLocation(t, n, f(), g.location);
      h.confirmTransitionTo(a, "PUSH", r, function (t) {
        if (t) {
          var n = g.index + 1,
              e = g.entries.slice(0);
          e.length > n ? e.splice(n, e.length - n, a) : e.push(a), u({
            action: "PUSH",
            location: a,
            index: n,
            entries: e
          });
        }
      });
    },
    replace: function (t, n) {
      var e = "REPLACE",
          a = createLocation(t, n, f(), g.location);
      h.confirmTransitionTo(a, e, r, function (t) {
        t && (g.entries[g.index] = a, u({
          action: e,
          location: a
        }));
      });
    },
    go: p,
    goBack: function () {
      p(-1);
    },
    goForward: function () {
      p(1);
    },
    canGo: function (t) {
      var n = g.index + t;
      return 0 <= n && n < g.entries.length;
    },
    block: function (t) {
      return void 0 === t && (t = !1), h.setPrompt(t);
    },
    listen: function (t) {
      return h.appendListener(t);
    }
  };
  return g;
}

exports.createBrowserHistory = createBrowserHistory, exports.createHashHistory = createHashHistory, exports.createMemoryHistory = createMemoryHistory, exports.createLocation = createLocation, exports.locationsAreEqual = locationsAreEqual, exports.parsePath = parsePath, exports.createPath = createPath;
});

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

var resolvePathname = _interopDefault(resolvePathname$1);

var valueEqual = _interopDefault(valueEqual$1);

var warning = _interopDefault(tinyWarning_cjs);

var invariant = _interopDefault(tinyInvariant_cjs);

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

function addLeadingSlash(path) {
  return path.charAt(0) === '/' ? path : '/' + path;
}

function stripLeadingSlash(path) {
  return path.charAt(0) === '/' ? path.substr(1) : path;
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

function locationsAreEqual(a, b) {
  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && valueEqual(a.state, b.state);
}

function createTransitionManager() {
  var prompt = null;

  function setPrompt(nextPrompt) {
    warning(prompt == null, 'A history supports only one prompt at a time');
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
          warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message');
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
 * Returns false if using go(n) with hash history causes a full page reload.
 */


function supportsGoWithoutReloadUsingHash() {
  return window.navigator.userAgent.indexOf('Firefox') === -1;
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

  !canUseDOM ? invariant(false, 'Browser history needs a DOM') : void 0;
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
    warning(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');
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
    warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored');
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
        warning(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history');
        window.location.href = href;
      }
    });
  }

  function replace(path, state) {
    warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored');
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
        warning(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history');
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

var HashChangeEvent$1 = 'hashchange';
var HashPathCoders = {
  hashbang: {
    encodePath: function encodePath(path) {
      return path.charAt(0) === '!' ? path : '!/' + stripLeadingSlash(path);
    },
    decodePath: function decodePath(path) {
      return path.charAt(0) === '!' ? path.substr(1) : path;
    }
  },
  noslash: {
    encodePath: stripLeadingSlash,
    decodePath: addLeadingSlash
  },
  slash: {
    encodePath: addLeadingSlash,
    decodePath: addLeadingSlash
  }
};

function stripHash(url) {
  var hashIndex = url.indexOf('#');
  return hashIndex === -1 ? url : url.slice(0, hashIndex);
}

function getHashPath() {
  // We can't use window.location.hash here because it's not
  // consistent across browsers - Firefox will pre-decode it!
  var href = window.location.href;
  var hashIndex = href.indexOf('#');
  return hashIndex === -1 ? '' : href.substring(hashIndex + 1);
}

function pushHashPath(path) {
  window.location.hash = path;
}

function replaceHashPath(path) {
  window.location.replace(stripHash(window.location.href) + '#' + path);
}

function createHashHistory(props) {
  if (props === void 0) {
    props = {};
  }

  !canUseDOM ? invariant(false, 'Hash history needs a DOM') : void 0;
  var globalHistory = window.history;
  var canGoWithoutReload = supportsGoWithoutReloadUsingHash();
  var _props = props,
      _props$getUserConfirm = _props.getUserConfirmation,
      getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
      _props$hashType = _props.hashType,
      hashType = _props$hashType === void 0 ? 'slash' : _props$hashType;
  var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';
  var _HashPathCoders$hashT = HashPathCoders[hashType],
      encodePath = _HashPathCoders$hashT.encodePath,
      decodePath = _HashPathCoders$hashT.decodePath;

  function getDOMLocation() {
    var path = decodePath(getHashPath());
    warning(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".');
    if (basename) path = stripBasename(path, basename);
    return createLocation(path);
  }

  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = globalHistory.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  var forceNextPop = false;
  var ignorePath = null;

  function locationsAreEqual$$1(a, b) {
    return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash;
  }

  function handleHashChange() {
    var path = getHashPath();
    var encodedPath = encodePath(path);

    if (path !== encodedPath) {
      // Ensure we always have a properly-encoded hash.
      replaceHashPath(encodedPath);
    } else {
      var location = getDOMLocation();
      var prevLocation = history.location;
      if (!forceNextPop && locationsAreEqual$$1(prevLocation, location)) return; // A hashchange doesn't always == location change.

      if (ignorePath === createPath(location)) return; // Ignore this change; we already setState in push/replace.

      ignorePath = null;
      handlePop(location);
    }
  }

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
    // keeping a list of paths we've seen in sessionStorage.
    // Instead, we just default to 0 for paths we don't know.

    var toIndex = allPaths.lastIndexOf(createPath(toLocation));
    if (toIndex === -1) toIndex = 0;
    var fromIndex = allPaths.lastIndexOf(createPath(fromLocation));
    if (fromIndex === -1) fromIndex = 0;
    var delta = toIndex - fromIndex;

    if (delta) {
      forceNextPop = true;
      go(delta);
    }
  } // Ensure the hash is encoded properly before doing anything else.


  var path = getHashPath();
  var encodedPath = encodePath(path);
  if (path !== encodedPath) replaceHashPath(encodedPath);
  var initialLocation = getDOMLocation();
  var allPaths = [createPath(initialLocation)]; // Public interface

  function createHref(location) {
    var baseTag = document.querySelector('base');
    var href = '';

    if (baseTag && baseTag.getAttribute('href')) {
      href = stripHash(window.location.href);
    }

    return href + '#' + encodePath(basename + createPath(location));
  }

  function push(path, state) {
    warning(state === undefined, 'Hash history cannot push state; it is ignored');
    var action = 'PUSH';
    var location = createLocation(path, undefined, undefined, history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var path = createPath(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a PUSH, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        pushHashPath(encodedPath);
        var prevIndex = allPaths.lastIndexOf(createPath(history.location));
        var nextPaths = allPaths.slice(0, prevIndex + 1);
        nextPaths.push(path);
        allPaths = nextPaths;
        setState({
          action: action,
          location: location
        });
      } else {
        warning(false, 'Hash history cannot PUSH the same path; a new entry will not be added to the history stack');
        setState();
      }
    });
  }

  function replace(path, state) {
    warning(state === undefined, 'Hash history cannot replace state; it is ignored');
    var action = 'REPLACE';
    var location = createLocation(path, undefined, undefined, history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var path = createPath(location);
      var encodedPath = encodePath(basename + path);
      var hashChanged = getHashPath() !== encodedPath;

      if (hashChanged) {
        // We cannot tell if a hashchange was caused by a REPLACE, so we'd
        // rather setState here and ignore the hashchange. The caveat here
        // is that other hash histories in the page will consider it a POP.
        ignorePath = path;
        replaceHashPath(encodedPath);
      }

      var prevIndex = allPaths.indexOf(createPath(history.location));
      if (prevIndex !== -1) allPaths[prevIndex] = path;
      setState({
        action: action,
        location: location
      });
    });
  }

  function go(n) {
    warning(canGoWithoutReload, 'Hash history go(n) causes a full page reload in this browser');
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
      window.addEventListener(HashChangeEvent$1, handleHashChange);
    } else if (listenerCount === 0) {
      window.removeEventListener(HashChangeEvent$1, handleHashChange);
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

function clamp(n, lowerBound, upperBound) {
  return Math.min(Math.max(n, lowerBound), upperBound);
}
/**
 * Creates a history object that stores locations in memory.
 */


function createMemoryHistory(props) {
  if (props === void 0) {
    props = {};
  }

  var _props = props,
      getUserConfirmation = _props.getUserConfirmation,
      _props$initialEntries = _props.initialEntries,
      initialEntries = _props$initialEntries === void 0 ? ['/'] : _props$initialEntries,
      _props$initialIndex = _props.initialIndex,
      initialIndex = _props$initialIndex === void 0 ? 0 : _props$initialIndex,
      _props$keyLength = _props.keyLength,
      keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
  var transitionManager = createTransitionManager();

  function setState(nextState) {
    _extends(history, nextState);

    history.length = history.entries.length;
    transitionManager.notifyListeners(history.location, history.action);
  }

  function createKey() {
    return Math.random().toString(36).substr(2, keyLength);
  }

  var index = clamp(initialIndex, 0, initialEntries.length - 1);
  var entries = initialEntries.map(function (entry) {
    return typeof entry === 'string' ? createLocation(entry, undefined, createKey()) : createLocation(entry, undefined, entry.key || createKey());
  }); // Public interface

  var createHref = createPath;

  function push(path, state) {
    warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored');
    var action = 'PUSH';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      var prevIndex = history.index;
      var nextIndex = prevIndex + 1;
      var nextEntries = history.entries.slice(0);

      if (nextEntries.length > nextIndex) {
        nextEntries.splice(nextIndex, nextEntries.length - nextIndex, location);
      } else {
        nextEntries.push(location);
      }

      setState({
        action: action,
        location: location,
        index: nextIndex,
        entries: nextEntries
      });
    });
  }

  function replace(path, state) {
    warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored');
    var action = 'REPLACE';
    var location = createLocation(path, state, createKey(), history.location);
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (!ok) return;
      history.entries[history.index] = location;
      setState({
        action: action,
        location: location
      });
    });
  }

  function go(n) {
    var nextIndex = clamp(history.index + n, 0, history.entries.length - 1);
    var action = 'POP';
    var location = history.entries[nextIndex];
    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
      if (ok) {
        setState({
          action: action,
          location: location,
          index: nextIndex
        });
      } else {
        // Mimic the behavior of DOM histories by
        // causing a render after a cancelled POP.
        setState();
      }
    });
  }

  function goBack() {
    go(-1);
  }

  function goForward() {
    go(1);
  }

  function canGo(n) {
    var nextIndex = history.index + n;
    return nextIndex >= 0 && nextIndex < history.entries.length;
  }

  function block(prompt) {
    if (prompt === void 0) {
      prompt = false;
    }

    return transitionManager.setPrompt(prompt);
  }

  function listen(listener) {
    return transitionManager.appendListener(listener);
  }

  var history = {
    length: entries.length,
    action: 'POP',
    location: entries[index],
    index: index,
    entries: entries,
    createHref: createHref,
    push: push,
    replace: replace,
    go: go,
    goBack: goBack,
    goForward: goForward,
    canGo: canGo,
    block: block,
    listen: listen
  };
  return history;
}

var createBrowserHistory_1 = createBrowserHistory;
var createHashHistory_1 = createHashHistory;
var createMemoryHistory_1 = createMemoryHistory;
var createLocation_1 = createLocation;
var locationsAreEqual_1 = locationsAreEqual;
var parsePath_1 = parsePath;
var createPath_1 = createPath;

var history$1 = /*#__PURE__*/Object.defineProperty({
	createBrowserHistory: createBrowserHistory_1,
	createHashHistory: createHashHistory_1,
	createMemoryHistory: createMemoryHistory_1,
	createLocation: createLocation_1,
	locationsAreEqual: locationsAreEqual_1,
	parsePath: parsePath_1,
	createPath: createPath_1
}, '__esModule', {value: true});

var history = createCommonjsModule(function (module) {

if (process.env.NODE_ENV === 'production') {
  module.exports = history_min;
} else {
  module.exports = history$1;
}
});

setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory(url) {
  var _url$split = url.split(/[?#]/),
      pathname = _url$split[0],
      _url$split$ = _url$split[1],
      search = _url$split$ === void 0 ? '' : _url$split$,
      _url$split$2 = _url$split[2],
      hash = _url$split$2 === void 0 ? '' : _url$split$2;

  return {
    push: function push() {
      return;
    },
    replace: function replace() {
      return;
    },
    block: function block() {
      return function () {
        return undefined;
      };
    },
    location: {
      pathname: pathname,
      search: search,
      hash: hash
    }
  };
}

var BrowserNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(history) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    _this.unlistenHistory = void 0;
    _this.history = history;
    var _routeConfig$NotifyNa = routeConfig.NotifyNativeRouter,
        window = _routeConfig$NotifyNa.window,
        page = _routeConfig$NotifyNa.page;

    if (window || page) {
      _this.unlistenHistory = history.block(function (locationData, action) {
        if (action === 'POP') {
          env.setTimeout(function () {
            return _this.router.back(1, 'page');
          }, 300);
          return false;
        }

        return undefined;
      });
    }

    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.init = function init(location, key) {
    return false;
  };

  _proto.push = function push(location, key) {
    this.history.push(location.url);
    return false;
  };

  _proto.replace = function replace(location, key) {
    this.history.push(location.url);
    return false;
  };

  _proto.relaunch = function relaunch(location, key) {
    this.history.push(location.url);
    return false;
  };

  _proto.back = function back(location, key, index) {
    this.history.replace(location.url);
    return false;
  };

  _proto.destroy = function destroy() {
    this.unlistenHistory && this.unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);

function createClientRouter() {
  var history$1 = history.createBrowserHistory();
  var browserNativeRouter = new BrowserNativeRouter(history$1);
  return {
    router: browserNativeRouter.router,
    url: locationToUrl(history$1.location)
  };
}
function createServerRouter(url) {
  var history = createServerHistory(url);
  var browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}

var EluxContextKey = '__EluxContext__';
var EluxStoreContextKey = '__EluxStoreContext__';
function UseRouter() {
  var _inject = inject(EluxContextKey, {}),
      router = _inject.router;

  return router;
}
function UseStore() {
  var _inject2 = inject(EluxStoreContextKey, {}),
      store = _inject2.store;

  return store;
}
var vueComponentsConfig = {
  renderToString: undefined
};
var setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);

var AppRender = {
  toDocument: function toDocument(id, eluxContext, fromSSR, app) {
    app.provide(EluxContextKey, eluxContext);

    if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
    }

    app.mount("#" + id);
  },
  toString: function toString(id, eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return vueComponentsConfig.renderToString(app);
  },
  toProvider: function toProvider(eluxContext, app) {
    app.provide(EluxContextKey, eluxContext);
    return function () {
      return createVNode("div", null, null);
    };
  }
};

var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return createVNode("div", {
    "class": "g-component-error"
  }, [message]);
};
var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return createVNode("div", {
    "class": "g-component-loading"
  }, [createTextVNode("loading...")]);
};
var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  var OnError = options.onError || coreConfig.LoadComponentOnError;
  var component = defineComponent({
    name: 'EluxComponentLoader',
    setup: function setup(props, context) {
      var execute = function execute() {
        var SyncView = OnLoading;

        try {
          var result = injectComponent(moduleName, componentName, store);

          if (isPromise(result)) {
            if (env.isServer) {
              throw 'can not use async component in SSR';
            }

            result.then(function (view) {
              active && (View.value = view || 'not found!');
            }, function (e) {
              env.console.error(e);
              active && (View.value = e.message || "" + e || 'error');
            });
          } else {
            SyncView = result;
          }
        } catch (e) {
          env.console.error(e);
          SyncView = e.message || "" + e || 'error';
        }

        return SyncView;
      };

      var store = coreConfig.UseStore();
      var View = shallowRef(execute());
      var active = true;
      onBeforeUnmount(function () {
        active = false;
      });
      watch(function () {
        return store.sid;
      }, execute);
      return function () {
        var view = View.value;

        if (typeof view === 'string') {
          return h(OnError, {
            message: view
          });
        } else if (view === OnLoading) {
          return h(view);
        } else {
          return h(view, props, context.slots);
        }
      };
    }
  });
  return component;
};

var EWindow = defineComponent({
  name: 'EluxWindow',
  props: ['store'],
  setup: function setup(props) {
    var AppView = getEntryComponent();
    var store = props.store;
    var uid = store.uid,
        sid = store.sid,
        state = store.state,
        dispatch = store.dispatch,
        mount = store.mount;
    var storeRef = shallowReactive({
      uid: uid,
      sid: sid,
      state: state,
      dispatch: dispatch.bind(store),
      mount: mount.bind(store)
    });
    var storeContext = {
      store: storeRef
    };
    provide(EluxStoreContextKey, storeContext);
    watch(function () {
      return props.store;
    }, function (store) {
      var uid = store.uid,
          sid = store.sid,
          state = store.state,
          dispatch = store.dispatch;
      Object.assign(storeRef, {
        uid: uid,
        sid: sid,
        state: state,
        dispatch: dispatch.bind(store),
        mount: mount.bind(store)
      });
    });
    return function () {
      return h(AppView, null);
    };
  }
});

var RouterComponent = defineComponent({
  name: 'EluxRouter',
  setup: function setup() {
    var router = coreConfig.UseRouter();
    var data = shallowRef({
      className: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    var containerRef = ref({
      className: ''
    });
    var removeListener = router.addListener(function (_ref) {
      var action = _ref.action,
          windowChanged = _ref.windowChanged;
      var pages = router.getCurrentPages().reverse();
      return new Promise(function (completeCallback) {
        if (windowChanged) {
          if (action === 'push') {
            data.value = {
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages: pages
            };
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            data.value = {
              className: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [data.value.pages[data.value.pages.length - 1]])
            };
            env.setTimeout(function () {
              containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(function () {
              data.value = {
                className: 'elux-app ' + Date.now(),
                pages: pages
              };
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            data.value = {
              className: 'elux-app',
              pages: pages
            };
            env.setTimeout(completeCallback, 50);
          }
        } else {
          data.value = {
            className: 'elux-app',
            pages: pages
          };
          env.setTimeout(completeCallback, 50);
        }
      });
    });
    onBeforeUnmount(function () {
      removeListener();
    });
    return function () {
      var _data$value = data.value,
          className = _data$value.className,
          pages = _data$value.pages;
      return createVNode("div", {
        "ref": containerRef,
        "class": className
      }, [pages.map(function (item, index) {
        var store = item.store,
            _item$location = item.location,
            url = _item$location.url,
            classname = _item$location.classname;
        var props = {
          class: "elux-window" + (classname ? ' ' + classname : ''),
          key: store.uid,
          uid: store.uid,
          sid: store.sid,
          url: url,
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

var DocumentHead = defineComponent({
  name: 'EluxDocumentHead',
  props: ['title', 'html'],
  setup: function setup(props) {
    var documentHead = computed(function () {
      var documentHead = props.html || '';

      if (props.title) {
        if (/<title>.*?<\/title>/.test(documentHead)) {
          documentHead = documentHead.replace(/<title>.*?<\/title>/, "<title>" + props.title + "</title>");
        } else {
          documentHead = "<title>" + props.title + "</title>" + documentHead;
        }
      }

      return documentHead;
    });
    var router = coreConfig.UseRouter();
    return function () {
      router.setDocumentHead(documentHead.value);
      return null;
    };
  }
});

var Switch = function Switch(props, context) {
  var arr = [];
  var children = context.slots.default ? context.slots.default() : [];
  children.forEach(function (item) {
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

var Else = function Else(props, context) {
  var arr = [];
  var children = context.slots.default ? context.slots.default() : [];
  children.forEach(function (item) {
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

var Link = defineComponent({
  name: 'EluxLink',
  props: ['disabled', 'to', 'onClick', 'action', 'target', 'refresh', 'cname', 'overflowRedirect'],
  setup: function setup(props, context) {
    var router = coreConfig.UseRouter();
    var route = computed(function () {
      var firstArg, url, href;
      var to = props.to,
          action = props.action,
          cname = props.cname,
          target = props.target;

      if (action === 'back') {
        firstArg = to;
        url = "#" + to.toString();
        href = "#";
      } else {
        var location = typeof to === 'string' ? {
          url: to
        } : to;
        cname !== undefined && (location.classname = cname);
        url = router.computeUrl(location, action, target);
        firstArg = location;
        href = urlToNativeUrl(url);
      }

      return {
        firstArg: firstArg,
        url: url,
        href: href
      };
    });

    var clickHandler = function clickHandler(event) {
      event.preventDefault();
      var firstArg = route.value.firstArg;
      var disabled = props.disabled,
          onClick = props.onClick,
          action = props.action,
          target = props.target,
          refresh = props.refresh,
          overflowRedirect = props.overflowRedirect;

      if (!disabled) {
        onClick && onClick(event);
        router[action](firstArg, target, refresh, overflowRedirect);
      }
    };

    return function () {
      var _route$value = route.value,
          url = _route$value.url,
          href = _route$value.href;
      var disabled = props.disabled,
          action = props.action,
          target = props.target,
          overflowRedirect = props.overflowRedirect;
      var linkProps = {};
      linkProps['onClick'] = clickHandler;
      linkProps['action'] = action;
      linkProps['target'] = target;
      linkProps['url'] = url;
      linkProps['href'] = href;
      overflowRedirect && (linkProps['overflow'] = overflowRedirect);
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
  StoreInitState: function StoreInitState() {
    return reactive({});
  },
  UseStore: UseStore,
  UseRouter: UseRouter,
  AppRender: AppRender,
  LoadComponent: LoadComponent,
  LoadComponentOnError: LoadComponentOnError,
  LoadComponentOnLoading: LoadComponentOnLoading
});

var appConfig = Symbol();
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

setVueComponentsConfig({
  renderToString: renderToString
});
var cientSingleton = undefined;
function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  var _createClientRouter = createClientRouter(),
      router = _createClientRouter.router,
      url = _createClientRouter.url;

  var app = createApp$1(RouterComponent);
  cientSingleton = Object.assign(app, {
    render: function render() {
      return Promise.resolve();
    }
  });
  return buildApp(app, router, {
    url: url
  });
}
function createSSR(appConfig, routerOptions) {
  var router = createServerRouter(routerOptions.url);
  var app = createSSRApp(RouterComponent);
  return buildSSR(app, router, routerOptions);
}

export { BaseModel, DocumentHead, Else, EmptyModel, ErrorCodes, Link, Switch, createApp, createSSR, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, patchActions, reducer, setConfig, setLoading, urlToLocation, urlToNativeUrl };
