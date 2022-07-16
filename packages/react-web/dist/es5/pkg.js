import _react, { createContext, useContext, memo, useState, useRef, useEffect, forwardRef, useMemo, Children, useCallback } from 'react';
import { jsx, Fragment as Fragment$2 } from 'react/jsx-runtime';
import { renderToString } from '@elux/react-web/server';
import _reactDom, { hydrate, render } from 'react-dom';

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

    var handlers = _extends({}, commonHandlers, universalHandlers);

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

        var uncommittedState = this.uncommittedState = _extends({}, prevState);

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

var EluxContextComponent = createContext({
  router: null
});
function UseRouter() {
  var eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}
var reactComponentsConfig = {
  hydrate: undefined,
  render: undefined,
  renderToString: undefined
};
var setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);

var Component$2 = function Component(_ref) {
  var store = _ref.store;
  var AppView = getEntryComponent();
  var StoreProvider = coreConfig.StoreProvider;
  return jsx(StoreProvider, {
    store: store,
    children: jsx(AppView, {})
  });
};

Component$2.displayName = 'EluxWindow';
var EWindow = memo(Component$2);

var Component$1 = function Component() {
  var router = coreConfig.UseRouter();

  var _useState = useState({
    className: 'elux-app',
    pages: router.getCurrentPages().reverse()
  }),
      data = _useState[0],
      setData = _useState[1];

  var className = data.className,
      pages = data.pages;
  var pagesRef = useRef(pages);
  pagesRef.current = pages;
  var containerRef = useRef(null);
  useEffect(function () {
    return router.addListener(function (_ref) {
      var action = _ref.action,
          windowChanged = _ref.windowChanged;
      var pages = router.getCurrentPages().reverse();
      return new Promise(function (completeCallback) {
        if (windowChanged) {
          if (action === 'push') {
            setData({
              className: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
              pages: pages
            });
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app elux-animation';
            }, 100);
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app';
              completeCallback();
            }, 400);
          } else if (action === 'back') {
            setData({
              className: 'elux-app ' + Date.now(),
              pages: [].concat(pages, [pagesRef.current[pagesRef.current.length - 1]])
            });
            env.setTimeout(function () {
              containerRef.current.className = 'elux-app elux-animation elux-change elux-back';
            }, 100);
            env.setTimeout(function () {
              setData({
                className: 'elux-app ' + Date.now(),
                pages: pages
              });
              completeCallback();
            }, 400);
          } else if (action === 'relaunch') {
            setData({
              className: 'elux-app ',
              pages: pages
            });
            env.setTimeout(completeCallback, 50);
          }
        } else {
          setData({
            className: 'elux-app',
            pages: pages
          });
          env.setTimeout(completeCallback, 50);
        }
      });
    });
  }, [router]);
  return jsx("div", {
    ref: containerRef,
    className: className,
    children: pages.map(function (item, index) {
      var store = item.store,
          _item$location = item.location,
          url = _item$location.url,
          classname = _item$location.classname;
      var props = {
        className: "elux-window" + (classname ? ' ' + classname : ''),
        key: store.uid,
        uid: store.uid,
        sid: store.sid,
        url: url,
        style: {
          zIndex: index + 1
        }
      };
      return classname.startsWith('_') ? jsx("article", _extends({}, props, {
        children: jsx(EWindow, {
          store: store
        })
      })) : jsx("div", _extends({}, props, {
        children: jsx(EWindow, {
          store: store
        })
      }));
    })
  });
};

Component$1.displayName = 'EluxRouter';
var RouterComponent = memo(Component$1);

var AppRender = {
  toDocument: function toDocument(id, eluxContext, fromSSR, app) {
    var renderFun = fromSSR ? reactComponentsConfig.hydrate : reactComponentsConfig.render;
    var panel = env.document.getElementById(id);
    renderFun(jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: jsx(RouterComponent, {})
    }), panel);
  },
  toString: function toString(id, eluxContext, app) {
    var html = reactComponentsConfig.renderToString(jsx(EluxContextComponent.Provider, {
      value: eluxContext,
      children: jsx(RouterComponent, {})
    }));
    return Promise.resolve(html);
  },
  toProvider: function toProvider(eluxContext, app) {
    return function (props) {
      return jsx(EluxContextComponent.Provider, {
        value: eluxContext,
        children: props.children
      });
    };
  }
};

