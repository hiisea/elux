"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getModuleGetter = getModuleGetter;
exports.exportModule = exportModule;
exports.getModule = getModule;
exports.getModuleList = getModuleList;
exports.loadModel = _loadModel;
exports.getComponet = getComponet;
exports.getComponentList = getComponentList;
exports.loadComponet = loadComponet;
exports.getCachedModules = getCachedModules;
exports.getRootModuleAPI = getRootModuleAPI;
exports.exportComponent = exportComponent;
exports.exportView = exportView;
exports.modelHotReplacement = modelHotReplacement;
exports.CoreModuleHandlers = exports.EmptyModuleHandlers = void 0;

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _sprite = require("./sprite");

var _basic = require("./basic");

var _env = _interopRequireDefault(require("./env"));

function getModuleGetter() {
  return _basic.MetaData.moduleGetter;
}

function exportModule(moduleName, ModuleHandles, params, components) {
  Object.keys(components).forEach(function (key) {
    var component = components[key];

    if (!(0, _basic.isEluxComponent)(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      _env.default.console.warn("The exported component must implement interface EluxComponent: " + moduleName + "." + key);
    }
  });

  var model = function model(store) {
    if (!store.injectedModules[moduleName]) {
      var _setup = '';
      var preModuleState = store.getState(moduleName);
      var routeParams = store.router.getParams();

      if (preModuleState && Object.keys(preModuleState).length > 0) {
        _setup = store.id > 0 ? 'afterFork' : 'afterSSR';
      }

      var moduleHandles = new ModuleHandles(moduleName, store, preModuleState, _setup);
      store.injectedModules[moduleName] = moduleHandles;
      (0, _basic.injectActions)(moduleName, moduleHandles);

      var _initState = (0, _sprite.deepMerge)(moduleHandles.initState, routeParams[moduleName]);

      return store.dispatch((0, _basic.moduleInitAction)(moduleName, _initState, _setup));
    }

    return undefined;
  };

  return {
    moduleName: moduleName,
    model: model,
    components: components,
    state: undefined,
    params: params,
    actions: undefined
  };
}

function getModule(moduleName) {
  if (_basic.MetaData.moduleCaches[moduleName]) {
    return _basic.MetaData.moduleCaches[moduleName];
  }

  var moduleOrPromise = _basic.MetaData.moduleGetter[moduleName]();

  if ((0, _sprite.isPromise)(moduleOrPromise)) {
    var promiseModule = moduleOrPromise.then(function (_ref) {
      var module = _ref.default;
      _basic.MetaData.moduleCaches[moduleName] = module;
      return module;
    }, function (reason) {
      _basic.MetaData.moduleCaches[moduleName] = undefined;
      throw reason;
    });
    _basic.MetaData.moduleCaches[moduleName] = promiseModule;
    return promiseModule;
  }

  _basic.MetaData.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}

function getModuleList(moduleNames) {
  if (moduleNames.length < 1) {
    return [];
  }

  var list = moduleNames.map(function (moduleName) {
    if (_basic.MetaData.moduleCaches[moduleName]) {
      return _basic.MetaData.moduleCaches[moduleName];
    }

    return getModule(moduleName);
  });

  if (list.some(function (item) {
    return (0, _sprite.isPromise)(item);
  })) {
    return Promise.all(list);
  } else {
    return list;
  }
}

function _loadModel(moduleName, store) {
  var moduleOrPromise = getModule(moduleName);

  if ((0, _sprite.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      return module.model(store);
    });
  }

  return moduleOrPromise.model(store);
}

