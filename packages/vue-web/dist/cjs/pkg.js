'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vue = require('vue');

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
  return function (config) {
    return Object.keys(data).forEach(function (key) {
      config[key] !== undefined && (data[key] = config[key]);
    });
  };
}
var SingleDispatcher = function () {
  function SingleDispatcher() {
    _defineProperty(this, "listenerId", 0);

    _defineProperty(this, "listenerMap", {});
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
var MultipleDispatcher = function () {
  function MultipleDispatcher() {
    _defineProperty(this, "listenerId", 0);

    _defineProperty(this, "listenerMap", {});
  }

  var _proto2 = MultipleDispatcher.prototype;

  _proto2.addListener = function addListener(name, callback) {
    this.listenerId++;
    var id = "" + this.listenerId;

    if (!this.listenerMap[name]) {
      this.listenerMap[name] = {};
    }

    var listenerMap = this.listenerMap[name];
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto2.dispatch = function dispatch(name, data) {
    var listenerMap = this.listenerMap[name];

    if (listenerMap) {
      var hasPromise = false;
      var arr = Object.keys(listenerMap).map(function (id) {
        var result = listenerMap[id](data);

        if (!hasPromise && isPromise(result)) {
          hasPromise = true;
        }

        return result;
      });
      return hasPromise ? Promise.all(arr) : undefined;
    }
  };

  return MultipleDispatcher;
}();

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
function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}
function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}
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

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

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

var coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  RouteModuleName: '',
  AppModuleName: 'stage'
};
var setCoreConfig = buildConfigSetter(coreConfig);
exports.LoadingState = void 0;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(exports.LoadingState || (exports.LoadingState = {}));

var RouteHistoryAction;

(function (RouteHistoryAction) {
  RouteHistoryAction["PUSH"] = "PUSH";
  RouteHistoryAction["BACK"] = "BACK";
  RouteHistoryAction["REPLACE"] = "REPLACE";
  RouteHistoryAction["RELAUNCH"] = "RELAUNCH";
})(RouteHistoryAction || (RouteHistoryAction = {}));