var LoadComponentOnError = function LoadComponentOnError(_ref) {
  var message = _ref.message;
  return jsx("div", {
    className: "g-component-error",
    children: message
  });
};
var LoadComponentOnLoading = function LoadComponentOnLoading() {
  return jsx("div", {
    className: "g-component-loading",
    children: "loading..."
  });
};
var LoadComponent = function LoadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var OnLoading = options.onLoading || coreConfig.LoadComponentOnLoading;
  var OnError = options.onError || coreConfig.LoadComponentOnError;
  var Component = forwardRef(function (props, ref) {
    var execute = function execute(curStore) {
      var SyncView = OnLoading;

      try {
        var result = injectComponent(moduleName, componentName, curStore || store);

        if (isPromise(result)) {
          if (env.isServer) {
            throw 'can not use async component in SSR';
          }

          result.then(function (view) {
            activeRef.current && setView(view || 'not found!');
          }, function (e) {
            env.console.error(e);
            activeRef.current && setView(e.message || "" + e || 'error');
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

    var activeRef = useRef(true);
    useEffect(function () {
      return function () {
        activeRef.current = false;
      };
    }, []);
    var newStore = coreConfig.UseStore();

    var _useState = useState(newStore),
        store = _useState[0],
        setStore = _useState[1];

    var _useState2 = useState(execute),
        View = _useState2[0],
        setView = _useState2[1];

    if (store !== newStore) {
      setStore(newStore);
      setView(execute(newStore));
    }

    if (typeof View === 'string') {
      return jsx(OnError, {
        message: View
      });
    } else if (View === OnLoading) {
      return jsx(OnLoading, {});
    } else {
      return jsx(View, _extends({
        ref: ref
      }, props));
    }
  });
  Component.displayName = 'EluxComponentLoader';
  return Component;
};

var Component = function Component(_ref) {
  var title = _ref.title,
      html = _ref.html;
  var router = coreConfig.UseRouter();
  var documentHead = useMemo(function () {
    var documentHead = html || '';

    if (title) {
      if (/<title>.*?<\/title>/.test(documentHead)) {
        documentHead = documentHead.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
      } else {
        documentHead = "<title>" + title + "</title>" + documentHead;
      }
    }

    return documentHead;
  }, [html, title]);
  router.setDocumentHead(documentHead);
  return null;
};

Component.displayName = 'EluxDocumentHead';
var DocumentHead = memo(Component);

var Else = function Else(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;
  var arr = [];
  Children.forEach(children, function (item) {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return jsx(Fragment$2, {
      children: arr
    });
  }

  return jsx(Fragment$2, {
    children: elseView
  });
};
Else.displayName = 'EluxElse';

var Switch = function Switch(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;
  var arr = [];
  Children.forEach(children, function (item) {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return jsx(Fragment$2, {
      children: arr[0]
    });
  }

  return jsx(Fragment$2, {
    children: elseView
  });
};
Switch.displayName = 'EluxSwitch';

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
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
  return _extends({}, location, {
    pathname: pathname,
    url: url
  });
}
function nativeLocationToLocation(location) {
  var pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  var url = location.url.replace(location.pathname, pathname);
  return _extends({}, location, {
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

var _excluded = ["to", "cname", "action", "onClick", "disabled", "overflowRedirect", "target", "refresh"];
var Link = function Link(_ref) {
  var to = _ref.to,
      cname = _ref.cname,
      action = _ref.action,
      onClick = _ref.onClick,
      disabled = _ref.disabled,
      overflowRedirect = _ref.overflowRedirect,
      target = _ref.target,
      refresh = _ref.refresh,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  var router = coreConfig.UseRouter();

  var _useMemo = useMemo(function () {
    var firstArg, url, href;

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
  }, [target, action, cname, router, to]),
      firstArg = _useMemo.firstArg,
      url = _useMemo.url,
      href = _useMemo.href;

  var data = {
    router: router,
    onClick: onClick,
    disabled: disabled,
    firstArg: firstArg,
    action: action,
    target: target,
    refresh: refresh,
    overflowRedirect: overflowRedirect
  };
  var refData = useRef(data);
  Object.assign(refData.current, data);
  var clickHandler = useCallback(function (event) {
    event.preventDefault();
    var _refData$current = refData.current,
        router = _refData$current.router,
        disabled = _refData$current.disabled,
        onClick = _refData$current.onClick,
        firstArg = _refData$current.firstArg,
        action = _refData$current.action,
        target = _refData$current.target,
        refresh = _refData$current.refresh,
        overflowRedirect = _refData$current.overflowRedirect;

    if (!disabled) {
      onClick && onClick(event);
      router[action](firstArg, target, refresh, overflowRedirect);
    }
  }, []);
  props['onClick'] = clickHandler;
  props['action'] = action;
  props['target'] = target;
  props['url'] = url;
  props['href'] = href;
  overflowRedirect && (props['overflow'] = overflowRedirect);
  disabled && (props['disabled'] = true);

  if (coreConfig.Platform === 'taro') {
    return jsx("span", _extends({}, props));
  } else {
    return jsx("a", _extends({}, props));
  }
};
Link.displayName = 'EluxLink';

setCoreConfig({
  UseRouter: UseRouter,
  AppRender: AppRender,
  LoadComponent: LoadComponent,
  LoadComponentOnError: LoadComponentOnError,
  LoadComponentOnLoading: LoadComponentOnLoading
});

setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory() {
  return {
    url: '',
    push: function push() {
      return;
    },
    replace: function replace() {
      return;
    }
  };
}

function createBrowserHistory() {
  return {
    url: '',
    push: function push(url) {
      this.url = url;
      env.history.pushState(null, '', url);
    },
    replace: function replace(url) {
      this.url = url;
      env.history.replaceState(null, '', url);
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
      env.addEventListener('popstate', function () {
        if (history.url) {
          env.history.replaceState(null, '', history.url);
          env.setTimeout(function () {
            return _this.router.back(1, 'page');
          }, 0);
        }
      }, true);
    }

    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.init = function init(location, key) {
    this.history.push(location.url);
    return false;
  };

  _proto.push = function push(location, key) {
    this.history.replace(location.url);
    return false;
  };

  _proto.replace = function replace(location, key) {
    this.history.replace(location.url);
    return false;
  };

  _proto.relaunch = function relaunch(location, key) {
    this.history.replace(location.url);
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
  var history = createBrowserHistory();
  var browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}
function createServerRouter() {
  var history = createServerHistory();
  var browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}

var interopRequireDefault = createCommonjsModule(function (module) {
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
});

var _typeof_1 = createCommonjsModule(function (module) {
function _typeof(obj) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
}

module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
});

var interopRequireWildcard = createCommonjsModule(function (module) {
var _typeof = _typeof_1["default"];

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
    return {
      "default": obj
    };
  }

  var cache = _getRequireWildcardCache(nodeInterop);

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj["default"] = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

module.exports = _interopRequireWildcard, module.exports.__esModule = true, module.exports["default"] = module.exports;
});

/** @license React v16.13.1
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var b$1 = "function" === typeof Symbol && Symbol.for,
    c$1 = b$1 ? Symbol.for("react.element") : 60103,
    d$1 = b$1 ? Symbol.for("react.portal") : 60106,
    e$1 = b$1 ? Symbol.for("react.fragment") : 60107,
    f$1 = b$1 ? Symbol.for("react.strict_mode") : 60108,
    g$1 = b$1 ? Symbol.for("react.profiler") : 60114,
    h$1 = b$1 ? Symbol.for("react.provider") : 60109,
    k$1 = b$1 ? Symbol.for("react.context") : 60110,
    l$1 = b$1 ? Symbol.for("react.async_mode") : 60111,
    m$1 = b$1 ? Symbol.for("react.concurrent_mode") : 60111,
    n$1 = b$1 ? Symbol.for("react.forward_ref") : 60112,
    p$1 = b$1 ? Symbol.for("react.suspense") : 60113,
    q$1 = b$1 ? Symbol.for("react.suspense_list") : 60120,
    r$1 = b$1 ? Symbol.for("react.memo") : 60115,
    t = b$1 ? Symbol.for("react.lazy") : 60116,
    v$1 = b$1 ? Symbol.for("react.block") : 60121,
    w$1 = b$1 ? Symbol.for("react.fundamental") : 60117,
    x$1 = b$1 ? Symbol.for("react.responder") : 60118,
    y$1 = b$1 ? Symbol.for("react.scope") : 60119;

function z$1(a) {
  if ("object" === typeof a && null !== a) {
    var u = a.$$typeof;

    switch (u) {
      case c$1:
        switch (a = a.type, a) {
          case l$1:
          case m$1:
          case e$1:
          case g$1:
          case f$1:
          case p$1:
            return a;

          default:
            switch (a = a && a.$$typeof, a) {
              case k$1:
              case n$1:
              case t:
              case r$1:
              case h$1:
                return a;

              default:
                return u;
            }

        }

      case d$1:
        return u;
    }
  }
}

function A$1(a) {
  return z$1(a) === m$1;
}

var AsyncMode = l$1;
var ConcurrentMode = m$1;
var ContextConsumer$1 = k$1;
var ContextProvider$1 = h$1;
var Element$1 = c$1;
var ForwardRef$1 = n$1;
var Fragment$1 = e$1;
var Lazy$1 = t;
var Memo$1 = r$1;
var Portal$1 = d$1;
var Profiler$1 = g$1;
var StrictMode$1 = f$1;
var Suspense$1 = p$1;

var isAsyncMode$1 = function (a) {
  return A$1(a) || z$1(a) === l$1;
};

var isConcurrentMode$1 = A$1;

var isContextConsumer$1 = function (a) {
  return z$1(a) === k$1;
};

var isContextProvider$1 = function (a) {
  return z$1(a) === h$1;
};

var isElement$1 = function (a) {
  return "object" === typeof a && null !== a && a.$$typeof === c$1;
};

var isForwardRef$1 = function (a) {
  return z$1(a) === n$1;
};

var isFragment$1 = function (a) {
  return z$1(a) === e$1;
};

var isLazy$1 = function (a) {
  return z$1(a) === t;
};

var isMemo$1 = function (a) {
  return z$1(a) === r$1;
};

var isPortal$1 = function (a) {
  return z$1(a) === d$1;
};

var isProfiler$1 = function (a) {
  return z$1(a) === g$1;
};

var isStrictMode$1 = function (a) {
  return z$1(a) === f$1;
};

var isSuspense$1 = function (a) {
  return z$1(a) === p$1;
};

var isValidElementType$1 = function (a) {
  return "string" === typeof a || "function" === typeof a || a === e$1 || a === m$1 || a === g$1 || a === f$1 || a === p$1 || a === q$1 || "object" === typeof a && null !== a && (a.$$typeof === t || a.$$typeof === r$1 || a.$$typeof === h$1 || a.$$typeof === k$1 || a.$$typeof === n$1 || a.$$typeof === w$1 || a.$$typeof === x$1 || a.$$typeof === y$1 || a.$$typeof === v$1);
};

var typeOf$1 = z$1;

var reactIs_production_min$1 = {
	AsyncMode: AsyncMode,
	ConcurrentMode: ConcurrentMode,
	ContextConsumer: ContextConsumer$1,
	ContextProvider: ContextProvider$1,
	Element: Element$1,
	ForwardRef: ForwardRef$1,
	Fragment: Fragment$1,
	Lazy: Lazy$1,
	Memo: Memo$1,
	Portal: Portal$1,
	Profiler: Profiler$1,
	StrictMode: StrictMode$1,
	Suspense: Suspense$1,
	isAsyncMode: isAsyncMode$1,
	isConcurrentMode: isConcurrentMode$1,
	isContextConsumer: isContextConsumer$1,
	isContextProvider: isContextProvider$1,
	isElement: isElement$1,
	isForwardRef: isForwardRef$1,
	isFragment: isFragment$1,
	isLazy: isLazy$1,
	isMemo: isMemo$1,
	isPortal: isPortal$1,
	isProfiler: isProfiler$1,
	isStrictMode: isStrictMode$1,
	isSuspense: isSuspense$1,
	isValidElementType: isValidElementType$1,
	typeOf: typeOf$1
};

/** @license React v16.13.1
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var reactIs_development$1 = createCommonjsModule(function (module, exports) {

if (process.env.NODE_ENV !== "production") {
  (function () {
    // nor polyfill, then a plain number is used for performance.

    var hasSymbol = typeof Symbol === 'function' && Symbol.for;
    var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
    var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
    var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
    var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
    var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
    var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
    var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace; // TODO: We don't use AsyncMode or ConcurrentMode anymore. They were temporary
    // (unstable) APIs that have been removed. Can we remove the symbols?

    var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
    var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
    var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
    var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
    var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for('react.suspense_list') : 0xead8;
    var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
    var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;
    var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for('react.block') : 0xead9;
    var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for('react.fundamental') : 0xead5;
    var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for('react.responder') : 0xead6;
    var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for('react.scope') : 0xead7;

    function isValidElementType(type) {
      return typeof type === 'string' || typeof type === 'function' || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
      type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
    }

    function typeOf(object) {
      if (typeof object === 'object' && object !== null) {
        var $$typeof = object.$$typeof;

        switch ($$typeof) {
          case REACT_ELEMENT_TYPE:
            var type = object.type;

            switch (type) {
              case REACT_ASYNC_MODE_TYPE:
              case REACT_CONCURRENT_MODE_TYPE:
              case REACT_FRAGMENT_TYPE:
              case REACT_PROFILER_TYPE:
              case REACT_STRICT_MODE_TYPE:
              case REACT_SUSPENSE_TYPE:
                return type;

              default:
                var $$typeofType = type && type.$$typeof;

                switch ($$typeofType) {
                  case REACT_CONTEXT_TYPE:
                  case REACT_FORWARD_REF_TYPE:
                  case REACT_LAZY_TYPE:
                  case REACT_MEMO_TYPE:
                  case REACT_PROVIDER_TYPE:
                    return $$typeofType;

                  default:
                    return $$typeof;
                }

            }

          case REACT_PORTAL_TYPE:
            return $$typeof;
        }
      }

      return undefined;
    } // AsyncMode is deprecated along with isAsyncMode


    var AsyncMode = REACT_ASYNC_MODE_TYPE;
    var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
    var ContextConsumer = REACT_CONTEXT_TYPE;
    var ContextProvider = REACT_PROVIDER_TYPE;
    var Element = REACT_ELEMENT_TYPE;
    var ForwardRef = REACT_FORWARD_REF_TYPE;
    var Fragment = REACT_FRAGMENT_TYPE;
    var Lazy = REACT_LAZY_TYPE;
    var Memo = REACT_MEMO_TYPE;
    var Portal = REACT_PORTAL_TYPE;
    var Profiler = REACT_PROFILER_TYPE;
    var StrictMode = REACT_STRICT_MODE_TYPE;
    var Suspense = REACT_SUSPENSE_TYPE;
    var hasWarnedAboutDeprecatedIsAsyncMode = false; // AsyncMode should be deprecated

    function isAsyncMode(object) {
      {
        if (!hasWarnedAboutDeprecatedIsAsyncMode) {
          hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

          console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
        }
      }
      return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
    }

    function isConcurrentMode(object) {
      return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
    }

    function isContextConsumer(object) {
      return typeOf(object) === REACT_CONTEXT_TYPE;
    }

    function isContextProvider(object) {
      return typeOf(object) === REACT_PROVIDER_TYPE;
    }

    function isElement(object) {
      return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
    }

    function isForwardRef(object) {
      return typeOf(object) === REACT_FORWARD_REF_TYPE;
    }

    function isFragment(object) {
      return typeOf(object) === REACT_FRAGMENT_TYPE;
    }

    function isLazy(object) {
      return typeOf(object) === REACT_LAZY_TYPE;
    }

    function isMemo(object) {
      return typeOf(object) === REACT_MEMO_TYPE;
    }

    function isPortal(object) {
      return typeOf(object) === REACT_PORTAL_TYPE;
    }

    function isProfiler(object) {
      return typeOf(object) === REACT_PROFILER_TYPE;
    }

    function isStrictMode(object) {
      return typeOf(object) === REACT_STRICT_MODE_TYPE;
    }

    function isSuspense(object) {
      return typeOf(object) === REACT_SUSPENSE_TYPE;
    }

    exports.AsyncMode = AsyncMode;
    exports.ConcurrentMode = ConcurrentMode;
    exports.ContextConsumer = ContextConsumer;
    exports.ContextProvider = ContextProvider;
    exports.Element = Element;
    exports.ForwardRef = ForwardRef;
    exports.Fragment = Fragment;
    exports.Lazy = Lazy;
    exports.Memo = Memo;
    exports.Portal = Portal;
    exports.Profiler = Profiler;
    exports.StrictMode = StrictMode;
    exports.Suspense = Suspense;
    exports.isAsyncMode = isAsyncMode;
    exports.isConcurrentMode = isConcurrentMode;
    exports.isContextConsumer = isContextConsumer;
    exports.isContextProvider = isContextProvider;
    exports.isElement = isElement;
    exports.isForwardRef = isForwardRef;
    exports.isFragment = isFragment;
    exports.isLazy = isLazy;
    exports.isMemo = isMemo;
    exports.isPortal = isPortal;
    exports.isProfiler = isProfiler;
    exports.isStrictMode = isStrictMode;
    exports.isSuspense = isSuspense;
    exports.isValidElementType = isValidElementType;
    exports.typeOf = typeOf;
  })();
}
});

var reactIs$1 = createCommonjsModule(function (module) {

if (process.env.NODE_ENV === 'production') {
  module.exports = reactIs_production_min$1;
} else {
  module.exports = reactIs_development$1;
}
});

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/* eslint-disable no-unused-vars */

var getOwnPropertySymbols$1 = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
  if (val === null || val === undefined) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }

  return Object(val);
}

function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    } // Detect buggy property enumeration order in older V8 versions.
    // https://bugs.chromium.org/p/v8/issues/detail?id=4118


    var test1 = new String('abc'); // eslint-disable-line no-new-wrappers

    test1[5] = 'de';

    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


    var test2 = {};

    for (var i = 0; i < 10; i++) {
      test2['_' + String.fromCharCode(i)] = i;
    }

    var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
      return test2[n];
    });

    if (order2.join('') !== '0123456789') {
      return false;
    } // https://bugs.chromium.org/p/v8/issues/detail?id=3056


    var test3 = {};
    'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
      test3[letter] = letter;
    });

    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }

    return true;
  } catch (err) {
    // We don't expect any of the above to throw, but better to be safe.
    return false;
  }
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
  var from;
  var to = toObject(target);
  var symbols;

  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }

    if (getOwnPropertySymbols$1) {
      symbols = getOwnPropertySymbols$1(from);

      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }

  return to;
};

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var ReactPropTypesSecret$1 = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
var ReactPropTypesSecret_1 = ReactPropTypesSecret$1;

var has$1 = Function.call.bind(Object.prototype.hasOwnProperty);

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var printWarning$1 = function () {};

if (process.env.NODE_ENV !== 'production') {
  var ReactPropTypesSecret = ReactPropTypesSecret_1;

  var loggedTypeFailures = {};

  var has = has$1;

  printWarning$1 = function (text) {
    var message = 'Warning: ' + text;

    if (typeof console !== 'undefined') {
      console.error(message);
    }

    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {
      /**/
    }
  };
}
/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */


function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (has(typeSpecs, typeSpecName)) {
        var error; // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.

        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          if (typeof typeSpecs[typeSpecName] !== 'function') {
            var err = Error((componentName || 'React class') + ': ' + location + ' type `' + typeSpecName + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + typeof typeSpecs[typeSpecName] + '`.' + 'This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.');
            err.name = 'Invariant Violation';
            throw err;
          }

          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }

        if (error && !(error instanceof Error)) {
          printWarning$1((componentName || 'React class') + ': type specification of ' + location + ' `' + typeSpecName + '` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a ' + typeof error + '. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).');
        }

        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;
          var stack = getStack ? getStack() : '';
          printWarning$1('Failed ' + location + ' type: ' + error.message + (stack != null ? stack : ''));
        }
      }
    }
  }
}
/**
 * Resets warning cache when testing.
 *
 * @private
 */


checkPropTypes.resetWarningCache = function () {
  if (process.env.NODE_ENV !== 'production') {
    loggedTypeFailures = {};
  }
};

var checkPropTypes_1 = checkPropTypes;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */











var printWarning = function () {};