function getComponet(moduleName, componentName) {
  var key = [moduleName, componentName].join(_basic.coreConfig.NSP);

  if (_basic.MetaData.componentCaches[key]) {
    return _basic.MetaData.componentCaches[key];
  }

  var moduleCallback = function moduleCallback(module) {
    var componentOrFun = module.components[componentName];

    if ((0, _basic.isEluxComponent)(componentOrFun)) {
      var component = componentOrFun;
      _basic.MetaData.componentCaches[key] = component;
      return component;
    }

    var promiseComponent = componentOrFun().then(function (_ref2) {
      var component = _ref2.default;
      _basic.MetaData.componentCaches[key] = component;
      return component;
    }, function (reason) {
      _basic.MetaData.componentCaches[key] = undefined;
      throw reason;
    });
    _basic.MetaData.componentCaches[key] = promiseComponent;
    return promiseComponent;
  };

  var moduleOrPromise = getModule(moduleName);

  if ((0, _sprite.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(moduleCallback);
  }

  return moduleCallback(moduleOrPromise);
}

function getComponentList(keys) {
  if (keys.length < 1) {
    return Promise.resolve([]);
  }

  return Promise.all(keys.map(function (key) {
    if (_basic.MetaData.componentCaches[key]) {
      return _basic.MetaData.componentCaches[key];
    }

    var _key$split = key.split(_basic.coreConfig.NSP),
        moduleName = _key$split[0],
        componentName = _key$split[1];

    return getComponet(moduleName, componentName);
  }));
}

function loadComponet(moduleName, componentName, store, deps) {
  var promiseOrComponent = getComponet(moduleName, componentName);

  var callback = function callback(component) {
    if (component.__elux_component__ === 'view' && !store.injectedModules[moduleName]) {
      if (_env.default.isServer) {
        return null;
      }

      var module = getModule(moduleName);
      module.model(store);
    }

    deps[moduleName + _basic.coreConfig.NSP + componentName] = true;
    return component;
  };

  if ((0, _sprite.isPromise)(promiseOrComponent)) {
    if (_env.default.isServer) {
      return null;
    }

    return promiseOrComponent.then(callback);
  }

  return callback(promiseOrComponent);
}

function getCachedModules() {
  return _basic.MetaData.moduleCaches;
}

var EmptyModuleHandlers = function () {
  function EmptyModuleHandlers(moduleName, store) {
    (0, _defineProperty2.default)(this, "initState", {});
    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = EmptyModuleHandlers.prototype;

  _proto.destroy = function destroy() {
    return;
  };

  return EmptyModuleHandlers;
}();

exports.EmptyModuleHandlers = EmptyModuleHandlers;
var CoreModuleHandlers = (0, _decorate2.default)(null, function (_initialize) {
  var CoreModuleHandlers = function CoreModuleHandlers(moduleName, store, initState) {
    _initialize(this);

    this.moduleName = moduleName;
    this.store = store;
    this.initState = initState;
  };

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "method",
      key: "destroy",
      value: function destroy() {
        return;
      }
    }, {
      kind: "get",
      key: "actions",
      value: function actions() {
        return _basic.MetaData.facadeMap[this.moduleName].actions;
      }
    }, {
      kind: "method",
      key: "getPrivateActions",
      value: function getPrivateActions(actionsMap) {
        return _basic.MetaData.facadeMap[this.moduleName].actions;
      }
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.store.getState(this.moduleName);
      }
    }, {
      kind: "get",
      key: "rootState",
      value: function rootState() {
        return this.store.getState();
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return this.store.getCurrentActionName();
      }
    }, {
      kind: "get",
      key: "currentRootState",
      value: function currentRootState() {
        return this.store.getCurrentState();
      }
    }, {
      kind: "get",
      key: "currentState",
      value: function currentState() {
        return this.store.getCurrentState(this.moduleName);
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
      value: function loadModel(moduleName) {
        return _loadModel(moduleName, this.store);
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "Init",
      value: function Init(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return (0, _basic.deepMergeState)(this.state, payload);
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "Update",
      value: function Update(payload, key) {
        return (0, _basic.mergeState)(this.state, payload);
      }
    }, {
      kind: "method",
      decorators: [_basic.reducer],
      key: "Loading",
      value: function Loading(payload) {
        var loading = (0, _basic.mergeState)(this.state.loading, payload);
        return (0, _basic.mergeState)(this.state, {
          loading: loading
        });
      }
    }]
  };
});
exports.CoreModuleHandlers = CoreModuleHandlers;

function getRootModuleAPI(data) {
  if (!_basic.MetaData.facadeMap) {
    if (data) {
      _basic.MetaData.facadeMap = Object.keys(data).reduce(function (prev, moduleName) {
        var arr = data[moduleName];
        var actions = {};
        var actionNames = {};
        arr.forEach(function (actionName) {
          actions[actionName] = function () {
            for (var _len = arguments.length, payload = new Array(_len), _key = 0; _key < _len; _key++) {
              payload[_key] = arguments[_key];
            }

            return {
              type: moduleName + _basic.coreConfig.NSP + actionName,
              payload: payload
            };
          };

          actionNames[actionName] = moduleName + _basic.coreConfig.NSP + actionName;
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
      _basic.MetaData.facadeMap = new Proxy({}, {
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
                  return moduleName + _basic.coreConfig.NSP + actionName;
                }
              }),
              actions: new Proxy({}, {
                get: function get(__, actionName) {
                  return function () {
                    for (var _len2 = arguments.length, payload = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                      payload[_key2] = arguments[_key2];
                    }

                    return {
                      type: moduleName + _basic.coreConfig.NSP + actionName,
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

  return _basic.MetaData.facadeMap;
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

function modelHotReplacement(moduleName, ModuleHandles) {
  var model = function model(store) {
    if (!store.injectedModules[moduleName]) {
      var _setup2 = '';
      var preModuleState = store.getState(moduleName);
      var routeParams = store.router.getParams();

      if (preModuleState && Object.keys(preModuleState).length > 0) {
        _setup2 = store.id > 0 ? 'afterFork' : 'afterSSR';
      }

      var moduleHandles = new ModuleHandles(moduleName, store, preModuleState, _setup2);
      store.injectedModules[moduleName] = moduleHandles;
      (0, _basic.injectActions)(moduleName, moduleHandles);

      var _initState2 = (0, _sprite.deepMerge)(moduleHandles.initState, routeParams[moduleName]);

      return store.dispatch((0, _basic.moduleInitAction)(moduleName, _initState2, _setup2));
    }

    return undefined;
  };

  var moduleCache = _basic.MetaData.moduleCaches[moduleName];

  if (moduleCache && moduleCache['model']) {
    moduleCache.model = model;
  }

  if (_basic.MetaData.injectedModules[moduleName]) {
    _basic.MetaData.injectedModules[moduleName] = false;
    (0, _basic.injectActions)(moduleName, ModuleHandles);
  }

  var stores = _basic.MetaData.currentRouter.getStoreList();

  stores.forEach(function (store) {
    if (store.injectedModules[moduleName]) {
      var ins = new ModuleHandles(moduleName, store);
      ins.initState = store.injectedModules[moduleName].initState;
      store.injectedModules[moduleName] = ins;
    }
  });

  _env.default.console.log("[HMR] @medux Updated model: " + moduleName);
}