"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.exportModule = exportModule;
exports.modelHotReplacement = modelHotReplacement;
exports.getModule = getModule;
exports.getModuleList = getModuleList;
exports.loadModel = loadModel;
exports.getComponet = getComponet;
exports.getComponentList = getComponentList;
exports.loadComponet = loadComponet;
exports.getCachedModules = getCachedModules;
exports.getRootModuleAPI = getRootModuleAPI;
exports.exportComponent = exportComponent;
exports.exportView = exportView;
exports.injectActions = injectActions;
exports.defineModuleGetter = defineModuleGetter;

var _sprite = require("./sprite");

var _basic = require("./basic");

var _actions = require("./actions");

var _env = _interopRequireDefault(require("./env"));

function exportModule(moduleName, ModuleHandlers, params, components) {
  Object.keys(components).forEach(function (key) {
    var component = components[key];

    if (!(0, _basic.isEluxComponent)(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      _env.default.console.warn("The exported component must implement interface EluxComponent: " + moduleName + "." + key);
    }
  });

  var model = function model(store) {
    if (!store.injectedModules[moduleName]) {
      var _latestState = store.router.latestState;

      var _preState = store.getState();

      var moduleHandles = new ModuleHandlers(moduleName, store, _latestState, _preState);
      store.injectedModules[moduleName] = moduleHandles;
      injectActions(moduleName, moduleHandles);
      var initState = moduleHandles.initState || {};
      return store.dispatch((0, _actions.moduleInitAction)(moduleName, _basic.coreConfig.MutableData ? (0, _sprite.deepClone)(initState) : initState));
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

function modelHotReplacement(moduleName, ModuleHandlers) {
  var model = function model(store) {
    if (!store.injectedModules[moduleName]) {
      var _latestState2 = store.router.latestState;

      var _preState2 = store.getState();

      var moduleHandles = new ModuleHandlers(moduleName, store, _latestState2, _preState2);
      store.injectedModules[moduleName] = moduleHandles;
      injectActions(moduleName, moduleHandles);
      var initState = moduleHandles.initState || {};
      return store.dispatch((0, _actions.moduleInitAction)(moduleName, _basic.coreConfig.MutableData ? (0, _sprite.deepClone)(initState) : initState));
    }

    return undefined;
  };

  var moduleCache = _basic.MetaData.moduleCaches[moduleName];

  if (moduleCache && moduleCache['model']) {
    moduleCache.model = model;
  }

  var store = _basic.MetaData.currentRouter.getCurrentStore();

  if (_basic.MetaData.injectedModules[moduleName]) {
    _basic.MetaData.injectedModules[moduleName] = false;
    injectActions(moduleName, new ModuleHandlers(moduleName, store, {}, {}), true);
  }

  var stores = _basic.MetaData.currentRouter.getStoreList();

  stores.forEach(function (store) {
    if (store.injectedModules[moduleName]) {
      var ins = new ModuleHandlers(moduleName, store, {}, {});
      ins.initState = store.injectedModules[moduleName].initState;
      store.injectedModules[moduleName] = ins;
    }
  });

  _env.default.console.log("[HMR] @medux Updated model: " + moduleName);
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

function loadModel(moduleName, store) {
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

function transformAction(actionName, handler, listenerModule, actionHandlerMap, hmr) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    (0, _sprite.warn)("Action duplicate : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

function injectActions(moduleName, handlers, hmr) {
  var injectedModules = _basic.MetaData.injectedModules;

  if (injectedModules[moduleName]) {
    return;
  }

  injectedModules[moduleName] = true;

  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          actionNames.split(_basic.coreConfig.MSP).forEach(function (actionName) {
            actionName = actionName.trim().replace(new RegExp("^this[" + _basic.coreConfig.NSP + "]"), "" + moduleName + _basic.coreConfig.NSP);
            var arr = actionName.split(_basic.coreConfig.NSP);

            if (arr[1]) {
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? _basic.MetaData.effectsMap : _basic.MetaData.reducersMap, hmr);
            } else {
              transformAction(moduleName + _basic.coreConfig.NSP + actionName, handler, moduleName, handler.__isEffect__ ? _basic.MetaData.effectsMap : _basic.MetaData.reducersMap, hmr);
            }
          });
        }
      })();
    }
  }
}

function defineModuleGetter(moduleGetter) {
  _basic.MetaData.moduleGetter = moduleGetter;
  _basic.MetaData.moduleExists = Object.keys(moduleGetter).reduce(function (data, moduleName) {
    data[moduleName] = true;
    return data;
  }, {});
}