if (process.env.NODE_ENV !== 'production') {
  printWarning = function (text) {
    var message = 'Warning: ' + text;

    if (typeof console !== 'undefined') {
      console.error(message);
    }

    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };
}

function emptyFunctionThatReturnsNull() {
  return null;
}

var factoryWithTypeCheckers = function (isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */

  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);

    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }
  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */


  var ANONYMOUS = '<<anonymous>>'; // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.

  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bigint: createPrimitiveTypeChecker('bigint'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),
    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    elementType: createElementTypeTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker,
    exact: createStrictShapeTypeChecker
  };
  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */

  /*eslint-disable no-self-compare*/

  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */


  function PropTypeError(message, data) {
    this.message = message;
    this.data = data && typeof data === 'object' ? data : {};
    this.stack = '';
  } // Make `instanceof Error` still work for returned errors.


  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }

    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret_1) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use `PropTypes.checkPropTypes()` to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
          err.name = 'Invariant Violation';
          throw err;
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;

          if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
          manualPropTypeWarningCount < 3) {
            printWarning('You are manually calling a React.PropTypes validation ' + 'function for the `' + propFullName + '` prop on `' + componentName + '`. This is deprecated ' + 'and will throw in the standalone `prop-types` package. ' + 'You may be seeing this warning due to a third-party PropTypes ' + 'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.');
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }

      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }

          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }

        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);
    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);

      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'), {
          expectedType: expectedType
        });
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunctionThatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }

      var propValue = props[propName];

      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }

      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret_1);

        if (error instanceof Error) {
          return error;
        }
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];

      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createElementTypeTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];

      if (!reactIs$1.isValidElementType(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement type.'));
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      if (process.env.NODE_ENV !== 'production') {
        if (arguments.length > 1) {
          printWarning('Invalid arguments supplied to oneOf, expected an array, got ' + arguments.length + ' arguments. ' + 'A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z]).');
        } else {
          printWarning('Invalid argument supplied to oneOf, expected an array.');
        }
      }

      return emptyFunctionThatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];

      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
        var type = getPreciseType(value);

        if (type === 'symbol') {
          return String(value);
        }

        return value;
      });
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + String(propValue) + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }

    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }

      var propValue = props[propName];
      var propType = getPropType(propValue);

      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }

      for (var key in propValue) {
        if (has$1(propValue, key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);

          if (error instanceof Error) {
            return error;
          }
        }
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? printWarning('Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunctionThatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];

      if (typeof checker !== 'function') {
        printWarning('Invalid argument supplied to oneOfType. Expected an array of check functions, but ' + 'received ' + getPostfixForTypeWarning(checker) + ' at index ' + i + '.');
        return emptyFunctionThatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      var expectedTypes = [];

      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        var checkerResult = checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret_1);

        if (checkerResult == null) {
          return null;
        }

        if (checkerResult.data && has$1(checkerResult.data, 'expectedType')) {
          expectedTypes.push(checkerResult.data.expectedType);
        }
      }

      var expectedTypesMessage = expectedTypes.length > 0 ? ', expected one of type [' + expectedTypes.join(', ') + ']' : '';
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`' + expectedTypesMessage + '.'));
    }

    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function invalidValidatorError(componentName, location, propFullName, key, type) {
    return new PropTypeError((componentName || 'React class') + ': ' + location + ' type `' + propFullName + '.' + key + '` is invalid; ' + 'it must be a function, usually from the `prop-types` package, but received `' + type + '`.');
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);

      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }

      for (var key in shapeTypes) {
        var checker = shapeTypes[key];

        if (typeof checker !== 'function') {
          return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
        }

        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);

        if (error) {
          return error;
        }
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function createStrictShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);

      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      } // We need to check all keys in case some are required but missing from props.


      var allKeys = objectAssign({}, props[propName], shapeTypes);

      for (var key in allKeys) {
        var checker = shapeTypes[key];

        if (has$1(shapeTypes, key) && typeof checker !== 'function') {
          return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
        }

        if (!checker) {
          return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` key `' + key + '` supplied to `' + componentName + '`.' + '\nBad object: ' + JSON.stringify(props[propName], null, '  ') + '\nValid keys: ' + JSON.stringify(Object.keys(shapeTypes), null, '  '));
        }

        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret_1);

        if (error) {
          return error;
        }
      }

      return null;
    }

    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;

      case 'boolean':
        return !propValue;

      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }

        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);

        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;

          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;

              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;

      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    } // falsy value can't be a Symbol


    if (!propValue) {
      return false;
    } // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'


    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    } // Fallback for non-spec compliant Symbols which are polyfilled.


    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  } // Equivalent of `typeof` but with special handling for array and regexp.


  function getPropType(propValue) {
    var propType = typeof propValue;

    if (Array.isArray(propValue)) {
      return 'array';
    }

    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }

    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }

    return propType;
  } // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.


  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }

    var propType = getPropType(propValue);

    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }

    return propType;
  } // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"


  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);

    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;

      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;

      default:
        return type;
    }
  } // Returns class name of the object, if any.


  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }

    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes_1;
  ReactPropTypes.resetWarningCache = checkPropTypes_1.resetWarningCache;
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */



function emptyFunction() {}

function emptyFunctionWithReset() {}

emptyFunctionWithReset.resetWarningCache = emptyFunction;

var factoryWithThrowingShims = function () {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret_1) {
      // It is still safe when called from React.
      return;
    }

    var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use PropTypes.checkPropTypes() to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
    err.name = 'Invariant Violation';
    throw err;
  }
  shim.isRequired = shim;

  function getShim() {
    return shim;
  }
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.

  var ReactPropTypes = {
    array: shim,
    bigint: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,
    any: shim,
    arrayOf: getShim,
    element: shim,
    elementType: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,
    checkPropTypes: emptyFunctionWithReset,
    resetWarningCache: emptyFunction
  };
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var propTypes = createCommonjsModule(function (module) {
if (process.env.NODE_ENV !== 'production') {
  var ReactIs = reactIs$1; // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod


  var throwOnDirectAccess = true;
  module.exports = factoryWithTypeCheckers(ReactIs.isElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = factoryWithThrowingShims();
}
});

var Context = createCommonjsModule(function (module, exports) {

var _interopRequireDefault = interopRequireDefault["default"];

exports.__esModule = true;
exports["default"] = exports.ReactReduxContext = void 0;

var _react$1 = _interopRequireDefault(_react);

var ReactReduxContext = /*#__PURE__*/_react$1["default"].createContext(null);

exports.ReactReduxContext = ReactReduxContext;

if (process.env.NODE_ENV !== 'production') {
  ReactReduxContext.displayName = 'ReactRedux';
}

var _default = ReactReduxContext;
exports["default"] = _default;
});

var batch_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.setBatch = exports.getBatch = void 0; // Default to a dummy "batch" implementation that just runs the callback

function defaultNoopBatch(callback) {
  callback();
}

var batch = defaultNoopBatch; // Allow injecting another batching function later

var setBatch = function setBatch(newBatch) {
  return batch = newBatch;
}; // Supply a getter just to skip dealing with ESM bindings


exports.setBatch = setBatch;

var getBatch = function getBatch() {
  return batch;
};

exports.getBatch = getBatch;
});

var createSubscription_1 = createSubscription;

 // encapsulates the subscription logic for connecting a component to the redux store, as
// well as nesting subscriptions of descendant components, so that we can ensure the
// ancestor components re-render before descendants


function createListenerCollection() {
  var batch = (0, batch_1.getBatch)();
  var first = null;
  var last = null;
  return {
    clear: function clear() {
      first = null;
      last = null;
    },
    notify: function notify() {
      batch(function () {
        var listener = first;

        while (listener) {
          listener.callback();
          listener = listener.next;
        }
      });
    },
    get: function get() {
      var listeners = [];
      var listener = first;

      while (listener) {
        listeners.push(listener);
        listener = listener.next;
      }

      return listeners;
    },
    subscribe: function subscribe(callback) {
      var isSubscribed = true;
      var listener = last = {
        callback: callback,
        next: null,
        prev: last
      };

      if (listener.prev) {
        listener.prev.next = listener;
      } else {
        first = listener;
      }

      return function unsubscribe() {
        if (!isSubscribed || first === null) return;
        isSubscribed = false;

        if (listener.next) {
          listener.next.prev = listener.prev;
        } else {
          last = listener.prev;
        }

        if (listener.prev) {
          listener.prev.next = listener.next;
        } else {
          first = listener.next;
        }
      };
    }
  };
}

var nullListeners = {
  notify: function notify() {},
  get: function get() {
    return [];
  }
};

function createSubscription(store, parentSub) {
  var unsubscribe;
  var listeners = nullListeners;

  function addNestedSub(listener) {
    trySubscribe();
    return listeners.subscribe(listener);
  }

  function notifyNestedSubs() {
    listeners.notify();
  }

  function handleChangeWrapper() {
    if (subscription.onStateChange) {
      subscription.onStateChange();
    }
  }

  function isSubscribed() {
    return Boolean(unsubscribe);
  }

  function trySubscribe() {
    if (!unsubscribe) {
      unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);
      listeners = createListenerCollection();
    }
  }

  function tryUnsubscribe() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = undefined;
      listeners.clear();
      listeners = nullListeners;
    }
  }

  var subscription = {
    addNestedSub: addNestedSub,
    notifyNestedSubs: notifyNestedSubs,
    handleChangeWrapper: handleChangeWrapper,
    isSubscribed: isSubscribed,
    trySubscribe: trySubscribe,
    tryUnsubscribe: tryUnsubscribe,
    getListeners: function getListeners() {
      return listeners;
    }
  };
  return subscription;
}

var Subscription = /*#__PURE__*/Object.defineProperty({
	createSubscription: createSubscription_1
}, '__esModule', {value: true});

var useIsomorphicLayoutEffect_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.useIsomorphicLayoutEffect = void 0;

 // React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser. We need useLayoutEffect to ensure the store
// subscription callback always has the selector from the latest render commit
// available, otherwise a store update may happen between render and the effect,
// which may cause missed updates; we also must ensure the store subscription
// is created synchronously, otherwise a store update may occur before the
// subscription is created and an inconsistent state may be observed


var useIsomorphicLayoutEffect = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined' ? _react.useLayoutEffect : _react.useEffect;
exports.useIsomorphicLayoutEffect = useIsomorphicLayoutEffect;
});

var Provider_1 = createCommonjsModule(function (module, exports) {

var _interopRequireDefault = interopRequireDefault["default"];

var _interopRequireWildcard = interopRequireWildcard["default"];

exports.__esModule = true;
exports["default"] = void 0;

var _react$1 = _interopRequireWildcard(_react);

var _propTypes = _interopRequireDefault(propTypes);







function Provider(_ref) {
  var store = _ref.store,
      context = _ref.context,
      children = _ref.children;
  var contextValue = (0, _react$1.useMemo)(function () {
    var subscription = (0, Subscription.createSubscription)(store);
    subscription.onStateChange = subscription.notifyNestedSubs;
    return {
      store: store,
      subscription: subscription
    };
  }, [store]);
  var previousState = (0, _react$1.useMemo)(function () {
    return store.getState();
  }, [store]);
  (0, useIsomorphicLayoutEffect_1.useIsomorphicLayoutEffect)(function () {
    var subscription = contextValue.subscription;
    subscription.trySubscribe();

    if (previousState !== store.getState()) {
      subscription.notifyNestedSubs();
    }

    return function () {
      subscription.tryUnsubscribe();
      subscription.onStateChange = null;
    };
  }, [contextValue, previousState]);
  var Context$1 = context || Context.ReactReduxContext;
  return /*#__PURE__*/_react$1["default"].createElement(Context$1.Provider, {
    value: contextValue
  }, children);
}

if (process.env.NODE_ENV !== 'production') {
  Provider.propTypes = {
    store: _propTypes["default"].shape({
      subscribe: _propTypes["default"].func.isRequired,
      dispatch: _propTypes["default"].func.isRequired,
      getState: _propTypes["default"].func.isRequired
    }),
    context: _propTypes["default"].object,
    children: _propTypes["default"].any
  };
}

var _default = Provider;
exports["default"] = _default;
});

var _extends_1 = createCommonjsModule(function (module) {
function _extends() {
  module.exports = _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  return _extends.apply(this, arguments);
}

module.exports = _extends, module.exports.__esModule = true, module.exports["default"] = module.exports;
});

var objectWithoutPropertiesLoose = createCommonjsModule(function (module) {
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

module.exports = _objectWithoutPropertiesLoose, module.exports.__esModule = true, module.exports["default"] = module.exports;
});

