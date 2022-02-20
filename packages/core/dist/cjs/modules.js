"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.RouteModel = exports.EmptyModel = void 0;
exports.baseExportModule = baseExportModule;
exports.exportComponent = exportComponent;
exports.exportView = exportView;
exports.getModuleMap = getModuleMap;
exports.injectActions = injectActions;
exports.modelHotReplacement = modelHotReplacement;

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _env = _interopRequireDefault(require("./env"));

var _utils = require("./utils");

var _basic = require("./basic");

var _actions = require("./actions");

function initModel(moduleName, ModelClass, _store) {
  var store = _store;

  if (!store.injectedModules[moduleName]) {
    var latestState = store.router.latestState;
    var preState = store.getState();
    var model = new ModelClass(moduleName, store);
    var initState = model.init(latestState, preState) || {};
    store.injectedModules[moduleName] = model;
    return store.dispatch((0, _actions.moduleInitAction)(moduleName, _basic.coreConfig.MutableData ? (0, _utils.deepClone)(initState) : initState));
  }

  return undefined;
}

function baseExportModule(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(function (key) {
    var component = components[key];

    if (!(0, _basic.isEluxComponent)(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      _env.default.console.warn("The exported component must implement interface EluxComponent: " + moduleName + "." + key);
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
    _env.default.console.warn("Action duplicate : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

function injectActions(moduleName, model, hmr) {
  var handlers = model;
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

function modelHotReplacement(moduleName, ModelClass) {
  var moduleCache = _basic.MetaData.moduleCaches[moduleName];

  if (moduleCache && moduleCache['initModel']) {
    moduleCache.initModel = initModel.bind(null, moduleName, ModelClass);
  }

  if (_basic.MetaData.injectedModules[moduleName]) {
    _basic.MetaData.injectedModules[moduleName] = false;
    var model = new ModelClass(moduleName, null);
    injectActions(moduleName, model, true);
  }

  var stores = _basic.MetaData.currentRouter.getStoreList();

  stores.forEach(function (store) {
    if (store.injectedModules[moduleName]) {
      var _model = new ModelClass(moduleName, store);

      store.injectedModules[moduleName] = _model;
    }
  });

  _env.default.console.log("[HMR] @medux Updated model: " + moduleName);
}

function getModuleMap(data) {
  if (!_basic.MetaData.moduleMap) {
    if (data) {
      _basic.MetaData.moduleMap = Object.keys(data).reduce(function (prev, moduleName) {
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
      _basic.MetaData.moduleMap = new Proxy({}, {
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

  return _basic.MetaData.moduleMap;
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
    (0, _defineProperty2.default)(this, "initState", {});
    (0, _defineProperty2.default)(this, "defaultRouteParams", {});
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

exports.EmptyModel = EmptyModel;
var RouteModel = (0, _decorate2.default)(null, function (_initialize) {
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
      decorators: [_actions.reducer],
      key: _actions.ActionTypes.MInit,
      value: function value(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [_actions.reducer],
      key: _actions.ActionTypes.MRouteChange,
      value: function value(routeState) {
        return (0, _basic.mergeState)(this.store.getState(this.moduleName), routeState);
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
exports.RouteModel = RouteModel;