function isEluxComponent(data) {
  return data['__elux_component__'];
}
var TaskCounter = function (_SingleDispatcher) {
  _inheritsLoose(TaskCounter, _SingleDispatcher);

  function TaskCounter(deferSecond) {
    var _this;

    _this = _SingleDispatcher.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "list", []);

    _defineProperty(_assertThisInitialized(_this), "ctimer", 0);

    _this.deferSecond = deferSecond;
    return _this;
  }

  var _proto = TaskCounter.prototype;

  _proto.addItem = function addItem(promise, note) {
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
        this.dispatch(exports.LoadingState.Start);
        this.ctimer = env.setTimeout(function () {
          _this2.ctimer = 0;

          if (_this2.list.length > 0) {
            _this2.dispatch(exports.LoadingState.Depth);
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  };

  _proto.completeItem = function completeItem(promise) {
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

        this.dispatch(exports.LoadingState.Stop);
      }
    }

    return this;
  };

  return TaskCounter;
}(SingleDispatcher);
var MetaData = {
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
function isServer() {
  return env.isServer;
}

var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteTestChange: 'RouteTestChange',
  MRouteBeforeChange: 'RouteBeforeChange',
  MRouteChange: 'RouteChange',
  Error: "Elux" + coreConfig.NSP + "Error"
};
function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}
function routeChangeAction(routeState) {
  return {
    type: "" + coreConfig.RouteModuleName + coreConfig.NSP + ActionTypes.MRouteChange,
    payload: [routeState]
  };
}
function routeBeforeChangeAction(routeState) {
  return {
    type: "" + coreConfig.RouteModuleName + coreConfig.NSP + ActionTypes.MRouteBeforeChange,
    payload: [routeState]
  };
}
function routeTestChangeAction(routeState) {
  return {
    type: "" + coreConfig.RouteModuleName + coreConfig.NSP + ActionTypes.MRouteTestChange,
    payload: [routeState]
  };
}
function moduleInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + coreConfig.NSP + ActionTypes.MInit,
    payload: [initState]
  };
}
function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: "" + moduleName + coreConfig.NSP + ActionTypes.MLoading,
    payload: [loadingState]
  };
}
function moduleRouteChangeAction(moduleName, params, action) {
  return {
    type: "" + moduleName + coreConfig.NSP + ActionTypes.MRouteChange,
    payload: [params, action]
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
  if (loadingKey === void 0) {
    loadingKey = 'stage.loading.global';
  }

  var loadingForModuleName;
  var loadingForGroupName;

  if (loadingKey !== null) {
    var _loadingKey$split = loadingKey.split('.');

    loadingForModuleName = _loadingKey$split[0];
    loadingForGroupName = _loadingKey$split[2];
  }

  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForModuleName && loadingForGroupName && !env.isServer) {
      var injectLoading = function injectLoading(curAction, promiseResult) {
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
function setLoading(item, store, moduleName, groupName) {
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

function createRedux(initState) {
  var currentState = initState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function getState(moduleName) {
    if (isDispatching) {
      throw new Error('You may not call store.getState() while the reducer is executing. ');
    }

    var result = moduleName ? currentState[moduleName] : currentState;
    return result;
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    if (isDispatching) {
      throw new Error('You may not call store.subscribe() while the reducer is executing.');
    }

    var isSubscribed = true;
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
      var index = nextListeners.indexOf(listener);
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

    var listeners = currentListeners = nextListeners;

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }

    return action;
  }

  function update(actionName, state) {
    dispatch({
      type: actionName,
      state: state
    });
  }

  return {
    update: update,
    subscribe: subscribe,
    getState: getState
  };
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
var devLogger = function devLogger(_ref2, actionName, payload, priority, handers, state, effect) {
  var id = _ref2.id,
      isActive = _ref2.isActive;

  if (reduxDevTools) {
    var type = [actionName, " (" + (isActive ? '' : '*') + id + ")"].join('');
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

function getModule(moduleName) {
  if (MetaData.moduleCaches[moduleName]) {
    return MetaData.moduleCaches[moduleName];
  }

  var moduleOrPromise = MetaData.moduleGetter[moduleName]();

  if (isPromise(moduleOrPromise)) {
    var promiseModule = moduleOrPromise.then(function (_ref) {
      var module = _ref.default;
      MetaData.moduleCaches[moduleName] = module;
      return module;
    }, function (reason) {
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

  var list = moduleNames.map(function (moduleName) {
    if (MetaData.moduleCaches[moduleName]) {
      return MetaData.moduleCaches[moduleName];
    }

    return getModule(moduleName);
  });

  if (list.some(function (item) {
    return isPromise(item);
  })) {
    return Promise.all(list);
  } else {
    return list;
  }
}
function getComponent(moduleName, componentName) {
  var key = [moduleName, componentName].join(coreConfig.NSP);

  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key];
  }

  var moduleCallback = function moduleCallback(module) {
    var componentOrFun = module.components[componentName];

    if (isEluxComponent(componentOrFun)) {
      var component = componentOrFun;
      MetaData.componentCaches[key] = component;
      return component;
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
function getComponentList(keys) {
  if (keys.length < 1) {
    return Promise.resolve([]);
  }

  return Promise.all(keys.map(function (key) {
    if (MetaData.componentCaches[key]) {
      return MetaData.componentCaches[key];
    }

    var _key$split = key.split(coreConfig.NSP),
        moduleName = _key$split[0],
        componentName = _key$split[1];

    return getComponent(moduleName, componentName);
  }));
}
function loadModel(moduleName, store) {
  var moduleOrPromise = getModule(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      return module.initModel(store);
    });
  }

  return moduleOrPromise.initModel(store);
}
function loadComponent$1(moduleName, componentName, store, deps) {
  var promiseOrComponent = getComponent(moduleName, componentName);

  var callback = function callback(component) {
    if (component.__elux_component__ === 'view' && !store.injectedModules[moduleName]) {
      if (env.isServer) {
        return null;
      }

      var module = getModule(moduleName);
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
  MetaData.moduleExists = Object.keys(moduleGetter).reduce(function (data, moduleName) {
    data[moduleName] = true;
    return data;
  }, {});
}

var routeMiddleware = function routeMiddleware(_ref) {
  var dispatch = _ref.dispatch,
      getStore = _ref.getStore;
  return function (next) {
    return function (action) {
      if (action.type === "" + coreConfig.RouteModuleName + coreConfig.NSP + ActionTypes.MRouteChange) {
        var existsModules = Object.keys(getStore().getState()).reduce(function (obj, moduleName) {
          obj[moduleName] = true;
          return obj;
        }, {});
        var result = next(action);
        var _ref2 = action.payload,
            routeState = _ref2[0];
        Object.keys(routeState.params).forEach(function (moduleName) {
          var moduleState = routeState.params[moduleName];

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
  };
};
function forkStore(originalStore, newRouteState) {
  var _createStore;

  var sid = originalStore.sid,
      _originalStore$option = originalStore.options,
      initState = _originalStore$option.initState,
      middlewares = _originalStore$option.middlewares,
      logger = _originalStore$option.logger,
      router = originalStore.router;
  return createStore(sid + 1, router, (_createStore = {}, _createStore[coreConfig.RouteModuleName] = newRouteState, _createStore), initState, middlewares, logger);
}

var preMiddleware = function preMiddleware(_ref3) {
  var getStore = _ref3.getStore;
  return function (next) {
    return function (action) {
      if (action.type === ActionTypes.Error) {
        var actionData = getActionData(action);

        if (isProcessedError(actionData[0])) {
          return undefined;
        }

        actionData[0] = setProcessedError(actionData[0], true);
      }

      var _action$type$split = action.type.split(coreConfig.NSP),
          moduleName = _action$type$split[0],
          actionName = _action$type$split[1];

      if (env.isServer && actionName === ActionTypes.MLoading) {
        return undefined;
      }

      if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
        var store = getStore();

        if (!store.injectedModules[moduleName]) {
          var result = loadModel(moduleName, store);

          if (isPromise(result)) {
            return result.then(function () {
              return next(action);
            });
          }
        }
      }

      return next(action);
    };
  };
};

function createStore(sid, router, data, initState, middlewares, logger) {
  var redux = createRedux(initState(data));
  var getState = redux.getState,
      subscribe = redux.subscribe,
      _update = redux.update;

  var getRouteParams = function getRouteParams(moduleName) {
    var routeState = getState(coreConfig.RouteModuleName);
    return moduleName ? routeState.params[moduleName] : routeState.params;
  };

  var options = {
    initState: initState,
    logger: logger,
    middlewares: middlewares
  };
  var loadingGroups = {};
  var injectedModules = {};
  var refData = {
    currentActionName: '',
    uncommittedState: {},
    isActive: false
  };

  var isActive = function isActive() {
    return refData.isActive;
  };

  var setActive = function setActive(status) {
    if (refData.isActive !== status) {
      refData.isActive = status;
    }
  };

  var getCurrentActionName = function getCurrentActionName() {
    return refData.currentActionName;
  };

  var getUncommittedState = function getUncommittedState(moduleName) {
    var state = refData.uncommittedState;
    return moduleName ? state[moduleName] : state;
  };

  var destroy = function destroy() {
    Object.keys(injectedModules).forEach(function (moduleName) {
      injectedModules[moduleName].destroy();
    });
  };

  var update = function update(actionName, state) {
    _update(actionName, state);

    router.latestState = _extends({}, router.latestState, state);
  };

  var _dispatch2 = function dispatch(action) {
    throw new Error('Dispatching while constructing your middleware is not allowed. ');
  };

  function applyEffect(moduleName, handler, modelInstance, action, actionData) {
    var effectResult = handler.apply(modelInstance, actionData);
    var decorators = handler.__decorators__;

    if (decorators) {
      var results = [];
      decorators.forEach(function (decorator, index) {
        results[index] = decorator[0].call(modelInstance, action, effectResult);
      });
      handler.__decoratorResults__ = results;
    }

    return effectResult.then(function (reslove) {
      if (decorators) {
        var _results = handler.__decoratorResults__ || [];

        decorators.forEach(function (decorator, index) {
          if (decorator[1]) {
            decorator[1].call(modelInstance, 'Resolved', _results[index], reslove);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      return reslove;
    }, function (error) {
      if (decorators) {
        var _results2 = handler.__decoratorResults__ || [];

        decorators.forEach(function (decorator, index) {
          if (decorator[1]) {
            decorator[1].call(modelInstance, 'Rejected', _results2[index], error);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      if (isProcessedError(error)) {
        throw error;
      } else {
        return _dispatch2(errorAction(setProcessedError(error, false)));
      }
    });
  }

  function respondHandler(action, isReducer) {
    var logs;
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

    if (handlerModuleNames.length > 0) {
      var orderList = [];
      handlerModuleNames.forEach(function (moduleName) {
        if (moduleName === coreConfig.AppModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });
      orderList.unshift.apply(orderList, actionPriority);
      var implemented = {};

      if (isReducer) {
        var prevState = getState();
        var newState = {};

        var uncommittedState = _extends({}, prevState);

        refData.uncommittedState = uncommittedState;
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = injectedModules[moduleName];
            var result = handler.apply(modelInstance, actionData);

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
        devLogger.apply(void 0, logs);
        logger && logger.apply(void 0, logs);
        update(actionName, newState);
      } else {
        logs = [{
          id: sid,
          isActive: refData.isActive
        }, actionName, actionData, actionPriority, orderList, getState(), true];
        devLogger.apply(void 0, logs);
        logger && logger.apply(void 0, logs);
        var result = [];
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = injectedModules[moduleName];
            refData.currentActionName = actionName;
            result.push(applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        var task = result.length === 1 ? result[0] : Promise.all(result);
        return task;
      }
    }

    return undefined;
  }

  function _dispatch(action) {
    respondHandler(action, true);
    return respondHandler(action, false);
  }

  var middlewareAPI = {
    getStore: function getStore() {
      return store;
    },
    dispatch: function dispatch(action) {
      return _dispatch2(action);
    }
  };
  var chain = [preMiddleware, routeMiddleware].concat(middlewares || []).map(function (middleware) {
    return middleware(middlewareAPI);
  });
  _dispatch2 = compose.apply(void 0, chain)(_dispatch);
  var store = {
    sid: sid,
    getState: getState,
    getRouteParams: getRouteParams,
    subscribe: subscribe,
    dispatch: _dispatch2,
    router: router,
    loadingGroups: loadingGroups,
    injectedModules: injectedModules,
    destroy: destroy,
    getCurrentActionName: getCurrentActionName,
    getUncommittedState: getUncommittedState,
    update: update,
    isActive: isActive,
    setActive: setActive,
    options: options
  };
  return store;
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
  var store = _store;

  if (!store.injectedModules[moduleName]) {
    var latestState = store.router.latestState;
    var preState = store.getState();
    var model = new ModelClass(moduleName, store);
    var initState = model.init(latestState, preState) || {};
    store.injectedModules[moduleName] = model;
    return store.dispatch(moduleInitAction(moduleName, coreConfig.MutableData ? deepClone(initState) : initState));
  }

  return undefined;
}

function baseExportModule(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(function (key) {
    var component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn("The exported component must implement interface EluxComponent: " + moduleName + "." + key);
    }
  });
  var model = new ModelClass(moduleName, null);
  injectActions(moduleName, model);
  return {
    moduleName: moduleName,
    initModel: initModel.bind(null, moduleName, ModelClass),
    state: {},
    actions: {},
    components: components,
    routeParams: model.defaultRouteParams,
    data: data
  };
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

function injectActions(moduleName, model, hmr) {
  var handlers = model;
  var injectedModules = MetaData.injectedModules;

  if (injectedModules[moduleName]) {
    return;
  }

  injectedModules[moduleName] = true;

  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          actionNames.split(coreConfig.MSP).forEach(function (actionName) {
            actionName = actionName.trim().replace(new RegExp("^this[" + coreConfig.NSP + "]"), "" + moduleName + coreConfig.NSP);
            var arr = actionName.split(coreConfig.NSP);

            if (arr[1]) {
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
            } else {
              transformAction(moduleName + coreConfig.NSP + actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
            }
          });
        }
      })();
    }
  }
}
function modelHotReplacement(moduleName, ModelClass) {
  var moduleCache = MetaData.moduleCaches[moduleName];

  if (moduleCache && moduleCache['initModel']) {
    moduleCache.initModel = initModel.bind(null, moduleName, ModelClass);
  }

  if (MetaData.injectedModules[moduleName]) {
    MetaData.injectedModules[moduleName] = false;
    var model = new ModelClass(moduleName, null);
    injectActions(moduleName, model, true);
  }

  var stores = MetaData.currentRouter.getStoreList();
  stores.forEach(function (store) {
    if (store.injectedModules[moduleName]) {
      var _model = new ModelClass(moduleName, store);

      store.injectedModules[moduleName] = _model;
    }
  });
  env.console.log("[HMR] @medux Updated model: " + moduleName);
}
function getModuleMap(data) {
  if (!MetaData.moduleMap) {
    if (data) {
      MetaData.moduleMap = Object.keys(data).reduce(function (prev, moduleName) {
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
      MetaData.moduleMap = new Proxy({}, {
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

  return MetaData.moduleMap;
}
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
var EmptyModel = function () {
  function EmptyModel(moduleName, store) {
    _defineProperty(this, "initState", {});

    _defineProperty(this, "defaultRouteParams", {});

    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = EmptyModel.prototype;

  _proto.init = function init() {
    return {};
  };

  _proto.destroy = function destroy() {
    return;
  };

  return EmptyModel;
}();
var RouteModel = _decorate(null, function (_initialize) {
  var RouteModel = function RouteModel(moduleName, store) {
    _initialize(this);

    this.moduleName = moduleName;
    this.store = store;
  };

  return {
    F: RouteModel,
    d: [{
      kind: "field",
      key: "defaultRouteParams",
      value: function value() {
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
      value: function value(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: ActionTypes.MRouteChange,
      value: function value(routeState) {
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
var BaseModel = _decorate(null, function (_initialize) {
  var BaseModel = function BaseModel(moduleName, store) {
    _initialize(this);

    this.moduleName = moduleName;
    this.store = store;
  };

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
      value: function value(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: ActionTypes.MLoading,
      value: function value(payload) {
        var state = this.getState();
        var loading = mergeState(state.loading, payload);
        return mergeState(state, {
          loading: loading
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

function initApp(router, data, initState, middlewares, storeLogger, appViewName, preloadComponents) {
  if (preloadComponents === void 0) {
    preloadComponents = [];
  }

  MetaData.currentRouter = router;
  var store = createStore(0, router, data, initState, middlewares, storeLogger);
  router.startup(store);
  var AppModuleName = coreConfig.AppModuleName,
      RouteModuleName = coreConfig.RouteModuleName;
  var moduleGetter = MetaData.moduleGetter;
  var appModule = getModule(AppModuleName);
  var routeModule = getModule(RouteModuleName);
  var AppView = appViewName ? getComponent(AppModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  var preloadModules = Object.keys(router.routeState.params).concat(Object.keys(store.getState())).reduce(function (data, moduleName) {
    if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
      data[moduleName] = true;
    }

    return data;
  }, {});
  var results = Promise.all([getModuleList(Object.keys(preloadModules)), getComponentList(preloadComponents), routeModule.initModel(store), appModule.initModel(store)]);
  var setup;

  if (env.isServer) {
    setup = results.then(function (_ref) {
      var modules = _ref[0];
      return Promise.all(modules.map(function (mod) {
        return mod.initModel(store);
      }));
    });
  } else {
    setup = results;
  }

  return {
    store: store,
    AppView: AppView,
    setup: setup
  };
}
function reinitApp(store) {
  var moduleGetter = MetaData.moduleGetter;
  var preloadModules = Object.keys(store.router.routeState.params).filter(function (moduleName) {
    return moduleGetter[moduleName] && moduleName !== AppModuleName;
  });
  var AppModuleName = coreConfig.AppModuleName,
      RouteModuleName = coreConfig.RouteModuleName;
  var appModule = getModule(AppModuleName);
  var routeModule = getModule(RouteModuleName);
  return Promise.all([getModuleList(preloadModules), routeModule.initModel(store), appModule.initModel(store)]);
}

var vueComponentsConfig = {
  setPageTitle: function setPageTitle(title) {
    return env.document.title = title;
  },
  Provider: null,
  LoadComponentOnError: function LoadComponentOnError(_ref) {
    var message = _ref.message;
    return vue.createVNode("div", {
      "class": "g-component-error"
    }, [message]);
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return vue.createVNode("div", {
      "class": "g-component-loading"
    }, [vue.createTextVNode("loading...")]);
  }
};
var setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);
var EluxContextKey = '__EluxContext__';
var EluxStoreContextKey = '__EluxStoreContext__';
function useRouter() {
  var _inject = vue.inject(EluxContextKey, {
    documentHead: ''
  }),
      router = _inject.router;

  return router;
}
function useStore() {
  var _inject2 = vue.inject(EluxStoreContextKey, {}),
      store = _inject2.store;

  return store;
}

var clientTimer = 0;

function setClientHead(eluxContext, documentHead) {
  eluxContext.documentHead = documentHead;

  if (!clientTimer) {
    clientTimer = env.setTimeout(function () {
      clientTimer = 0;
      var arr = eluxContext.documentHead.match(/<title>(.*)<\/title>/) || [];

      if (arr[1]) {
        env.document.title = arr[1];
      }
    }, 0);
  }
}

var DocumentHead = vue.defineComponent({
  props: {
    title: {
      type: String
    },
    html: {
      type: String
    }
  },
  data: function data() {
    return {
      eluxContext: vue.inject(EluxContextKey, {
        documentHead: ''
      }),
      raw: ''
    };
  },
  computed: {
    headText: function headText() {
      var title = this.title || '';
      var html = this.html || '';
      var eluxContext = this.eluxContext;

      if (!html) {
        html = eluxContext.documentHead || '<title>Elux</title>';
      }

      if (title) {
        return html.replace(/<title>.*?<\/title>/, "<title>" + title + "</title>");
      }

      return html;
    }
  },
  mounted: function mounted() {
    this.raw = this.eluxContext.documentHead;
    setClientHead(this.eluxContext, this.headText);
  },
  unmounted: function unmounted() {
    setClientHead(this.eluxContext, this.raw);
  },
  render: function render() {
    if (isServer()) {
      this.eluxContext.documentHead = this.headText;
    }

    return null;
  }
});

var Switch = function Switch(props, context) {
  var arr = [];
  var children = context.slots.default ? context.slots.default() : [];
  children.forEach(function (item) {
    if (item.type !== vue.Comment) {
      arr.push(item);
    }
  });

  if (arr.length > 0) {
    return vue.h(vue.Fragment, null, [arr[0]]);
  }

  return vue.h(vue.Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
};

var Else = function Else(props, context) {
  var arr = [];
  var children = context.slots.default ? context.slots.default() : [];
  children.forEach(function (item) {
    if (item.type !== vue.Comment) {
      arr.push(item);
    }
  });

  if (arr.length > 0) {
    return vue.h(vue.Fragment, null, arr);
  }

  return vue.h(vue.Fragment, null, props.elseView ? [props.elseView] : context.slots.elseView ? context.slots.elseView() : []);
};

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

var _excluded = ["onClick", "disabled", "href", "route", "action", "root"];
var Link = function Link(_ref, context) {
  var _onClick = _ref.onClick,
      disabled = _ref.disabled,
      href = _ref.href,
      route = _ref.route,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      root = _ref.root,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  var _inject = vue.inject(EluxContextKey, {
    documentHead: ''
  }),
      router = _inject.router;

  var onClick = function onClick(event) {
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
    return vue.h('a', props, context.slots.default());
  } else {
    return vue.h('div', props, context.slots.default());
  }
};

var loadComponent = function loadComponent(moduleName, componentName, options) {
  if (options === void 0) {
    options = {};
  }

  var loadingComponent = options.OnLoading || vueComponentsConfig.LoadComponentOnLoading;
  var errorComponent = options.OnError || vueComponentsConfig.LoadComponentOnError;

  var component = function component(props, context) {
    var _inject = vue.inject(EluxContextKey, {
      documentHead: ''
    }),
        deps = _inject.deps;

    var _inject2 = vue.inject(EluxStoreContextKey, {
      store: null
    }),
        store = _inject2.store;

    var result;
    var errorMessage = '';

    try {
      result = loadComponent$1(moduleName, componentName, store, deps || {});
    } catch (e) {
      env.console.error(e);
      errorMessage = e.message || "" + e;
    }

    if (result !== undefined) {
      if (result === null) {
        return vue.h(loadingComponent);
      }

      if (isPromise(result)) {
        return vue.h(vue.defineAsyncComponent({
          loader: function loader() {
            return result;
          },
          errorComponent: errorComponent,
          loadingComponent: loadingComponent
        }), props, context.slots);
      }

      return vue.h(result, props, context.slots);
    }

    return vue.h(errorComponent, null, errorMessage);
  };

  return component;
};

var StageView;
var EWindow = vue.defineComponent({
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
  setup: function setup(props) {
    var storeContext = {
      store: props.store
    };
    vue.provide(EluxStoreContextKey, storeContext);
    return function () {
      return vue.h(props.view, null);
    };
  }
});
var Router = vue.defineComponent({
  setup: function setup() {
    var _inject = vue.inject(EluxContextKey, {
      documentHead: ''
    }),
        router = _inject.router;

    var data = vue.shallowRef({
      classname: 'elux-app',
      pages: router.getCurrentPages().reverse()
    });
    var containerRef = vue.ref({
      className: ''
    });
    var removeListener = router.addListener('change', function (_ref) {
      var routeState = _ref.routeState,
          root = _ref.root;

      if (root) {
        var pages = router.getCurrentPages().reverse();
        var completeCallback;

        if (routeState.action === 'PUSH') {
          var completePromise = new Promise(function (resolve) {
            completeCallback = resolve;
          });
          data.value = {
            classname: 'elux-app elux-animation elux-change elux-push ' + Date.now(),
            pages: pages
          };
          env.setTimeout(function () {
            containerRef.value.className = 'elux-app elux-animation';
          }, 100);
          env.setTimeout(function () {
            containerRef.value.className = 'elux-app';
            completeCallback();
          }, 400);
          return completePromise;
        } else if (routeState.action === 'BACK') {
          var _completePromise = new Promise(function (resolve) {
            completeCallback = resolve;
          });

          data.value = {
            classname: 'elux-app ' + Date.now(),
            pages: [].concat(pages, [data.value.pages[data.value.pages.length - 1]])
          };
          env.setTimeout(function () {
            containerRef.value.className = 'elux-app elux-animation elux-change elux-back';
          }, 100);
          env.setTimeout(function () {
            data.value = {
              classname: 'elux-app ' + Date.now(),
              pages: pages
            };
            completeCallback();
          }, 400);
          return _completePromise;
        } else if (routeState.action === 'RELAUNCH') {
          data.value = {
            classname: 'elux-app ' + Date.now(),
            pages: pages
          };
        }
      }

      return;
    });
    vue.onBeforeUnmount(function () {
      removeListener();
    });
    return function () {
      var _data$value = data.value,
          classname = _data$value.classname,
          pages = _data$value.pages;
      return vue.createVNode("div", {
        "ref": containerRef,
        "class": classname
      }, [pages.map(function (item) {
        var store = item.store,
            pagename = item.pagename;
        return vue.createVNode("div", {
          "key": store.sid,
          "data-sid": store.sid,
          "class": "elux-window",
          "data-pagename": pagename
        }, [vue.createVNode(EWindow, {
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

  app.mount("#" + id);
}
function renderToString(id, APPView, eluxContext, app, store) {
  StageView = APPView;
  app.provide(EluxContextKey, eluxContext);

  var htmlPromise = require('@vue/server-renderer').renderToString(app);

  return htmlPromise;
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

var routeConfig = {
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
var setRouteConfig = buildConfigSetter(routeConfig);
var routeMeta = {
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

  var args = {};

  try {
    args = JSON.parse(json);
  } catch (error) {
    args = {};
  }

  return args;
}

var HistoryStack = function () {
  function HistoryStack(limit) {
    _defineProperty(this, "records", []);

    this.limit = limit;
  }

  var _proto = HistoryStack.prototype;

  _proto.startup = function startup(record) {
    var oItem = this.records[0];
    this.records = [record];
    this.setActive(oItem);
  };

  _proto.getCurrentItem = function getCurrentItem() {
    return this.records[0];
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

  _proto._push = function _push(item) {
    var records = this.records;
    var oItem = records[0];
    records.unshift(item);
    var delItem = records.splice(this.limit)[0];

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }

    this.setActive(oItem);
  };

  _proto._replace = function _replace(item) {
    var records = this.records;
    var delItem = records[0];
    records[0] = item;

    if (delItem && delItem !== item && delItem.destroy) {
      delItem.destroy();
    }

    this.setActive(delItem);
  };

  _proto._relaunch = function _relaunch(item) {
    var delList = this.records;
    var oItem = delList[0];
    this.records = [item];
    delList.forEach(function (delItem) {
      if (delItem !== item && delItem.destroy) {
        delItem.destroy();
      }
    });
    this.setActive(oItem);
  };

  _proto.back = function back(delta) {
    var oItem = this.records[0];
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
    this.setActive(oItem);
  };

  _proto.setActive = function setActive(oItem) {
    var _this$records$;

    var oStore = oItem == null ? void 0 : oItem.store;
    var store = (_this$records$ = this.records[0]) == null ? void 0 : _this$records$.store;

    if (store === oStore) {
      store == null ? void 0 : store.setActive(true);
    } else {
      oStore == null ? void 0 : oStore.setActive(false);
      store == null ? void 0 : store.setActive(true);
    }
  };

  return HistoryStack;
}();

var RouteRecord = function RouteRecord(location, pageStack) {
  _defineProperty(this, "destroy", void 0);

  _defineProperty(this, "key", void 0);

  _defineProperty(this, "recordKey", void 0);

  this.location = location;
  this.pageStack = pageStack;
  this.recordKey = env.isServer ? '0' : ++RouteRecord.id + '';
  this.key = [pageStack.stackkey, this.recordKey].join('-');
};

_defineProperty(RouteRecord, "id", 0);

var PageStack = function (_HistoryStack) {
  _inheritsLoose(PageStack, _HistoryStack);

  function PageStack(windowStack, store) {
    var _this;

    _this = _HistoryStack.call(this, 20) || this;

    _defineProperty(_assertThisInitialized(_this), "stackkey", void 0);

    _this.windowStack = windowStack;
    _this.store = store;
    _this.stackkey = env.isServer ? '0' : ++PageStack.id + '';
    return _this;
  }

  var _proto2 = PageStack.prototype;

  _proto2.push = function push(location) {
    var newRecord = new RouteRecord(location, this);

    this._push(newRecord);

    return newRecord;
  };

  _proto2.replace = function replace(location) {
    var newRecord = new RouteRecord(location, this);

    this._replace(newRecord);

    return newRecord;
  };

  _proto2.relaunch = function relaunch(location) {
    var newRecord = new RouteRecord(location, this);

    this._relaunch(newRecord);

    return newRecord;
  };

  _proto2.findRecordByKey = function findRecordByKey(recordKey) {
    for (var i = 0, k = this.records.length; i < k; i++) {
      var item = this.records[i];

      if (item.recordKey === recordKey) {
        return [item, i];
      }
    }

    return undefined;
  };

  _proto2.destroy = function destroy() {
    this.store.destroy();
  };

  return PageStack;
}(HistoryStack);

_defineProperty(PageStack, "id", 0);

var WindowStack = function (_HistoryStack2) {
  _inheritsLoose(WindowStack, _HistoryStack2);

  function WindowStack() {
    return _HistoryStack2.call(this, routeConfig.maxHistory) || this;
  }

  var _proto3 = WindowStack.prototype;

  _proto3.getCurrentPages = function getCurrentPages() {
    return this.records.map(function (item) {
      var store = item.store;
      var record = item.getCurrentItem();
      var pagename = record.location.getPagename();
      return {
        pagename: pagename,
        store: store,
        pageComponent: routeMeta.pageComponents[pagename]
      };
    });
  };

  _proto3.push = function push(location) {
    var curHistory = this.getCurrentItem();
    var routeState = {
      pagename: location.getPagename(),
      params: location.getParams(),
      action: RouteHistoryAction.RELAUNCH,
      key: ''
    };
    var store = forkStore(curHistory.store, routeState);
    var newHistory = new PageStack(this, store);
    var newRecord = new RouteRecord(location, newHistory);
    newHistory.startup(newRecord);

    this._push(newHistory);

    return newRecord;
  };

  _proto3.replace = function replace(location) {
    var curHistory = this.getCurrentItem();
    return curHistory.relaunch(location);
  };

  _proto3.relaunch = function relaunch(location) {
    var curHistory = this.getCurrentItem();
    var newRecord = curHistory.relaunch(location);

    this._relaunch(curHistory);

    return newRecord;
  };

  _proto3.countBack = function countBack(delta) {
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

  _proto3.testBack = function testBack(stepOrKey, rootOnly) {
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
        index: [this.records.length - 1, _pageStack2.records.length - 1]
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
        index: [this.records.length - 1, _pageStack3.records.length - 1]
      };
    }
  };

  _proto3.findRecordByKey = function findRecordByKey(key) {
    var arr = key.split('-');

    for (var i = 0, k = this.records.length; i < k; i++) {
      var _pageStack4 = this.records[i];

      if (_pageStack4.stackkey === arr[0]) {
        var item = _pageStack4.findRecordByKey(arr[1]);

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
  };

  return WindowStack;
}(HistoryStack);

function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __extendDefault(target, def) {
  var clone = {};
  Object.keys(def).forEach(function (key) {
    if (target[key] === undefined) {
      clone[key] = def[key];
    } else {
      var tval = target[key];
      var dval = def[key];

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
  var result = {};
  var hasSub = false;
  Object.keys(data).forEach(function (key) {
    var value = data[key];
    var defaultValue = def[key];

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

  var filtered = __excludeDefault(data, def);

  if (keepTopLevel) {
    var result = {};
    Object.keys(data).forEach(function (key) {
      result[key] = filtered && filtered[key] !== undefined ? filtered[key] : {};
    });
    return result;
  }

  return filtered || {};
}

var LocationCaches = function () {
  function LocationCaches(limit) {
    _defineProperty(this, "length", 0);

    _defineProperty(this, "first", void 0);

    _defineProperty(this, "last", void 0);

    _defineProperty(this, "data", {});

    this.limit = limit;
  }

  var _proto = LocationCaches.prototype;

  _proto.getItem = function getItem(key) {
    var data = this.data;
    var cache = data[key];

    if (cache && cache.next) {
      var nextCache = cache.next;
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
  };

  _proto.setItem = function setItem(key, item) {
    var data = this.data;

    if (data[key]) {
      data[key].payload = item;
      return;
    }

    var cache = {
      key: key,
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

    var length = this.length + 1;

    if (length > this.limit) {
      var firstCache = this.first;
      delete data[firstCache.key];
      this.first = firstCache.next;
    } else {
      this.length = length;
    }

    return;
  };

  return LocationCaches;
}();

var locationCaches = new LocationCaches(routeConfig.maxLocationCache);
var urlParser = {
  type: {
    e: 'e',
    s: 's',
    n: 'n'
  },
  getNativeUrl: function getNativeUrl(pathname, query) {
    return this.getUrl('n', pathname, query ? routeConfig.paramsKey + "=" + encodeURIComponent(query) : '');
  },
  getEluxUrl: function getEluxUrl(pathmatch, args) {
    var search = this.stringifySearch(args);
    return this.getUrl('e', pathmatch, search);
  },
  getStateUrl: function getStateUrl(pagename, payload) {
    var search = this.stringifySearch(payload);
    return this.getUrl('s', pagename, search);
  },
  parseNativeUrl: function parseNativeUrl(nurl) {
    var pathname = this.getPath(nurl);
    var arr = nurl.split(routeConfig.paramsKey + "=");
    var query = arr[1] || '';
    return {
      pathname: pathname,
      query: decodeURIComponent(query)
    };
  },
  parseStateUrl: function parseStateUrl(surl) {
    var pagename = this.getPath(surl);
    var search = this.getSearch(surl);
    var payload = this.parseSearch(search);
    return {
      pagename: pagename,
      payload: payload
    };
  },
  getUrl: function getUrl(type, path, search) {
    return [type, ':/', path, search && search !== '{}' ? "?" + search : ''].join('');
  },
  getPath: function getPath(url) {
    return url.substr(3).split('?', 1)[0];
  },
  getSearch: function getSearch(url) {
    return url.replace(/^.+?(\?|$)/, '');
  },
  stringifySearch: function stringifySearch(data) {
    return Object.keys(data).length ? JSON.stringify(data) : '';
  },
  parseSearch: function parseSearch(search) {
    return routeJsonParse(search);
  },
  checkUrl: function checkUrl(url) {
    var type = this.type[url.charAt(0)] || 'e';
    var path, search;
    var arr = url.split('://', 2);

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
      var _arr = url.split(routeConfig.paramsKey + "=", 2);

      if (_arr[1]) {
        _arr = _arr[1].split('&', 1);

        if (_arr[0]) {
          search = routeConfig.paramsKey + "=" + _arr[0];
        } else {
          search = '';
        }
      } else {
        search = '';
      }
    }

    return this.getUrl(type, path, search);
  },
  checkPath: function checkPath(path) {
    path = "/" + path.replace(/^\/+|\/+$/g, '');

    if (path === '/') {
      path = '/index';
    }

    return path;
  },
  withoutProtocol: function withoutProtocol(url) {
    return url.replace(/^[^/]+?:\//, '');
  }
};

var LocationTransform = function () {
  function LocationTransform(url, data) {
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

  var _proto2 = LocationTransform.prototype;

  _proto2.getPayload = function getPayload() {
    if (!this._payload) {
      var search = urlParser.getSearch(this.url);
      var args = urlParser.parseSearch(search);
      var notfoundPagename = routeConfig.notfoundPagename;
      var pagenameMap = routeMeta.pagenameMap;
      var pagename = this.getPagename();
      var pathmatch = urlParser.getPath(this.url);

      var _pagename = pagename + "/";

      var arrArgs;

      if (pagename === notfoundPagename) {
        arrArgs = [pathmatch];
      } else {
        var _pathmatch = pathmatch + "/";

        arrArgs = _pathmatch.replace(_pagename, '').split('/').map(function (item) {
          return item ? decodeURIComponent(item) : undefined;
        });
      }

      var pathArgs = pagenameMap[_pagename] ? pagenameMap[_pagename].pathToParams(arrArgs) : {};
      this._payload = deepMerge({}, pathArgs, args);
    }

    return this._payload;
  };

  _proto2.getMinData = function getMinData() {
    if (!this._minData) {
      var eluxUrl = this.getEluxUrl();

      if (!this._minData) {
        var pathmatch = urlParser.getPath(eluxUrl);
        var search = urlParser.getSearch(eluxUrl);
        this._minData = {
          pathmatch: pathmatch,
          args: urlParser.parseSearch(search)
        };
      }
    }

    return this._minData;
  };

  _proto2.toStringArgs = function toStringArgs(arr) {
    return arr.map(function (item) {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  };

  _proto2.update = function update(data) {
    var _this = this;

    Object.keys(data).forEach(function (key) {
      if (data[key] && !_this[key]) {
        _this[key] = data[key];
      }
    });
  };

  _proto2.getPagename = function getPagename() {
    if (!this._pagename) {
      var notfoundPagename = routeConfig.notfoundPagename;
      var pagenameList = routeMeta.pagenameList;
      var pathmatch = urlParser.getPath(this.url);

      var __pathmatch = pathmatch + "/";

      var __pagename = pagenameList.find(function (name) {
        return __pathmatch.startsWith(name);
      });

      this._pagename = __pagename ? __pagename.substr(0, __pagename.length - 1) : notfoundPagename;
    }

    return this._pagename;
  };

  _proto2.getStateUrl = function getStateUrl() {
    if (!this._surl) {
      this._surl = urlParser.getStateUrl(this.getPagename(), this.getPayload());
    }

    return this._surl;
  };

  _proto2.getEluxUrl = function getEluxUrl() {
    if (!this._eurl) {
      var payload = this.getPayload();
      var minPayload = excludeDefault(payload, routeMeta.defaultParams, true);
      var pagename = this.getPagename();
      var pagenameMap = routeMeta.pagenameMap;

      var _pagename = pagename + "/";

      var pathmatch;
      var pathArgs;

      if (pagenameMap[_pagename]) {
        var pathArgsArr = this.toStringArgs(pagenameMap[_pagename].paramsToPath(minPayload));
        pathmatch = _pagename + pathArgsArr.map(function (item) {
          return item ? encodeURIComponent(item) : '';
        }).join('/');
        pathmatch = pathmatch.replace(/\/*$/, '');
        pathArgs = pagenameMap[_pagename].pathToParams(pathArgsArr);
      } else {
        pathmatch = '/index';
        pathArgs = {};
      }

      var args = excludeDefault(minPayload, pathArgs, false);
      this._minData = {
        pathmatch: pathmatch,
        args: args
      };
      this._eurl = urlParser.getEluxUrl(pathmatch, args);
    }

    return this._eurl;
  };

  _proto2.getNativeUrl = function getNativeUrl(withoutProtocol) {
    if (!this._nurl) {
      var nativeLocationMap = routeMeta.nativeLocationMap;
      var minData = this.getMinData();

      var _nativeLocationMap$ou = nativeLocationMap.out(minData),
          pathname = _nativeLocationMap$ou.pathname,
          query = _nativeLocationMap$ou.query;

      this._nurl = urlParser.getNativeUrl(pathname, query);
    }

    return withoutProtocol ? urlParser.withoutProtocol(this._nurl) : this._nurl;
  };

  _proto2.getParams = function getParams() {
    var _this2 = this;

    if (!this._params) {
      var payload = this.getPayload();
      var def = routeMeta.defaultParams;
      var asyncLoadModules = Object.keys(payload).filter(function (moduleName) {
        return def[moduleName] === undefined;
      });
      var modulesOrPromise = getModuleList(asyncLoadModules);

      if (isPromise(modulesOrPromise)) {
        return modulesOrPromise.then(function (modules) {
          modules.forEach(function (module) {
            def[module.moduleName] = module.routeParams;
          });

          var _params = assignDefaultData(payload);

          var modulesMap = moduleExists();
          Object.keys(_params).forEach(function (moduleName) {
            if (!modulesMap[moduleName]) {
              delete _params[moduleName];
            }
          });
          _this2._params = _params;
          return _params;
        });
      }

      var modules = modulesOrPromise;
      modules.forEach(function (module) {
        def[module.moduleName] = module.routeParams;
      });

      var _params = assignDefaultData(payload);

      var modulesMap = moduleExists();
      Object.keys(_params).forEach(function (moduleName) {
        if (!modulesMap[moduleName]) {
          delete _params[moduleName];
        }
      });
      this._params = _params;
      return _params;
    } else {
      return this._params;
    }
  };

  return LocationTransform;
}();

function location(dataOrUrl) {
  if (typeof dataOrUrl === 'string') {
    var _url = urlParser.checkUrl(dataOrUrl);

    var type = _url.charAt(0);

    if (type === 'e') {
      return createFromElux(_url);
    } else if (type === 's') {
      return createFromState(_url);
    } else {
      return createFromNative(_url);
    }
  } else if (dataOrUrl['pathmatch']) {
    var _ref = dataOrUrl,
        pathmatch = _ref.pathmatch,
        args = _ref.args;
    var eurl = urlParser.getEluxUrl(urlParser.checkPath(pathmatch), args);
    return createFromElux(eurl);
  } else if (dataOrUrl['pagename']) {
    var data = dataOrUrl;
    var pagename = data.pagename,
        payload = data.payload;
    var surl = urlParser.getStateUrl(urlParser.checkPath(pagename), payload);
    return createFromState(surl, data);
  } else {
    var _data = dataOrUrl;
    var pathname = _data.pathname,
        query = _data.query;
    var nurl = urlParser.getNativeUrl(urlParser.checkPath(pathname), query);
    return createFromNative(nurl, _data);
  }
}

function createFromElux(eurl, data) {
  var item = locationCaches.getItem(eurl);

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
  var eurl = locationCaches.getItem(nurl);

  if (!eurl) {
    var nativeLocationMap = routeMeta.nativeLocationMap;
    data = data || urlParser.parseNativeUrl(nurl);

    var _nativeLocationMap$in = nativeLocationMap.in(data),
        pathmatch = _nativeLocationMap$in.pathmatch,
        args = _nativeLocationMap$in.args;

    eurl = urlParser.getEluxUrl(pathmatch, args);
    locationCaches.setItem(nurl, eurl);
  }

  return createFromElux(eurl, {
    nurl: nurl
  });
}

function createFromState(surl, data) {
  var eurl = "e" + surl.substr(1);
  var item = locationCaches.getItem(eurl);

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
  var def = routeMeta.defaultParams;
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

var defaultNativeLocationMap = {
  in: function _in(nativeLocation) {
    var pathname = nativeLocation.pathname,
        query = nativeLocation.query;
    return {
      pathmatch: pathname,
      args: urlParser.parseSearch(query)
    };
  },
  out: function out(eluxLocation) {
    var pathmatch = eluxLocation.pathmatch,
        args = eluxLocation.args;
    return {
      pathname: pathmatch,
      query: urlParser.stringifySearch(args)
    };
  }
};
function createRouteModule(moduleName, pagenameMap, nativeLocationMap) {
  if (nativeLocationMap === void 0) {
    nativeLocationMap = defaultNativeLocationMap;
  }

  setCoreConfig({
    RouteModuleName: moduleName
  });
  var pagenames = Object.keys(pagenameMap);

  var _pagenameMap = pagenames.sort(function (a, b) {
    return b.length - a.length;
  }).reduce(function (map, pagename) {
    var fullPagename = ("/" + pagename + "/").replace(/^\/+|\/+$/g, '/');
    var _pagenameMap$pagename = pagenameMap[pagename],
        pathToParams = _pagenameMap$pagename.pathToParams,
        paramsToPath = _pagenameMap$pagename.paramsToPath,
        pageComponent = _pagenameMap$pagename.pageComponent;
    map[fullPagename] = {
      pathToParams: pathToParams,
      paramsToPath: paramsToPath
    };
    routeMeta.pageComponents[pagename] = pageComponent;
    return map;
  }, {});

  routeMeta.pagenameMap = _pagenameMap;
  routeMeta.pagenameList = Object.keys(_pagenameMap);
  routeMeta.nativeLocationMap = nativeLocationMap;
  return exportModule(moduleName, RouteModel, {}, '/index');
}

var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "eluxRouter", void 0);
  }

  var _proto = BaseNativeRouter.prototype;

  _proto.onChange = function onChange(key) {
    if (this.curTask) {
      this.curTask();
      this.curTask = undefined;
      return false;
    }

    return key !== this.eluxRouter.routeState.key;
  };

  _proto.startup = function startup(router) {
    this.eluxRouter = router;
  };

  _proto.execute = function execute(method, location) {
    var _this = this;

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      _this.curTask = resolve;

      var result = _this[method].apply(_this, [location].concat(args));

      if (!result) {
        resolve();
        _this.curTask = undefined;
      } else if (isPromise(result)) {
        result.catch(function (e) {
          reject(e);
          env.console.error(e);
          _this.curTask = undefined;
        });
      }
    });
  };

  return BaseNativeRouter;
}();
var BaseEluxRouter = function (_MultipleDispatcher) {
  _inheritsLoose(BaseEluxRouter, _MultipleDispatcher);

  function BaseEluxRouter(nativeUrl, nativeRouter, nativeData) {
    var _this2;

    _this2 = _MultipleDispatcher.call(this) || this;

    _defineProperty(_assertThisInitialized(_this2), "_curTask", void 0);

    _defineProperty(_assertThisInitialized(_this2), "_taskList", []);

    _defineProperty(_assertThisInitialized(_this2), "location", void 0);

    _defineProperty(_assertThisInitialized(_this2), "routeState", void 0);

    _defineProperty(_assertThisInitialized(_this2), "name", coreConfig.RouteModuleName);

    _defineProperty(_assertThisInitialized(_this2), "initialize", void 0);

    _defineProperty(_assertThisInitialized(_this2), "windowStack", new WindowStack());

    _defineProperty(_assertThisInitialized(_this2), "latestState", {});

    _defineProperty(_assertThisInitialized(_this2), "_taskComplete", function () {
      var task = _this2._taskList.shift();

      if (task) {
        _this2.executeTask(task);
      } else {
        _this2._curTask = undefined;
      }
    });

    _this2.nativeRouter = nativeRouter;
    _this2.nativeData = nativeData;
    nativeRouter.startup(_assertThisInitialized(_this2));
    var location$1 = location(nativeUrl);
    _this2.location = location$1;
    var pagename = location$1.getPagename();
    var paramsOrPromise = location$1.getParams();

    var callback = function callback(params) {
      var routeState = {
        pagename: pagename,
        params: params,
        action: RouteHistoryAction.RELAUNCH,
        key: ''
      };
      _this2.routeState = routeState;
      return routeState;
    };

    if (isPromise(paramsOrPromise)) {
      _this2.initialize = paramsOrPromise.then(callback);
    } else {
      _this2.initialize = Promise.resolve(callback(paramsOrPromise));
    }

    return _this2;
  }

  var _proto2 = BaseEluxRouter.prototype;

  _proto2.startup = function startup(store) {
    var pageStack = new PageStack(this.windowStack, store);
    var routeRecord = new RouteRecord(this.location, pageStack);
    pageStack.startup(routeRecord);
    this.windowStack.startup(pageStack);
    this.routeState.key = routeRecord.key;
  };

  _proto2.getCurrentPages = function getCurrentPages() {
    return this.windowStack.getCurrentPages();
  };

  _proto2.getCurrentStore = function getCurrentStore() {
    return this.windowStack.getCurrentItem().store;
  };

  _proto2.getStoreList = function getStoreList() {
    return this.windowStack.getItems().map(function (_ref) {
      var store = _ref.store;
      return store;
    });
  };

  _proto2.getHistoryLength = function getHistoryLength(root) {
    return root ? this.windowStack.getLength() : this.windowStack.getCurrentItem().getLength();
  };

  _proto2.findRecordByKey = function findRecordByKey(recordKey) {
    var _this$windowStack$fin = this.windowStack.findRecordByKey(recordKey),
        _this$windowStack$fin2 = _this$windowStack$fin.record,
        key = _this$windowStack$fin2.key,
        location = _this$windowStack$fin2.location,
        overflow = _this$windowStack$fin.overflow,
        index = _this$windowStack$fin.index;

    return {
      overflow: overflow,
      index: index,
      record: {
        key: key,
        location: location
      }
    };
  };

  _proto2.findRecordByStep = function findRecordByStep(delta, rootOnly) {
    var _this$windowStack$tes = this.windowStack.testBack(delta, rootOnly),
        _this$windowStack$tes2 = _this$windowStack$tes.record,
        key = _this$windowStack$tes2.key,
        location = _this$windowStack$tes2.location,
        overflow = _this$windowStack$tes.overflow,
        index = _this$windowStack$tes.index;

    return {
      overflow: overflow,
      index: index,
      record: {
        key: key,
        location: location
      }
    };
  };

  _proto2.extendCurrent = function extendCurrent(params, pagename) {
    return {
      payload: deepMerge({}, this.routeState.params, params),
      pagename: pagename || this.routeState.pagename
    };
  };

  _proto2.relaunch = function relaunch(dataOrUrl, root, nonblocking, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._relaunch.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  };

  _proto2._relaunch = function () {
    var _relaunch2 = _asyncToGenerator(regenerator.mark(function _callee(dataOrUrl, root, nativeCaller) {
      var location$1, pagename, params, key, routeState, notifyNativeRouter, cloneState;
      return regenerator.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              location$1 = location(dataOrUrl);
              pagename = location$1.getPagename();
              _context.next = 4;
              return location$1.getParams();

            case 4:
              params = _context.sent;
              key = '';
              routeState = {
                pagename: pagename,
                params: params,
                action: RouteHistoryAction.RELAUNCH,
                key: key
              };
              _context.next = 9;
              return this.getCurrentStore().dispatch(routeTestChangeAction(routeState));

            case 9:
              _context.next = 11;
              return this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

            case 11:
              if (root) {
                key = this.windowStack.relaunch(location$1).key;
              } else {
                key = this.windowStack.getCurrentItem().relaunch(location$1).key;
              }

              routeState.key = key;
              notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context.next = 17;
                break;
              }

              _context.next = 17;
              return this.nativeRouter.execute('relaunch', location$1, key);

            case 17:
              this.location = location$1;
              this.routeState = routeState;
              cloneState = deepClone(routeState);
              this.getCurrentStore().dispatch(routeChangeAction(cloneState));
              _context.next = 23;
              return this.dispatch('change', {
                routeState: cloneState,
                root: root
              });

            case 23:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function _relaunch(_x, _x2, _x3) {
      return _relaunch2.apply(this, arguments);
    }

    return _relaunch;
  }();

  _proto2.push = function push(dataOrUrl, root, nonblocking, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._push.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  };

  _proto2._push = function () {
    var _push2 = _asyncToGenerator(regenerator.mark(function _callee2(dataOrUrl, root, nativeCaller) {
      var location$1, pagename, params, key, routeState, notifyNativeRouter, cloneState;
      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              location$1 = location(dataOrUrl);
              pagename = location$1.getPagename();
              _context2.next = 4;
              return location$1.getParams();

            case 4:
              params = _context2.sent;
              key = '';
              routeState = {
                pagename: pagename,
                params: params,
                action: RouteHistoryAction.PUSH,
                key: key
              };
              _context2.next = 9;
              return this.getCurrentStore().dispatch(routeTestChangeAction(routeState));

            case 9:
              _context2.next = 11;
              return this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

            case 11:
              if (root) {
                key = this.windowStack.push(location$1).key;
              } else {
                key = this.windowStack.getCurrentItem().push(location$1).key;
              }

              routeState.key = key;
              notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context2.next = 17;
                break;
              }

              _context2.next = 17;
              return this.nativeRouter.execute('push', location$1, key);

            case 17:
              this.location = location$1;
              this.routeState = routeState;
              cloneState = deepClone(routeState);

              if (!root) {
                _context2.next = 25;
                break;
              }

              _context2.next = 23;
              return reinitApp(this.getCurrentStore());

            case 23:
              _context2.next = 26;
              break;

            case 25:
              this.getCurrentStore().dispatch(routeChangeAction(cloneState));

            case 26:
              _context2.next = 28;
              return this.dispatch('change', {
                routeState: cloneState,
                root: root
              });

            case 28:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function _push(_x4, _x5, _x6) {
      return _push2.apply(this, arguments);
    }

    return _push;
  }();

  _proto2.replace = function replace(dataOrUrl, root, nonblocking, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._replace.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  };

  _proto2._replace = function () {
    var _replace2 = _asyncToGenerator(regenerator.mark(function _callee3(dataOrUrl, root, nativeCaller) {
      var location$1, pagename, params, key, routeState, notifyNativeRouter, cloneState;
      return regenerator.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              location$1 = location(dataOrUrl);
              pagename = location$1.getPagename();
              _context3.next = 4;
              return location$1.getParams();

            case 4:
              params = _context3.sent;
              key = '';
              routeState = {
                pagename: pagename,
                params: params,
                action: RouteHistoryAction.REPLACE,
                key: key
              };
              _context3.next = 9;
              return this.getCurrentStore().dispatch(routeTestChangeAction(routeState));

            case 9:
              _context3.next = 11;
              return this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

            case 11:
              if (root) {
                key = this.windowStack.replace(location$1).key;
              } else {
                key = this.windowStack.getCurrentItem().replace(location$1).key;
              }

              routeState.key = key;
              notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context3.next = 17;
                break;
              }

              _context3.next = 17;
              return this.nativeRouter.execute('replace', location$1, key);

            case 17:
              this.location = location$1;
              this.routeState = routeState;
              cloneState = deepClone(routeState);
              this.getCurrentStore().dispatch(routeChangeAction(cloneState));
              _context3.next = 23;
              return this.dispatch('change', {
                routeState: cloneState,
                root: root
              });

            case 23:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function _replace(_x7, _x8, _x9) {
      return _replace2.apply(this, arguments);
    }

    return _replace;
  }();

  _proto2.back = function back(stepOrKey, root, options, nonblocking, nativeCaller) {
    if (stepOrKey === void 0) {
      stepOrKey = 1;
    }

    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    if (!stepOrKey) {
      return;
    }

    return this.addTask(this._back.bind(this, stepOrKey, root, options || {}, nativeCaller), nonblocking);
  };

  _proto2._back = function () {
    var _back2 = _asyncToGenerator(regenerator.mark(function _callee4(stepOrKey, root, options, nativeCaller) {
      var _this3 = this;

      var _this$windowStack$tes3, record, overflow, index, url, key, location, pagename, params, routeState, notifyNativeRouter, cloneState;

      return regenerator.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _this$windowStack$tes3 = this.windowStack.testBack(stepOrKey, root), record = _this$windowStack$tes3.record, overflow = _this$windowStack$tes3.overflow, index = _this$windowStack$tes3.index;

              if (!overflow) {
                _context4.next = 5;
                break;
              }

              url = options.overflowRedirect || routeConfig.indexUrl;
              env.setTimeout(function () {
                return _this3.relaunch(url, root);
              }, 0);
              return _context4.abrupt("return");

            case 5:
              if (!(!index[0] && !index[1])) {
                _context4.next = 7;
                break;
              }

              return _context4.abrupt("return");

            case 7:
              key = record.key;
              location = record.location;
              pagename = location.getPagename();
              params = deepMerge({}, location.getParams(), options.payload);
              routeState = {
                key: key,
                pagename: pagename,
                params: params,
                action: RouteHistoryAction.BACK
              };
              _context4.next = 14;
              return this.getCurrentStore().dispatch(routeTestChangeAction(routeState));

            case 14:
              _context4.next = 16;
              return this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

            case 16:
              if (index[0]) {
                root = true;
                this.windowStack.back(index[0]);
              }

              if (index[1]) {
                this.windowStack.getCurrentItem().back(index[1]);
              }

              notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context4.next = 22;
                break;
              }

              _context4.next = 22;
              return this.nativeRouter.execute('back', location, index, key);

            case 22:
              this.location = location;
              this.routeState = routeState;
              cloneState = deepClone(routeState);
              this.getCurrentStore().dispatch(routeChangeAction(cloneState));
              _context4.next = 28;
              return this.dispatch('change', {
                routeState: routeState,
                root: root
              });

            case 28:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function _back(_x10, _x11, _x12, _x13) {
      return _back2.apply(this, arguments);
    }

    return _back;
  }();

  _proto2.executeTask = function executeTask(task) {
    this._curTask = task;
    task().finally(this._taskComplete);
  };

  _proto2.addTask = function addTask(execute, nonblocking) {
    if (env.isServer) {
      return;
    }
  };

  _proto2.destroy = function destroy() {
    this.nativeRouter.destroy();
  };

  return BaseEluxRouter;
}(MultipleDispatcher);
function toURouter(router) {
  var nativeData = router.nativeData,
      location = router.location,
      routeState = router.routeState,
      initialize = router.initialize,
      addListener = router.addListener,
      getCurrentPages = router.getCurrentPages,
      findRecordByKey = router.findRecordByKey,
      findRecordByStep = router.findRecordByStep,
      getHistoryLength = router.getHistoryLength,
      extendCurrent = router.extendCurrent,
      relaunch = router.relaunch,
      push = router.push,
      replace = router.replace,
      back = router.back;
  return {
    nativeData: nativeData,
    location: location,
    routeState: routeState,
    initialize: initialize,
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

var appMeta = {
  router: null,
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};
var appConfig = {
  loadComponent: null,
  useRouter: null,
  useStore: null
};
var setAppConfig = buildConfigSetter(appConfig);
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
function createBaseApp(ins, router, render, storeInitState, storeMiddlewares, storeLogger) {
  if (storeMiddlewares === void 0) {
    storeMiddlewares = [];
  }

  var urouter = toURouter(router);
  appMeta.router = urouter;
  return Object.assign(ins, {
    render: function (_render2) {
      function render(_x) {
        return _render2.apply(this, arguments);
      }

      render.toString = function () {
        return _render2.toString();
      };

      return render;
    }(function (_temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          _ref$id = _ref.id,
          id = _ref$id === void 0 ? 'root' : _ref$id,
          _ref$ssrKey = _ref.ssrKey,
          ssrKey = _ref$ssrKey === void 0 ? 'eluxInitStore' : _ref$ssrKey,
          _ref$viewName = _ref.viewName,
          viewName = _ref$viewName === void 0 ? 'main' : _ref$viewName;

      var _ref2 = env[ssrKey] || {},
          state = _ref2.state,
          _ref2$components = _ref2.components,
          components = _ref2$components === void 0 ? [] : _ref2$components;

      return router.initialize.then(function (routeState) {
        var _extends2;

        var storeData = _extends((_extends2 = {}, _extends2[coreConfig.RouteModuleName] = routeState, _extends2), state);

        var _initApp2 = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName, components),
            store = _initApp2.store,
            AppView = _initApp2.AppView,
            setup = _initApp2.setup;

        return setup.then(function () {
          render(id, AppView, {
            deps: {},
            router: urouter,
            documentHead: ''
          }, !!env[ssrKey], ins, store);
        });
      });
    })
  });
}
function createBaseSSR(ins, router, render, storeInitState, storeMiddlewares, storeLogger) {
  if (storeMiddlewares === void 0) {
    storeMiddlewares = [];
  }

  var urouter = toURouter(router);
  appMeta.router = urouter;
  return Object.assign(ins, {
    render: function (_render3) {
      function render(_x2) {
        return _render3.apply(this, arguments);
      }

      render.toString = function () {
        return _render3.toString();
      };

      return render;
    }(function (_temp2) {
      var _ref3 = _temp2 === void 0 ? {} : _temp2,
          _ref3$id = _ref3.id,
          id = _ref3$id === void 0 ? 'root' : _ref3$id,
          _ref3$ssrKey = _ref3.ssrKey,
          ssrKey = _ref3$ssrKey === void 0 ? 'eluxInitStore' : _ref3$ssrKey,
          _ref3$viewName = _ref3.viewName,
          viewName = _ref3$viewName === void 0 ? 'main' : _ref3$viewName;

      return router.initialize.then(function (routeState) {
        var _storeData;

        var storeData = (_storeData = {}, _storeData[coreConfig.RouteModuleName] = routeState, _storeData);

        var _initApp3 = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName),
            store = _initApp3.store,
            AppView = _initApp3.AppView,
            setup = _initApp3.setup;

        return setup.then(function () {
          var state = store.getState();
          var eluxContext = {
            deps: {},
            router: urouter,
            documentHead: ''
          };
          return render(id, AppView, eluxContext, ins, store).then(function (html) {
            var match = appMeta.SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + id + "['\"][^<>]*>", 'm'));

            if (match) {
              return appMeta.SSRTPL.replace('</head>', "\r\n" + eluxContext.documentHead + "\r\n<script>window." + ssrKey + " = " + JSON.stringify({
                state: state,
                components: Object.keys(eluxContext.deps)
              }) + ";</script>\r\n</head>").replace(match[0], match[0] + html);
            }

            return html;
          });
        });
      });
    })
  });
}
function getApi(demoteForProductionOnly, injectActions) {
  var modules = getModuleMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
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
    useRouter: appConfig.useRouter,
    useStore: appConfig.useStore,
    GetRouter: function GetRouter() {
      if (env.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use getRouter() instead';
      }

      return appMeta.router;
    },
    LoadComponent: appConfig.loadComponent,
    Modules: modules
  };
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
  var _url$split = url.split('?'),
      pathname = _url$split[0],
      search = _url$split[1];

  return {
    push: function push() {
      return undefined;
    },
    replace: function replace() {
      return undefined;
    },
    block: function block() {
      return function () {
        return undefined;
      };
    },
    location: {
      pathname: pathname,
      search: search
    }
  };
}
function createBrowserHistory() {
  return createBrowserHistory$1();
}
var BrowserNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(_history) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "_unlistenHistory", void 0);

    _this._history = _history;
    var _routeConfig$notifyNa = routeConfig.notifyNativeRouter,
        root = _routeConfig$notifyNa.root,
        internal = _routeConfig$notifyNa.internal;

    if (root || internal) {
      _this._unlistenHistory = _this._history.block(function (locationData, action) {
        if (action === 'POP') {
          env.setTimeout(function () {
            return _this.eluxRouter.back(1);
          }, 100);
          return false;
        }

        return undefined;
      });
    }

    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.push = function push(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.replace = function replace(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.back = function back(location, index, key) {
    if (!env.isServer) {
      this._history.replace(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory && this._unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);
function createRouter(browserHistory, nativeData) {
  var browserNativeRouter = new BrowserNativeRouter(browserHistory);
  var _browserHistory$locat = browserHistory.location,
      pathname = _browserHistory$locat.pathname,
      search = _browserHistory$locat.search;
  return new BaseEluxRouter(urlParser.getUrl('n', pathname, search), browserNativeRouter, nativeData);
}

setCoreConfig({
  MutableData: true
});
setAppConfig({
  loadComponent: loadComponent,
  useRouter: useRouter,
  useStore: useStore
});
function setConfig(conf) {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}
function createApp(moduleGetter, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  var app = vue.createApp(Router);
  var history = createBrowserHistory();
  var router = createRouter(history, {});
  return createBaseApp(app, router, renderToDocument, vue.reactive, storeMiddlewares, storeLogger);
}
function createSSR(moduleGetter, url, nativeData, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  var app = vue.createSSRApp(Router);
  var history = createServerHistory(url);
  var router = createRouter(history, nativeData);
  return createBaseSSR(app, router, renderToString, vue.reactive, storeMiddlewares, storeLogger);
}

exports.BaseModel = BaseModel;
exports.DocumentHead = DocumentHead;
exports.Else = Else;
exports.EmptyModel = EmptyModel;
exports.Link = Link;
exports.Switch = Switch;
exports.createApp = createApp;
exports.createRouteModule = createRouteModule;
exports.createSSR = createSSR;
exports.deepMerge = deepMerge;
exports.effect = effect;
exports.effectLogger = effectLogger;
exports.env = env;
exports.errorAction = errorAction;
exports.exportComponent = exportComponent;
exports.exportModule = exportModule;
exports.exportView = exportView;
exports.getApi = getApi;
exports.getComponent = getComponent;
exports.getModule = getModule;
exports.isServer = isServer;
exports.loadModel = loadModel;
exports.location = location;
exports.modelHotReplacement = modelHotReplacement;
exports.reducer = reducer;
exports.routeJsonParse = routeJsonParse;
exports.setConfig = setConfig;
exports.setLoading = setLoading;