/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */


var REACT_STATICS = {
  childContextTypes: true,
  contextType: true,
  contextTypes: true,
  defaultProps: true,
  displayName: true,
  getDefaultProps: true,
  getDerivedStateFromError: true,
  getDerivedStateFromProps: true,
  mixins: true,
  propTypes: true,
  type: true
};
var KNOWN_STATICS = {
  name: true,
  length: true,
  prototype: true,
  caller: true,
  callee: true,
  arguments: true,
  arity: true
};
var FORWARD_REF_STATICS = {
  '$$typeof': true,
  render: true,
  defaultProps: true,
  displayName: true,
  propTypes: true
};
var MEMO_STATICS = {
  '$$typeof': true,
  compare: true,
  defaultProps: true,
  displayName: true,
  propTypes: true,
  type: true
};
var TYPE_STATICS = {};
TYPE_STATICS[reactIs$1.ForwardRef] = FORWARD_REF_STATICS;
TYPE_STATICS[reactIs$1.Memo] = MEMO_STATICS;

function getStatics(component) {
  // React v16.11 and below
  if (reactIs$1.isMemo(component)) {
    return MEMO_STATICS;
  } // React v16.12 and above


  return TYPE_STATICS[component['$$typeof']] || REACT_STATICS;
}

var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;

function hoistNonReactStatics(targetComponent, sourceComponent, blacklist) {
  if (typeof sourceComponent !== 'string') {
    // don't hoist over string (html) components
    if (objectPrototype) {
      var inheritedComponent = getPrototypeOf(sourceComponent);

      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, blacklist);
      }
    }

    var keys = getOwnPropertyNames(sourceComponent);

    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
    }

    var targetStatics = getStatics(targetComponent);
    var sourceStatics = getStatics(sourceComponent);

    for (var i = 0; i < keys.length; ++i) {
      var key = keys[i];

      if (!KNOWN_STATICS[key] && !(blacklist && blacklist[key]) && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
        var descriptor = getOwnPropertyDescriptor(sourceComponent, key);

        try {
          // Avoid failures from read-only properties
          defineProperty(targetComponent, key, descriptor);
        } catch (e) {}
      }
    }
  }

  return targetComponent;
}

var hoistNonReactStatics_cjs = hoistNonReactStatics;

