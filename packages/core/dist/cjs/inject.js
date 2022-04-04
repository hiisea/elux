"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.getComponent = getComponent;
exports.getEntryComponent = getEntryComponent;
exports.getModule = getModule;
exports.getModuleApiMap = getModuleApiMap;
exports.injectActions = injectActions;
exports.injectComponent = injectComponent;

var _env = _interopRequireDefault(require("./env"));

var _utils = require("./utils");

var _basic = require("./basic");

function getModule(moduleName) {
  if (_basic.MetaData.moduleCaches[moduleName]) {
    return _basic.MetaData.moduleCaches[moduleName];
  }

  var moduleOrPromise = _basic.coreConfig.ModuleGetter[moduleName]();

  if ((0, _utils.isPromise)(moduleOrPromise)) {
    var promiseModule = moduleOrPromise.then(function (_ref) {
      var module = _ref.default;
      injectActions(new module.ModelClass(moduleName, null));
      _basic.MetaData.moduleCaches[moduleName] = module;
      return module;
    }, function (reason) {
      _basic.MetaData.moduleCaches[moduleName] = undefined;
      throw reason;
    });
    _basic.MetaData.moduleCaches[moduleName] = promiseModule;
    return promiseModule;
  }

  injectActions(new moduleOrPromise.ModelClass(moduleName, null));
  _basic.MetaData.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}

function getComponent(moduleName, componentName) {
  var key = [moduleName, componentName].join(_basic.coreConfig.NSP);

  if (_basic.MetaData.componentCaches[key]) {
    return _basic.MetaData.componentCaches[key];
  }

  var moduleCallback = function moduleCallback(module) {
    var componentOrFun = module.components[componentName];

    if ((0, _basic.isEluxComponent)(componentOrFun)) {
      _basic.MetaData.componentCaches[key] = componentOrFun;
      return componentOrFun;
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

  if ((0, _utils.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(moduleCallback);
  }

  return moduleCallback(moduleOrPromise);
}

function getEntryComponent() {
  return getComponent(_basic.coreConfig.StageModuleName, _basic.coreConfig.StageViewName);
}

function getModuleApiMap(data) {
  if (!_basic.MetaData.moduleApiMap) {
    if (data) {
      _basic.MetaData.moduleApiMap = Object.keys(data).reduce(function (prev, moduleName) {
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
      _basic.MetaData.moduleApiMap = new Proxy({}, {
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

  return _basic.MetaData.moduleApiMap;
}

function injectComponent(moduleName, componentName, store) {
  return (0, _utils.promiseCaseCallback)(getComponent(moduleName, componentName), function (component) {
    if (component.__elux_component__ === 'view' && !_env.default.isServer) {
      return (0, _utils.promiseCaseCallback)(store.mount(moduleName, 'update'), function () {
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

function transformAction(actionName, handler, listenerModule, actionHandlerMap, hmr) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    _env.default.console.warn("Action duplicate : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}