/** @license React v17.0.2
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var b = 60103,
    c = 60106,
    d = 60107,
    e = 60108,
    f = 60114,
    g = 60109,
    h = 60110,
    k = 60112,
    l = 60113,
    m = 60120,
    n = 60115,
    p = 60116,
    q = 60121,
    r = 60122,
    u = 60117,
    v = 60129,
    w = 60131;

if ("function" === typeof Symbol && Symbol.for) {
  var x = Symbol.for;
  b = x("react.element");
  c = x("react.portal");
  d = x("react.fragment");
  e = x("react.strict_mode");
  f = x("react.profiler");
  g = x("react.provider");
  h = x("react.context");
  k = x("react.forward_ref");
  l = x("react.suspense");
  m = x("react.suspense_list");
  n = x("react.memo");
  p = x("react.lazy");
  q = x("react.block");
  r = x("react.server.block");
  u = x("react.fundamental");
  v = x("react.debug_trace_mode");
  w = x("react.legacy_hidden");
}

function y(a) {
  if ("object" === typeof a && null !== a) {
    var t = a.$$typeof;

    switch (t) {
      case b:
        switch (a = a.type, a) {
          case d:
          case f:
          case e:
          case l:
          case m:
            return a;

          default:
            switch (a = a && a.$$typeof, a) {
              case h:
              case k:
              case p:
              case n:
              case g:
                return a;

              default:
                return t;
            }

        }

      case c:
        return t;
    }
  }
}

var z = g,
    A = b,
    B = k,
    C = d,
    D = p,
    E = n,
    F = c,
    G = f,
    H = e,
    I = l;
var ContextConsumer = h;
var ContextProvider = z;
var Element = A;
var ForwardRef = B;
var Fragment = C;
var Lazy = D;
var Memo = E;
var Portal = F;
var Profiler = G;
var StrictMode = H;
var Suspense = I;

var isAsyncMode = function () {
  return !1;
};

var isConcurrentMode = function () {
  return !1;
};

var isContextConsumer = function (a) {
  return y(a) === h;
};

var isContextProvider = function (a) {
  return y(a) === g;
};

var isElement = function (a) {
  return "object" === typeof a && null !== a && a.$$typeof === b;
};

var isForwardRef = function (a) {
  return y(a) === k;
};

var isFragment = function (a) {
  return y(a) === d;
};

var isLazy = function (a) {
  return y(a) === p;
};

var isMemo = function (a) {
  return y(a) === n;
};

var isPortal = function (a) {
  return y(a) === c;
};

var isProfiler = function (a) {
  return y(a) === f;
};

var isStrictMode = function (a) {
  return y(a) === e;
};

var isSuspense = function (a) {
  return y(a) === l;
};

var isValidElementType = function (a) {
  return "string" === typeof a || "function" === typeof a || a === d || a === f || a === v || a === e || a === l || a === m || a === w || "object" === typeof a && null !== a && (a.$$typeof === p || a.$$typeof === n || a.$$typeof === g || a.$$typeof === h || a.$$typeof === k || a.$$typeof === u || a.$$typeof === q || a[0] === r) ? !0 : !1;
};

var typeOf = y;

var reactIs_production_min = {
	ContextConsumer: ContextConsumer,
	ContextProvider: ContextProvider,
	Element: Element,
	ForwardRef: ForwardRef,
	Fragment: Fragment,
	Lazy: Lazy,
	Memo: Memo,
	Portal: Portal,
	Profiler: Profiler,
	StrictMode: StrictMode,
	Suspense: Suspense,
	isAsyncMode: isAsyncMode,
	isConcurrentMode: isConcurrentMode,
	isContextConsumer: isContextConsumer,
	isContextProvider: isContextProvider,
	isElement: isElement,
	isForwardRef: isForwardRef,
	isFragment: isFragment,
	isLazy: isLazy,
	isMemo: isMemo,
	isPortal: isPortal,
	isProfiler: isProfiler,
	isStrictMode: isStrictMode,
	isSuspense: isSuspense,
	isValidElementType: isValidElementType,
	typeOf: typeOf
};

/** @license React v17.0.2
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var reactIs_development = createCommonjsModule(function (module, exports) {

if (process.env.NODE_ENV !== "production") {
  (function () {
    // When adding new symbols to this file,
    // Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
    // The Symbol used to tag the ReactElement-like types. If there is no native Symbol
    // nor polyfill, then a plain number is used for performance.

    var REACT_ELEMENT_TYPE = 0xeac7;
    var REACT_PORTAL_TYPE = 0xeaca;
    var REACT_FRAGMENT_TYPE = 0xeacb;
    var REACT_STRICT_MODE_TYPE = 0xeacc;
    var REACT_PROFILER_TYPE = 0xead2;
    var REACT_PROVIDER_TYPE = 0xeacd;
    var REACT_CONTEXT_TYPE = 0xeace;
    var REACT_FORWARD_REF_TYPE = 0xead0;
    var REACT_SUSPENSE_TYPE = 0xead1;
    var REACT_SUSPENSE_LIST_TYPE = 0xead8;
    var REACT_MEMO_TYPE = 0xead3;
    var REACT_LAZY_TYPE = 0xead4;
    var REACT_BLOCK_TYPE = 0xead9;
    var REACT_SERVER_BLOCK_TYPE = 0xeada;
    var REACT_FUNDAMENTAL_TYPE = 0xead5;
    var REACT_DEBUG_TRACING_MODE_TYPE = 0xeae1;
    var REACT_LEGACY_HIDDEN_TYPE = 0xeae3;

    if (typeof Symbol === 'function' && Symbol.for) {
      var symbolFor = Symbol.for;
      REACT_ELEMENT_TYPE = symbolFor('react.element');
      REACT_PORTAL_TYPE = symbolFor('react.portal');
      REACT_FRAGMENT_TYPE = symbolFor('react.fragment');
      REACT_STRICT_MODE_TYPE = symbolFor('react.strict_mode');
      REACT_PROFILER_TYPE = symbolFor('react.profiler');
      REACT_PROVIDER_TYPE = symbolFor('react.provider');
      REACT_CONTEXT_TYPE = symbolFor('react.context');
      REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
      REACT_SUSPENSE_TYPE = symbolFor('react.suspense');
      REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
      REACT_MEMO_TYPE = symbolFor('react.memo');
      REACT_LAZY_TYPE = symbolFor('react.lazy');
      REACT_BLOCK_TYPE = symbolFor('react.block');
      REACT_SERVER_BLOCK_TYPE = symbolFor('react.server.block');
      REACT_FUNDAMENTAL_TYPE = symbolFor('react.fundamental');
      symbolFor('react.scope');
      symbolFor('react.opaque.id');
      REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
      symbolFor('react.offscreen');
      REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
    } // Filter certain DOM attributes (e.g. src, href) if their values are empty strings.


    var enableScopeAPI = false; // Experimental Create Event Handle API.

    function isValidElementType(type) {
      if (typeof type === 'string' || typeof type === 'function') {
        return true;
      } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


      if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_DEBUG_TRACING_MODE_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_LEGACY_HIDDEN_TYPE || enableScopeAPI) {
        return true;
      }

      if (typeof type === 'object' && type !== null) {
        if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_BLOCK_TYPE || type[0] === REACT_SERVER_BLOCK_TYPE) {
          return true;
        }
      }

      return false;
    }

    function typeOf(object) {
      if (typeof object === 'object' && object !== null) {
        var $$typeof = object.$$typeof;

        switch ($$typeof) {
          case REACT_ELEMENT_TYPE:
            var type = object.type;

            switch (type) {
              case REACT_FRAGMENT_TYPE:
              case REACT_PROFILER_TYPE:
              case REACT_STRICT_MODE_TYPE:
              case REACT_SUSPENSE_TYPE:
              case REACT_SUSPENSE_LIST_TYPE:
                return type;

              default:
                var $$typeofType = type && type.$$typeof;

                switch ($$typeofType) {
                  case REACT_CONTEXT_TYPE:
                  case REACT_FORWARD_REF_TYPE:
                  case REACT_LAZY_TYPE:
                  case REACT_MEMO_TYPE:
                  case REACT_PROVIDER_TYPE:
                    return $$typeofType;

                  default:
                    return $$typeof;
                }

            }

          case REACT_PORTAL_TYPE:
            return $$typeof;
        }
      }

      return undefined;
    }

    var ContextConsumer = REACT_CONTEXT_TYPE;
    var ContextProvider = REACT_PROVIDER_TYPE;
    var Element = REACT_ELEMENT_TYPE;
    var ForwardRef = REACT_FORWARD_REF_TYPE;
    var Fragment = REACT_FRAGMENT_TYPE;
    var Lazy = REACT_LAZY_TYPE;
    var Memo = REACT_MEMO_TYPE;
    var Portal = REACT_PORTAL_TYPE;
    var Profiler = REACT_PROFILER_TYPE;
    var StrictMode = REACT_STRICT_MODE_TYPE;
    var Suspense = REACT_SUSPENSE_TYPE;
    var hasWarnedAboutDeprecatedIsAsyncMode = false;
    var hasWarnedAboutDeprecatedIsConcurrentMode = false; // AsyncMode should be deprecated

    function isAsyncMode(object) {
      {
        if (!hasWarnedAboutDeprecatedIsAsyncMode) {
          hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

          console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
        }
      }
      return false;
    }

    function isConcurrentMode(object) {
      {
        if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
          hasWarnedAboutDeprecatedIsConcurrentMode = true; // Using console['warn'] to evade Babel and ESLint

          console['warn']('The ReactIs.isConcurrentMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
        }
      }
      return false;
    }

    function isContextConsumer(object) {
      return typeOf(object) === REACT_CONTEXT_TYPE;
    }

    function isContextProvider(object) {
      return typeOf(object) === REACT_PROVIDER_TYPE;
    }

    function isElement(object) {
      return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
    }

    function isForwardRef(object) {
      return typeOf(object) === REACT_FORWARD_REF_TYPE;
    }

    function isFragment(object) {
      return typeOf(object) === REACT_FRAGMENT_TYPE;
    }

    function isLazy(object) {
      return typeOf(object) === REACT_LAZY_TYPE;
    }

    function isMemo(object) {
      return typeOf(object) === REACT_MEMO_TYPE;
    }

    function isPortal(object) {
      return typeOf(object) === REACT_PORTAL_TYPE;
    }

    function isProfiler(object) {
      return typeOf(object) === REACT_PROFILER_TYPE;
    }

    function isStrictMode(object) {
      return typeOf(object) === REACT_STRICT_MODE_TYPE;
    }

    function isSuspense(object) {
      return typeOf(object) === REACT_SUSPENSE_TYPE;
    }

    exports.ContextConsumer = ContextConsumer;
    exports.ContextProvider = ContextProvider;
    exports.Element = Element;
    exports.ForwardRef = ForwardRef;
    exports.Fragment = Fragment;
    exports.Lazy = Lazy;
    exports.Memo = Memo;
    exports.Portal = Portal;
    exports.Profiler = Profiler;
    exports.StrictMode = StrictMode;
    exports.Suspense = Suspense;
    exports.isAsyncMode = isAsyncMode;
    exports.isConcurrentMode = isConcurrentMode;
    exports.isContextConsumer = isContextConsumer;
    exports.isContextProvider = isContextProvider;
    exports.isElement = isElement;
    exports.isForwardRef = isForwardRef;
    exports.isFragment = isFragment;
    exports.isLazy = isLazy;
    exports.isMemo = isMemo;
    exports.isPortal = isPortal;
    exports.isProfiler = isProfiler;
    exports.isStrictMode = isStrictMode;
    exports.isSuspense = isSuspense;
    exports.isValidElementType = isValidElementType;
    exports.typeOf = typeOf;
  })();
}
});

var reactIs = createCommonjsModule(function (module) {

if (process.env.NODE_ENV === 'production') {
  module.exports = reactIs_production_min;
} else {
  module.exports = reactIs_development;
}
});

var connectAdvanced_1 = createCommonjsModule(function (module, exports) {

var _interopRequireDefault = interopRequireDefault["default"];

var _interopRequireWildcard = interopRequireWildcard["default"];

exports.__esModule = true;
exports["default"] = connectAdvanced;

var _extends2 = _interopRequireDefault(_extends_1);

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(objectWithoutPropertiesLoose);

var _hoistNonReactStatics = _interopRequireDefault(hoistNonReactStatics_cjs);

var _react$1 = _interopRequireWildcard(_react);









var _excluded = ["getDisplayName", "methodName", "renderCountProp", "shouldHandleStateChanges", "storeKey", "withRef", "forwardRef", "context"],
    _excluded2 = ["reactReduxForwardedRef"]; // Define some constant arrays just to avoid re-creating these

var EMPTY_ARRAY = [];
var NO_SUBSCRIPTION_ARRAY = [null, null];

var stringifyComponent = function stringifyComponent(Comp) {
  try {
    return JSON.stringify(Comp);
  } catch (err) {
    return String(Comp);
  }
};

function storeStateUpdatesReducer(state, action) {
  var updateCount = state[1];
  return [action.payload, updateCount + 1];
}

function useIsomorphicLayoutEffectWithArgs(effectFunc, effectArgs, dependencies) {
  (0, useIsomorphicLayoutEffect_1.useIsomorphicLayoutEffect)(function () {
    return effectFunc.apply(void 0, effectArgs);
  }, dependencies);
}

function captureWrapperProps(lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, actualChildProps, childPropsFromStoreUpdate, notifyNestedSubs) {
  // We want to capture the wrapper props and child props we used for later comparisons
  lastWrapperProps.current = wrapperProps;
  lastChildProps.current = actualChildProps;
  renderIsScheduled.current = false; // If the render was from a store update, clear out that reference and cascade the subscriber update

  if (childPropsFromStoreUpdate.current) {
    childPropsFromStoreUpdate.current = null;
    notifyNestedSubs();
  }
}

function subscribeUpdates(shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, childPropsFromStoreUpdate, notifyNestedSubs, forceComponentUpdateDispatch) {
  // If we're not subscribed to the store, nothing to do here
  if (!shouldHandleStateChanges) return; // Capture values for checking if and when this component unmounts

  var didUnsubscribe = false;
  var lastThrownError = null; // We'll run this callback every time a store subscription update propagates to this component

  var checkForUpdates = function checkForUpdates() {
    if (didUnsubscribe) {
      // Don't run stale listeners.
      // Redux doesn't guarantee unsubscriptions happen until next dispatch.
      return;
    }

    var latestStoreState = store.getState();
    var newChildProps, error;

    try {
      // Actually run the selector with the most recent store state and wrapper props
      // to determine what the child props should be
      newChildProps = childPropsSelector(latestStoreState, lastWrapperProps.current);
    } catch (e) {
      error = e;
      lastThrownError = e;
    }

    if (!error) {
      lastThrownError = null;
    } // If the child props haven't changed, nothing to do here - cascade the subscription update


    if (newChildProps === lastChildProps.current) {
      if (!renderIsScheduled.current) {
        notifyNestedSubs();
      }
    } else {
      // Save references to the new child props.  Note that we track the "child props from store update"
      // as a ref instead of a useState/useReducer because we need a way to determine if that value has
      // been processed.  If this went into useState/useReducer, we couldn't clear out the value without
      // forcing another re-render, which we don't want.
      lastChildProps.current = newChildProps;
      childPropsFromStoreUpdate.current = newChildProps;
      renderIsScheduled.current = true; // If the child props _did_ change (or we caught an error), this wrapper component needs to re-render

      forceComponentUpdateDispatch({
        type: 'STORE_UPDATED',
        payload: {
          error: error
        }
      });
    }
  }; // Actually subscribe to the nearest connected ancestor (or store)


  subscription.onStateChange = checkForUpdates;
  subscription.trySubscribe(); // Pull data from the store after first render in case the store has
  // changed since we began.

  checkForUpdates();

  var unsubscribeWrapper = function unsubscribeWrapper() {
    didUnsubscribe = true;
    subscription.tryUnsubscribe();
    subscription.onStateChange = null;

    if (lastThrownError) {
      // It's possible that we caught an error due to a bad mapState function, but the
      // parent re-rendered without this component and we're about to unmount.
      // This shouldn't happen as long as we do top-down subscriptions correctly, but
      // if we ever do those wrong, this throw will surface the error in our tests.
      // In that case, throw the error from here so it doesn't get lost.
      throw lastThrownError;
    }
  };

  return unsubscribeWrapper;
}

var initStateUpdates = function initStateUpdates() {
  return [null, 0];
};

function connectAdvanced(
/*
  selectorFactory is a func that is responsible for returning the selector function used to
  compute new props from state, props, and dispatch. For example:
     export default connectAdvanced((dispatch, options) => (state, props) => ({
      thing: state.things[props.thingId],
      saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
    }))(YourComponent)
   Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
  outside of their selector as an optimization. Options passed to connectAdvanced are passed to
  the selectorFactory, along with displayName and WrappedComponent, as the second argument.
   Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
  props. Do not use connectAdvanced directly without memoizing results between calls to your
  selector, otherwise the Connect component will re-render on every state or props change.
*/
selectorFactory, // options object:
_ref) {
  if (_ref === void 0) {
    _ref = {};
  }

  var _ref2 = _ref,
      _ref2$getDisplayName = _ref2.getDisplayName,
      getDisplayName = _ref2$getDisplayName === void 0 ? function (name) {
    return "ConnectAdvanced(" + name + ")";
  } : _ref2$getDisplayName,
      _ref2$methodName = _ref2.methodName,
      methodName = _ref2$methodName === void 0 ? 'connectAdvanced' : _ref2$methodName,
      _ref2$renderCountProp = _ref2.renderCountProp,
      renderCountProp = _ref2$renderCountProp === void 0 ? undefined : _ref2$renderCountProp,
      _ref2$shouldHandleSta = _ref2.shouldHandleStateChanges,
      shouldHandleStateChanges = _ref2$shouldHandleSta === void 0 ? true : _ref2$shouldHandleSta,
      _ref2$storeKey = _ref2.storeKey,
      storeKey = _ref2$storeKey === void 0 ? 'store' : _ref2$storeKey,
      _ref2$withRef = _ref2.withRef,
      withRef = _ref2$withRef === void 0 ? false : _ref2$withRef,
      _ref2$forwardRef = _ref2.forwardRef,
      forwardRef = _ref2$forwardRef === void 0 ? false : _ref2$forwardRef,
      _ref2$context = _ref2.context,
      context = _ref2$context === void 0 ? Context.ReactReduxContext : _ref2$context,
      connectOptions = (0, _objectWithoutPropertiesLoose2["default"])(_ref2, _excluded);

  if (process.env.NODE_ENV !== 'production') {
    if (renderCountProp !== undefined) {
      throw new Error("renderCountProp is removed. render counting is built into the latest React Dev Tools profiling extension");
    }

    if (withRef) {
      throw new Error('withRef is removed. To access the wrapped instance, use a ref on the connected component');
    }

    var customStoreWarningMessage = 'To use a custom Redux store for specific components, create a custom React context with ' + "React.createContext(), and pass the context object to React Redux's Provider and specific components" + ' like: <Provider context={MyContext}><ConnectedComponent context={MyContext} /></Provider>. ' + 'You may also pass a {context : MyContext} option to connect';

    if (storeKey !== 'store') {
      throw new Error('storeKey has been removed and does not do anything. ' + customStoreWarningMessage);
    }
  }

  var Context$1 = context;
  return function wrapWithConnect(WrappedComponent) {
    if (process.env.NODE_ENV !== 'production' && !(0, reactIs.isValidElementType)(WrappedComponent)) {
      throw new Error("You must pass a component to the function returned by " + (methodName + ". Instead received " + stringifyComponent(WrappedComponent)));
    }

    var wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    var displayName = getDisplayName(wrappedComponentName);
    var selectorFactoryOptions = (0, _extends2["default"])({}, connectOptions, {
      getDisplayName: getDisplayName,
      methodName: methodName,
      renderCountProp: renderCountProp,
      shouldHandleStateChanges: shouldHandleStateChanges,
      storeKey: storeKey,
      displayName: displayName,
      wrappedComponentName: wrappedComponentName,
      WrappedComponent: WrappedComponent
    });
    var pure = connectOptions.pure;

    function createChildSelector(store) {
      return selectorFactory(store.dispatch, selectorFactoryOptions);
    } // If we aren't running in "pure" mode, we don't want to memoize values.
    // To avoid conditionally calling hooks, we fall back to a tiny wrapper
    // that just executes the given callback immediately.


    var usePureOnlyMemo = pure ? _react$1.useMemo : function (callback) {
      return callback();
    };

    function ConnectFunction(props) {
      var _useMemo = (0, _react$1.useMemo)(function () {
        // Distinguish between actual "data" props that were passed to the wrapper component,
        // and values needed to control behavior (forwarded refs, alternate context instances).
        // To maintain the wrapperProps object reference, memoize this destructuring.
        var reactReduxForwardedRef = props.reactReduxForwardedRef,
            wrapperProps = (0, _objectWithoutPropertiesLoose2["default"])(props, _excluded2);
        return [props.context, reactReduxForwardedRef, wrapperProps];
      }, [props]),
          propsContext = _useMemo[0],
          reactReduxForwardedRef = _useMemo[1],
          wrapperProps = _useMemo[2];

      var ContextToUse = (0, _react$1.useMemo)(function () {
        // Users may optionally pass in a custom context instance to use instead of our ReactReduxContext.
        // Memoize the check that determines which context instance we should use.
        return propsContext && propsContext.Consumer && (0, reactIs.isContextConsumer)( /*#__PURE__*/_react$1["default"].createElement(propsContext.Consumer, null)) ? propsContext : Context$1;
      }, [propsContext, Context$1]); // Retrieve the store and ancestor subscription via context, if available

      var contextValue = (0, _react$1.useContext)(ContextToUse); // The store _must_ exist as either a prop or in context.
      // We'll check to see if it _looks_ like a Redux store first.
      // This allows us to pass through a `store` prop that is just a plain value.

      var didStoreComeFromProps = Boolean(props.store) && Boolean(props.store.getState) && Boolean(props.store.dispatch);
      var didStoreComeFromContext = Boolean(contextValue) && Boolean(contextValue.store);

      if (process.env.NODE_ENV !== 'production' && !didStoreComeFromProps && !didStoreComeFromContext) {
        throw new Error("Could not find \"store\" in the context of " + ("\"" + displayName + "\". Either wrap the root component in a <Provider>, ") + "or pass a custom React context provider to <Provider> and the corresponding " + ("React context consumer to " + displayName + " in connect options."));
      } // Based on the previous check, one of these must be true


      var store = didStoreComeFromProps ? props.store : contextValue.store;
      var childPropsSelector = (0, _react$1.useMemo)(function () {
        // The child props selector needs the store reference as an input.
        // Re-create this selector whenever the store changes.
        return createChildSelector(store);
      }, [store]);

      var _useMemo2 = (0, _react$1.useMemo)(function () {
        if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY; // This Subscription's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.
        // This Subscription's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.

        var subscription = (0, Subscription.createSubscription)(store, didStoreComeFromProps ? null : contextValue.subscription); // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
        // the middle of the notification loop, where `subscription` will then be null. This can
        // probably be avoided if Subscription's listeners logic is changed to not call listeners
        // that have been unsubscribed in the  middle of the notification loop.
        // `notifyNestedSubs` is duplicated to handle the case where the component is unmounted in
        // the middle of the notification loop, where `subscription` will then be null. This can
        // probably be avoided if Subscription's listeners logic is changed to not call listeners
        // that have been unsubscribed in the  middle of the notification loop.

        var notifyNestedSubs = subscription.notifyNestedSubs.bind(subscription);
        return [subscription, notifyNestedSubs];
      }, [store, didStoreComeFromProps, contextValue]),
          subscription = _useMemo2[0],
          notifyNestedSubs = _useMemo2[1]; // Determine what {store, subscription} value should be put into nested context, if necessary,
      // and memoize that value to avoid unnecessary context updates.


      var overriddenContextValue = (0, _react$1.useMemo)(function () {
        if (didStoreComeFromProps) {
          // This component is directly subscribed to a store from props.
          // We don't want descendants reading from this store - pass down whatever
          // the existing context value is from the nearest connected ancestor.
          return contextValue;
        } // Otherwise, put this component's subscription instance into context, so that
        // connected descendants won't update until after this component is done


        return (0, _extends2["default"])({}, contextValue, {
          subscription: subscription
        });
      }, [didStoreComeFromProps, contextValue, subscription]); // We need to force this wrapper component to re-render whenever a Redux store update
      // causes a change to the calculated child component props (or we caught an error in mapState)

      var _useReducer = (0, _react$1.useReducer)(storeStateUpdatesReducer, EMPTY_ARRAY, initStateUpdates),
          _useReducer$ = _useReducer[0],
          previousStateUpdateResult = _useReducer$[0],
          forceComponentUpdateDispatch = _useReducer[1]; // Propagate any mapState/mapDispatch errors upwards


      if (previousStateUpdateResult && previousStateUpdateResult.error) {
        throw previousStateUpdateResult.error;
      } // Set up refs to coordinate values between the subscription effect and the render logic


      var lastChildProps = (0, _react$1.useRef)();
      var lastWrapperProps = (0, _react$1.useRef)(wrapperProps);
      var childPropsFromStoreUpdate = (0, _react$1.useRef)();
      var renderIsScheduled = (0, _react$1.useRef)(false);
      var actualChildProps = usePureOnlyMemo(function () {
        // Tricky logic here:
        // - This render may have been triggered by a Redux store update that produced new child props
        // - However, we may have gotten new wrapper props after that
        // If we have new child props, and the same wrapper props, we know we should use the new child props as-is.
        // But, if we have new wrapper props, those might change the child props, so we have to recalculate things.
        // So, we'll use the child props from store update only if the wrapper props are the same as last time.
        if (childPropsFromStoreUpdate.current && wrapperProps === lastWrapperProps.current) {
          return childPropsFromStoreUpdate.current;
        } // TODO We're reading the store directly in render() here. Bad idea?
        // This will likely cause Bad Things (TM) to happen in Concurrent Mode.
        // Note that we do this because on renders _not_ caused by store updates, we need the latest store state
        // to determine what the child props should be.


        return childPropsSelector(store.getState(), wrapperProps);
      }, [store, previousStateUpdateResult, wrapperProps]); // We need this to execute synchronously every time we re-render. However, React warns
      // about useLayoutEffect in SSR, so we try to detect environment and fall back to
      // just useEffect instead to avoid the warning, since neither will run anyway.

      useIsomorphicLayoutEffectWithArgs(captureWrapperProps, [lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, actualChildProps, childPropsFromStoreUpdate, notifyNestedSubs]); // Our re-subscribe logic only runs when the store/subscription setup changes

      useIsomorphicLayoutEffectWithArgs(subscribeUpdates, [shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, childPropsFromStoreUpdate, notifyNestedSubs, forceComponentUpdateDispatch], [store, subscription, childPropsSelector]); // Now that all that's done, we can finally try to actually render the child component.
      // We memoize the elements for the rendered child component as an optimization.

      var renderedWrappedComponent = (0, _react$1.useMemo)(function () {
        return /*#__PURE__*/_react$1["default"].createElement(WrappedComponent, (0, _extends2["default"])({}, actualChildProps, {
          ref: reactReduxForwardedRef
        }));
      }, [reactReduxForwardedRef, WrappedComponent, actualChildProps]); // If React sees the exact same element reference as last time, it bails out of re-rendering
      // that child, same as if it was wrapped in React.memo() or returned false from shouldComponentUpdate.

      var renderedChild = (0, _react$1.useMemo)(function () {
        if (shouldHandleStateChanges) {
          // If this component is subscribed to store updates, we need to pass its own
          // subscription instance down to our descendants. That means rendering the same
          // Context instance, and putting a different value into the context.
          return /*#__PURE__*/_react$1["default"].createElement(ContextToUse.Provider, {
            value: overriddenContextValue
          }, renderedWrappedComponent);
        }

        return renderedWrappedComponent;
      }, [ContextToUse, renderedWrappedComponent, overriddenContextValue]);
      return renderedChild;
    } // If we're in "pure" mode, ensure our wrapper component only re-renders when incoming props have changed.


    var Connect = pure ? _react$1["default"].memo(ConnectFunction) : ConnectFunction;
    Connect.WrappedComponent = WrappedComponent;
    Connect.displayName = ConnectFunction.displayName = displayName;

    if (forwardRef) {
      var forwarded = _react$1["default"].forwardRef(function forwardConnectRef(props, ref) {
        return /*#__PURE__*/_react$1["default"].createElement(Connect, (0, _extends2["default"])({}, props, {
          reactReduxForwardedRef: ref
        }));
      });

      forwarded.displayName = displayName;
      forwarded.WrappedComponent = WrappedComponent;
      return (0, _hoistNonReactStatics["default"])(forwarded, WrappedComponent);
    }

    return (0, _hoistNonReactStatics["default"])(Connect, WrappedComponent);
  };
}
});

var shallowEqual_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports["default"] = shallowEqual;

function is(x, y) {
  if (x === y) {
    return x !== 0 || y !== 0 || 1 / x === 1 / y;
  } else {
    return x !== x && y !== y;
  }
}

function shallowEqual(objA, objB) {
  if (is(objA, objB)) return true;

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  var keysA = Object.keys(objA);
  var keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;

  for (var i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
}
});

var bindActionCreators_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports["default"] = bindActionCreators;

function bindActionCreators(actionCreators, dispatch) {
  var boundActionCreators = {};

  var _loop = function _loop(key) {
    var actionCreator = actionCreators[key];

    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = function () {
        return dispatch(actionCreator.apply(void 0, arguments));
      };
    }
  };

  for (var key in actionCreators) {
    _loop(key);
  }

  return boundActionCreators;
}
});

var isPlainObject_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports["default"] = isPlainObject;
/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */

function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) return false;
  var proto = Object.getPrototypeOf(obj);
  if (proto === null) return true;
  var baseProto = proto;

  while (Object.getPrototypeOf(baseProto) !== null) {
    baseProto = Object.getPrototypeOf(baseProto);
  }

  return proto === baseProto;
}
});

var warning_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports["default"] = warning;
/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */

function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */


  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */

}
});

var verifyPlainObject_1 = createCommonjsModule(function (module, exports) {

var _interopRequireDefault = interopRequireDefault["default"];

exports.__esModule = true;
exports["default"] = verifyPlainObject;

var _isPlainObject = _interopRequireDefault(isPlainObject_1);

var _warning = _interopRequireDefault(warning_1);

function verifyPlainObject(value, displayName, methodName) {
  if (!(0, _isPlainObject["default"])(value)) {
    (0, _warning["default"])(methodName + "() in " + displayName + " must return a plain object. Instead received " + value + ".");
  }
}
});

var _interopRequireDefault$1 = interopRequireDefault["default"];


var getDependsOnOwnProps_1 = getDependsOnOwnProps;
var wrapMapToPropsConstant_1 = wrapMapToPropsConstant;
var wrapMapToPropsFunc_1 = wrapMapToPropsFunc;

var _verifyPlainObject = _interopRequireDefault$1(verifyPlainObject_1);

function wrapMapToPropsConstant(getConstant) {
  return function initConstantSelector(dispatch, options) {
    var constant = getConstant(dispatch, options);

    function constantSelector() {
      return constant;
    }

    constantSelector.dependsOnOwnProps = false;
    return constantSelector;
  };
} // dependsOnOwnProps is used by createMapToPropsProxy to determine whether to pass props as args
// to the mapToProps function being wrapped. It is also used by makePurePropsSelector to determine
// whether mapToProps needs to be invoked when props have changed.
//
// A length of one signals that mapToProps does not depend on props from the parent component.
// A length of zero is assumed to mean mapToProps is getting args via arguments or ...args and
// therefore not reporting its length accurately..


function getDependsOnOwnProps(mapToProps) {
  return mapToProps.dependsOnOwnProps !== null && mapToProps.dependsOnOwnProps !== undefined ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
} // Used by whenMapStateToPropsIsFunction and whenMapDispatchToPropsIsFunction,
// this function wraps mapToProps in a proxy function which does several things:
//
//  * Detects whether the mapToProps function being called depends on props, which
//    is used by selectorFactory to decide if it should reinvoke on props changes.
//
//  * On first call, handles mapToProps if returns another function, and treats that
//    new function as the true mapToProps for subsequent calls.
//
//  * On first call, verifies the first result is a plain object, in order to warn
//    the developer that their mapToProps function is not returning a valid result.
//


function wrapMapToPropsFunc(mapToProps, methodName) {
  return function initProxySelector(dispatch, _ref) {
    var displayName = _ref.displayName;

    var proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
      return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch);
    }; // allow detectFactoryAndVerify to get ownProps


    proxy.dependsOnOwnProps = true;

    proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
      proxy.mapToProps = mapToProps;
      proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
      var props = proxy(stateOrDispatch, ownProps);

      if (typeof props === 'function') {
        proxy.mapToProps = props;
        proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
        props = proxy(stateOrDispatch, ownProps);
      }

      if (process.env.NODE_ENV !== 'production') (0, _verifyPlainObject["default"])(props, displayName, methodName);
      return props;
    };

    return proxy;
  };
}

var wrapMapToProps = /*#__PURE__*/Object.defineProperty({
	getDependsOnOwnProps: getDependsOnOwnProps_1,
	wrapMapToPropsConstant: wrapMapToPropsConstant_1,
	wrapMapToPropsFunc: wrapMapToPropsFunc_1
}, '__esModule', {value: true});

var mapDispatchToProps = createCommonjsModule(function (module, exports) {

var _interopRequireDefault = interopRequireDefault["default"];

exports.__esModule = true;
exports["default"] = void 0;
exports.whenMapDispatchToPropsIsFunction = whenMapDispatchToPropsIsFunction;
exports.whenMapDispatchToPropsIsMissing = whenMapDispatchToPropsIsMissing;
exports.whenMapDispatchToPropsIsObject = whenMapDispatchToPropsIsObject;

var _bindActionCreators = _interopRequireDefault(bindActionCreators_1);



function whenMapDispatchToPropsIsFunction(mapDispatchToProps) {
  return typeof mapDispatchToProps === 'function' ? (0, wrapMapToProps.wrapMapToPropsFunc)(mapDispatchToProps, 'mapDispatchToProps') : undefined;
}

function whenMapDispatchToPropsIsMissing(mapDispatchToProps) {
  return !mapDispatchToProps ? (0, wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
    return {
      dispatch: dispatch
    };
  }) : undefined;
}

function whenMapDispatchToPropsIsObject(mapDispatchToProps) {
  return mapDispatchToProps && typeof mapDispatchToProps === 'object' ? (0, wrapMapToProps.wrapMapToPropsConstant)(function (dispatch) {
    return (0, _bindActionCreators["default"])(mapDispatchToProps, dispatch);
  }) : undefined;
}

var _default = [whenMapDispatchToPropsIsFunction, whenMapDispatchToPropsIsMissing, whenMapDispatchToPropsIsObject];
exports["default"] = _default;
});

var mapStateToProps = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports["default"] = void 0;
exports.whenMapStateToPropsIsFunction = whenMapStateToPropsIsFunction;
exports.whenMapStateToPropsIsMissing = whenMapStateToPropsIsMissing;



function whenMapStateToPropsIsFunction(mapStateToProps) {
  return typeof mapStateToProps === 'function' ? (0, wrapMapToProps.wrapMapToPropsFunc)(mapStateToProps, 'mapStateToProps') : undefined;
}

function whenMapStateToPropsIsMissing(mapStateToProps) {
  return !mapStateToProps ? (0, wrapMapToProps.wrapMapToPropsConstant)(function () {
    return {};
  }) : undefined;
}

var _default = [whenMapStateToPropsIsFunction, whenMapStateToPropsIsMissing];
exports["default"] = _default;
});

var mergeProps = createCommonjsModule(function (module, exports) {

var _interopRequireDefault = interopRequireDefault["default"];

exports.__esModule = true;
exports["default"] = void 0;
exports.defaultMergeProps = defaultMergeProps;
exports.whenMergePropsIsFunction = whenMergePropsIsFunction;
exports.whenMergePropsIsOmitted = whenMergePropsIsOmitted;
exports.wrapMergePropsFunc = wrapMergePropsFunc;

var _extends2 = _interopRequireDefault(_extends_1);

var _verifyPlainObject = _interopRequireDefault(verifyPlainObject_1);

function defaultMergeProps(stateProps, dispatchProps, ownProps) {
  return (0, _extends2["default"])({}, ownProps, stateProps, dispatchProps);
}

function wrapMergePropsFunc(mergeProps) {
  return function initMergePropsProxy(dispatch, _ref) {
    var displayName = _ref.displayName,
        pure = _ref.pure,
        areMergedPropsEqual = _ref.areMergedPropsEqual;
    var hasRunOnce = false;
    var mergedProps;
    return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
      var nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);

      if (hasRunOnce) {
        if (!pure || !areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
      } else {
        hasRunOnce = true;
        mergedProps = nextMergedProps;
        if (process.env.NODE_ENV !== 'production') (0, _verifyPlainObject["default"])(mergedProps, displayName, 'mergeProps');
      }

      return mergedProps;
    };
  };
}

function whenMergePropsIsFunction(mergeProps) {
  return typeof mergeProps === 'function' ? wrapMergePropsFunc(mergeProps) : undefined;
}

function whenMergePropsIsOmitted(mergeProps) {
  return !mergeProps ? function () {
    return defaultMergeProps;
  } : undefined;
}

var _default = [whenMergePropsIsFunction, whenMergePropsIsOmitted];
exports["default"] = _default;
});

var verifySubselectors_1 = createCommonjsModule(function (module, exports) {

var _interopRequireDefault = interopRequireDefault["default"];

exports.__esModule = true;
exports["default"] = verifySubselectors;

var _warning = _interopRequireDefault(warning_1);

function verify(selector, methodName, displayName) {
  if (!selector) {
    throw new Error("Unexpected value for " + methodName + " in " + displayName + ".");
  } else if (methodName === 'mapStateToProps' || methodName === 'mapDispatchToProps') {
    if (!Object.prototype.hasOwnProperty.call(selector, 'dependsOnOwnProps')) {
      (0, _warning["default"])("The selector for " + methodName + " of " + displayName + " did not specify a value for dependsOnOwnProps.");
    }
  }
}

function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps, displayName) {
  verify(mapStateToProps, 'mapStateToProps', displayName);
  verify(mapDispatchToProps, 'mapDispatchToProps', displayName);
  verify(mergeProps, 'mergeProps', displayName);
}
});

var selectorFactory = createCommonjsModule(function (module, exports) {

var _interopRequireDefault = interopRequireDefault["default"];

exports.__esModule = true;
exports["default"] = finalPropsSelectorFactory;
exports.impureFinalPropsSelectorFactory = impureFinalPropsSelectorFactory;
exports.pureFinalPropsSelectorFactory = pureFinalPropsSelectorFactory;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(objectWithoutPropertiesLoose);

var _verifySubselectors = _interopRequireDefault(verifySubselectors_1);

var _excluded = ["initMapStateToProps", "initMapDispatchToProps", "initMergeProps"];

function impureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch) {
  return function impureFinalPropsSelector(state, ownProps) {
    return mergeProps(mapStateToProps(state, ownProps), mapDispatchToProps(dispatch, ownProps), ownProps);
  };
}

function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, _ref) {
  var areStatesEqual = _ref.areStatesEqual,
      areOwnPropsEqual = _ref.areOwnPropsEqual,
      areStatePropsEqual = _ref.areStatePropsEqual;
  var hasRunAtLeastOnce = false;
  var state;
  var ownProps;
  var stateProps;
  var dispatchProps;
  var mergedProps;

  function handleFirstCall(firstState, firstOwnProps) {
    state = firstState;
    ownProps = firstOwnProps;
    stateProps = mapStateToProps(state, ownProps);
    dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    hasRunAtLeastOnce = true;
    return mergedProps;
  }

  function handleNewPropsAndNewState() {
    stateProps = mapStateToProps(state, ownProps);
    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  function handleNewProps() {
    if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);
    if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
    mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  function handleNewState() {
    var nextStateProps = mapStateToProps(state, ownProps);
    var statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
    stateProps = nextStateProps;
    if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
    return mergedProps;
  }

  function handleSubsequentCalls(nextState, nextOwnProps) {
    var propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
    var stateChanged = !areStatesEqual(nextState, state);
    state = nextState;
    ownProps = nextOwnProps;
    if (propsChanged && stateChanged) return handleNewPropsAndNewState();
    if (propsChanged) return handleNewProps();
    if (stateChanged) return handleNewState();
    return mergedProps;
  }

  return function pureFinalPropsSelector(nextState, nextOwnProps) {
    return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
  };
} // TODO: Add more comments
// If pure is true, the selector returned by selectorFactory will memoize its results,
// allowing connectAdvanced's shouldComponentUpdate to return false if final
// props have not changed. If false, the selector will always return a new
// object and shouldComponentUpdate will always return true.


function finalPropsSelectorFactory(dispatch, _ref2) {
  var initMapStateToProps = _ref2.initMapStateToProps,
      initMapDispatchToProps = _ref2.initMapDispatchToProps,
      initMergeProps = _ref2.initMergeProps,
      options = (0, _objectWithoutPropertiesLoose2["default"])(_ref2, _excluded);
  var mapStateToProps = initMapStateToProps(dispatch, options);
  var mapDispatchToProps = initMapDispatchToProps(dispatch, options);
  var mergeProps = initMergeProps(dispatch, options);

  if (process.env.NODE_ENV !== 'production') {
    (0, _verifySubselectors["default"])(mapStateToProps, mapDispatchToProps, mergeProps, options.displayName);
  }

  var selectorFactory = options.pure ? pureFinalPropsSelectorFactory : impureFinalPropsSelectorFactory;
  return selectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
}
});

var connect$1 = createCommonjsModule(function (module, exports) {

var _interopRequireDefault = interopRequireDefault["default"];

exports.__esModule = true;
exports.createConnect = createConnect;
exports["default"] = void 0;

var _extends2 = _interopRequireDefault(_extends_1);

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(objectWithoutPropertiesLoose);

var _connectAdvanced = _interopRequireDefault(connectAdvanced_1);

var _shallowEqual = _interopRequireDefault(shallowEqual_1);

var _mapDispatchToProps = _interopRequireDefault(mapDispatchToProps);

var _mapStateToProps = _interopRequireDefault(mapStateToProps);

var _mergeProps = _interopRequireDefault(mergeProps);

var _selectorFactory = _interopRequireDefault(selectorFactory);

var _excluded = ["pure", "areStatesEqual", "areOwnPropsEqual", "areStatePropsEqual", "areMergedPropsEqual"];
/*
  connect is a facade over connectAdvanced. It turns its args into a compatible
  selectorFactory, which has the signature:

    (dispatch, options) => (nextState, nextOwnProps) => nextFinalProps
  
  connect passes its args to connectAdvanced as options, which will in turn pass them to
  selectorFactory each time a Connect component instance is instantiated or hot reloaded.

  selectorFactory returns a final props selector from its mapStateToProps,
  mapStateToPropsFactories, mapDispatchToProps, mapDispatchToPropsFactories, mergeProps,
  mergePropsFactories, and pure args.

  The resulting final props selector is called by the Connect component instance whenever
  it receives new props or store state.
 */

function match(arg, factories, name) {
  for (var i = factories.length - 1; i >= 0; i--) {
    var result = factories[i](arg);
    if (result) return result;
  }

  return function (dispatch, options) {
    throw new Error("Invalid value of type " + typeof arg + " for " + name + " argument when connecting component " + options.wrappedComponentName + ".");
  };
}

function strictEqual(a, b) {
  return a === b;
} // createConnect with default args builds the 'official' connect behavior. Calling it with
// different options opens up some testing and extensibility scenarios


function createConnect(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$connectHOC = _ref.connectHOC,
      connectHOC = _ref$connectHOC === void 0 ? _connectAdvanced["default"] : _ref$connectHOC,
      _ref$mapStateToPropsF = _ref.mapStateToPropsFactories,
      mapStateToPropsFactories = _ref$mapStateToPropsF === void 0 ? _mapStateToProps["default"] : _ref$mapStateToPropsF,
      _ref$mapDispatchToPro = _ref.mapDispatchToPropsFactories,
      mapDispatchToPropsFactories = _ref$mapDispatchToPro === void 0 ? _mapDispatchToProps["default"] : _ref$mapDispatchToPro,
      _ref$mergePropsFactor = _ref.mergePropsFactories,
      mergePropsFactories = _ref$mergePropsFactor === void 0 ? _mergeProps["default"] : _ref$mergePropsFactor,
      _ref$selectorFactory = _ref.selectorFactory,
      selectorFactory = _ref$selectorFactory === void 0 ? _selectorFactory["default"] : _ref$selectorFactory;

  return function connect(mapStateToProps, mapDispatchToProps, mergeProps, _ref2) {
    if (_ref2 === void 0) {
      _ref2 = {};
    }

    var _ref3 = _ref2,
        _ref3$pure = _ref3.pure,
        pure = _ref3$pure === void 0 ? true : _ref3$pure,
        _ref3$areStatesEqual = _ref3.areStatesEqual,
        areStatesEqual = _ref3$areStatesEqual === void 0 ? strictEqual : _ref3$areStatesEqual,
        _ref3$areOwnPropsEqua = _ref3.areOwnPropsEqual,
        areOwnPropsEqual = _ref3$areOwnPropsEqua === void 0 ? _shallowEqual["default"] : _ref3$areOwnPropsEqua,
        _ref3$areStatePropsEq = _ref3.areStatePropsEqual,
        areStatePropsEqual = _ref3$areStatePropsEq === void 0 ? _shallowEqual["default"] : _ref3$areStatePropsEq,
        _ref3$areMergedPropsE = _ref3.areMergedPropsEqual,
        areMergedPropsEqual = _ref3$areMergedPropsE === void 0 ? _shallowEqual["default"] : _ref3$areMergedPropsE,
        extraOptions = (0, _objectWithoutPropertiesLoose2["default"])(_ref3, _excluded);
    var initMapStateToProps = match(mapStateToProps, mapStateToPropsFactories, 'mapStateToProps');
    var initMapDispatchToProps = match(mapDispatchToProps, mapDispatchToPropsFactories, 'mapDispatchToProps');
    var initMergeProps = match(mergeProps, mergePropsFactories, 'mergeProps');
    return connectHOC(selectorFactory, (0, _extends2["default"])({
      // used in error messages
      methodName: 'connect',
      // used to compute Connect's displayName from the wrapped component's displayName.
      getDisplayName: function getDisplayName(name) {
        return "Connect(" + name + ")";
      },
      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
      shouldHandleStateChanges: Boolean(mapStateToProps),
      // passed through to selectorFactory
      initMapStateToProps: initMapStateToProps,
      initMapDispatchToProps: initMapDispatchToProps,
      initMergeProps: initMergeProps,
      pure: pure,
      areStatesEqual: areStatesEqual,
      areOwnPropsEqual: areOwnPropsEqual,
      areStatePropsEqual: areStatePropsEqual,
      areMergedPropsEqual: areMergedPropsEqual
    }, extraOptions));
  };
}

var _default = /*#__PURE__*/createConnect();

exports["default"] = _default;
});

var useReduxContext_2 = useReduxContext;




/**
 * A hook to access the value of the `ReactReduxContext`. This is a low-level
 * hook that you should usually not need to call directly.
 *
 * @returns {any} the value of the `ReactReduxContext`
 *
 * @example
 *
 * import React from 'react'
 * import { useReduxContext } from 'react-redux'
 *
 * export const CounterComponent = ({ value }) => {
 *   const { store } = useReduxContext()
 *   return <div>{store.getState()}</div>
 * }
 */


function useReduxContext() {
  var contextValue = (0, _react.useContext)(Context.ReactReduxContext);

  if (process.env.NODE_ENV !== 'production' && !contextValue) {
    throw new Error('could not find react-redux context value; please ensure the component is wrapped in a <Provider>');
  }

  return contextValue;
}

var useReduxContext_1 = /*#__PURE__*/Object.defineProperty({
	useReduxContext: useReduxContext_2
}, '__esModule', {value: true});

var useStore_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.createStoreHook = createStoreHook;
exports.useStore = void 0;






/**
 * Hook factory, which creates a `useStore` hook bound to a given context.
 *
 * @param {React.Context} [context=ReactReduxContext] Context passed to your `<Provider>`.
 * @returns {Function} A `useStore` hook bound to the specified context.
 */


function createStoreHook(context) {
  if (context === void 0) {
    context = Context.ReactReduxContext;
  }

  var useReduxContext = context === Context.ReactReduxContext ? useReduxContext_1.useReduxContext : function () {
    return (0, _react.useContext)(context);
  };
  return function useStore() {
    var _useReduxContext = useReduxContext(),
        store = _useReduxContext.store;

    return store;
  };
}
/**
 * A hook to access the redux store.
 *
 * @returns {any} the redux store
 *
 * @example
 *
 * import React from 'react'
 * import { useStore } from 'react-redux'
 *
 * export const ExampleComponent = () => {
 *   const store = useStore()
 *   return <div>{store.getState()}</div>
 * }
 */


var useStore = /*#__PURE__*/createStoreHook();
exports.useStore = useStore;
});

var useDispatch_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.createDispatchHook = createDispatchHook;
exports.useDispatch = void 0;




/**
 * Hook factory, which creates a `useDispatch` hook bound to a given context.
 *
 * @param {React.Context} [context=ReactReduxContext] Context passed to your `<Provider>`.
 * @returns {Function} A `useDispatch` hook bound to the specified context.
 */


function createDispatchHook(context) {
  if (context === void 0) {
    context = Context.ReactReduxContext;
  }

  var useStore = context === Context.ReactReduxContext ? useStore_1.useStore : (0, useStore_1.createStoreHook)(context);
  return function useDispatch() {
    var store = useStore();
    return store.dispatch;
  };
}
/**
 * A hook to access the redux `dispatch` function.
 *
 * @returns {any|function} redux store's `dispatch` function
 *
 * @example
 *
 * import React, { useCallback } from 'react'
 * import { useDispatch } from 'react-redux'
 *
 * export const CounterComponent = ({ value }) => {
 *   const dispatch = useDispatch()
 *   const increaseCounter = useCallback(() => dispatch({ type: 'increase-counter' }), [])
 *   return (
 *     <div>
 *       <span>{value}</span>
 *       <button onClick={increaseCounter}>Increase counter</button>
 *     </div>
 *   )
 * }
 */


var useDispatch = /*#__PURE__*/createDispatchHook();
exports.useDispatch = useDispatch;
});

var useSelector_1 = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.createSelectorHook = createSelectorHook;
exports.useSelector = void 0;











var refEquality = function refEquality(a, b) {
  return a === b;
};

function useSelectorWithStoreAndSubscription(selector, equalityFn, store, contextSub) {
  var _useReducer = (0, _react.useReducer)(function (s) {
    return s + 1;
  }, 0),
      forceRender = _useReducer[1];

  var subscription = (0, _react.useMemo)(function () {
    return (0, Subscription.createSubscription)(store, contextSub);
  }, [store, contextSub]);
  var latestSubscriptionCallbackError = (0, _react.useRef)();
  var latestSelector = (0, _react.useRef)();
  var latestStoreState = (0, _react.useRef)();
  var latestSelectedState = (0, _react.useRef)();
  var storeState = store.getState();
  var selectedState;

  try {
    if (selector !== latestSelector.current || storeState !== latestStoreState.current || latestSubscriptionCallbackError.current) {
      var newSelectedState = selector(storeState); // ensure latest selected state is reused so that a custom equality function can result in identical references

      if (latestSelectedState.current === undefined || !equalityFn(newSelectedState, latestSelectedState.current)) {
        selectedState = newSelectedState;
      } else {
        selectedState = latestSelectedState.current;
      }
    } else {
      selectedState = latestSelectedState.current;
    }
  } catch (err) {
    if (latestSubscriptionCallbackError.current) {
      err.message += "\nThe error may be correlated with this previous error:\n" + latestSubscriptionCallbackError.current.stack + "\n\n";
    }

    throw err;
  }

  (0, useIsomorphicLayoutEffect_1.useIsomorphicLayoutEffect)(function () {
    latestSelector.current = selector;
    latestStoreState.current = storeState;
    latestSelectedState.current = selectedState;
    latestSubscriptionCallbackError.current = undefined;
  });
  (0, useIsomorphicLayoutEffect_1.useIsomorphicLayoutEffect)(function () {
    function checkForUpdates() {
      try {
        var newStoreState = store.getState(); // Avoid calling selector multiple times if the store's state has not changed

        if (newStoreState === latestStoreState.current) {
          return;
        }

        var _newSelectedState = latestSelector.current(newStoreState);

        if (equalityFn(_newSelectedState, latestSelectedState.current)) {
          return;
        }

        latestSelectedState.current = _newSelectedState;
        latestStoreState.current = newStoreState;
      } catch (err) {
        // we ignore all errors here, since when the component
        // is re-rendered, the selectors are called again, and
        // will throw again, if neither props nor store state
        // changed
        latestSubscriptionCallbackError.current = err;
      }

      forceRender();
    }

    subscription.onStateChange = checkForUpdates;
    subscription.trySubscribe();
    checkForUpdates();
    return function () {
      return subscription.tryUnsubscribe();
    };
  }, [store, subscription]);
  return selectedState;
}
/**
 * Hook factory, which creates a `useSelector` hook bound to a given context.
 *
 * @param {React.Context} [context=ReactReduxContext] Context passed to your `<Provider>`.
 * @returns {Function} A `useSelector` hook bound to the specified context.
 */


function createSelectorHook(context) {
  if (context === void 0) {
    context = Context.ReactReduxContext;
  }

  var useReduxContext = context === Context.ReactReduxContext ? useReduxContext_1.useReduxContext : function () {
    return (0, _react.useContext)(context);
  };
  return function useSelector(selector, equalityFn) {
    if (equalityFn === void 0) {
      equalityFn = refEquality;
    }

    if (process.env.NODE_ENV !== 'production') {
      if (!selector) {
        throw new Error("You must pass a selector to useSelector");
      }

      if (typeof selector !== 'function') {
        throw new Error("You must pass a function as a selector to useSelector");
      }

      if (typeof equalityFn !== 'function') {
        throw new Error("You must pass a function as an equality function to useSelector");
      }
    }

    var _useReduxContext = useReduxContext(),
        store = _useReduxContext.store,
        contextSub = _useReduxContext.subscription;

    var selectedState = useSelectorWithStoreAndSubscription(selector, equalityFn, store, contextSub);
    (0, _react.useDebugValue)(selectedState);
    return selectedState;
  };
}
/**
 * A hook to access the redux store's state. This hook takes a selector function
 * as an argument. The selector is called with the store state.
 *
 * This hook takes an optional equality comparison function as the second parameter
 * that allows you to customize the way the selected state is compared to determine
 * whether the component needs to be re-rendered.
 *
 * @param {Function} selector the selector function
 * @param {Function=} equalityFn the function that will be used to determine equality
 *
 * @returns {any} the selected state
 *
 * @example
 *
 * import React from 'react'
 * import { useSelector } from 'react-redux'
 *
 * export const CounterComponent = () => {
 *   const counter = useSelector(state => state.counter)
 *   return <div>{counter}</div>
 * }
 */


var useSelector = /*#__PURE__*/createSelectorHook();
exports.useSelector = useSelector;
});

var _interopRequireDefault = interopRequireDefault["default"];



var _Provider = _interopRequireDefault(Provider_1);

var Provider = _Provider["default"];

var _connectAdvanced = _interopRequireDefault(connectAdvanced_1);

var connectAdvanced = _connectAdvanced["default"];



var ReactReduxContext = Context.ReactReduxContext;

var _connect = _interopRequireDefault(connect$1);

var connect = _connect["default"];



var useDispatch = useDispatch_1.useDispatch;
var createDispatchHook = useDispatch_1.createDispatchHook;



var useSelector = useSelector_1.useSelector;
var createSelectorHook = useSelector_1.createSelectorHook;



var useStore = useStore_1.useStore;
var createStoreHook = useStore_1.createStoreHook;

var _shallowEqual = _interopRequireDefault(shallowEqual_1);

var shallowEqual = _shallowEqual["default"];

var exports = /*#__PURE__*/Object.defineProperty({
	Provider: Provider,
	connectAdvanced: connectAdvanced,
	ReactReduxContext: ReactReduxContext,
	connect: connect,
	useDispatch: useDispatch,
	createDispatchHook: createDispatchHook,
	useSelector: useSelector,
	createSelectorHook: createSelectorHook,
	useStore: useStore,
	createStoreHook: createStoreHook,
	shallowEqual: shallowEqual
}, '__esModule', {value: true});

var reactBatchedUpdates = createCommonjsModule(function (module, exports) {

exports.__esModule = true;
exports.unstable_batchedUpdates = void 0;



exports.unstable_batchedUpdates = _reactDom.unstable_batchedUpdates;
});

var lib = createCommonjsModule(function (module, exports$1) {

exports$1.__esModule = true;
var _exportNames = {
  batch: true
};



Object.keys(exports).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports$1 && exports$1[key] === exports[key]) return;
  exports$1[key] = exports[key];
});



exports$1.batch = reactBatchedUpdates.unstable_batchedUpdates;

 // Enable batched updates in our subscriptions for use
// with standard React renderers (ReactDOM, React Native)


(0, batch_1.setBatch)(reactBatchedUpdates.unstable_batchedUpdates);
});

function connectRedux(mapStateToProps, options) {
  return function (component) {
    return exportView(lib.connect(mapStateToProps, options)(component));
  };
}
setCoreConfig({
  UseStore: lib.useStore,
  StoreProvider: lib.Provider
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

setReactComponentsConfig({
  hydrate: hydrate,
  render: render,
  renderToString: renderToString
});
var cientSingleton = undefined;
function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  var router = createClientRouter();
  cientSingleton = {
    render: function render() {
      return Promise.resolve();
    }
  };
  var _ref = env.location,
      pathname = _ref.pathname,
      search = _ref.search,
      hash = _ref.hash;
  return buildApp({}, router, {
    url: [pathname, search, hash].join('')
  });
}
function createSSR(appConfig, routerOptions) {
  var router = createServerRouter();
  return buildSSR({}, router, routerOptions);
}

var createSelectorHook$1 = lib.createSelectorHook;
var shallowEqual$1 = lib.shallowEqual;
var useSelector$1 = lib.useSelector;
export { BaseModel, DocumentHead, Else, EmptyModel, ErrorCodes, Link, Switch, connectRedux, createApp, createSSR, createSelectorHook$1 as createSelectorHook, deepMerge, effect, effectLogger, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isServer, locationToNativeLocation, locationToUrl, modelHotReplacement, moduleExists, nativeLocationToLocation, nativeUrlToUrl, patchActions, reducer, setConfig, setLoading, shallowEqual$1 as shallowEqual, urlToLocation, urlToNativeUrl, useSelector$1 as useSelector };
