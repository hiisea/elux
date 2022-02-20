import _decorate from "@babel/runtime/helpers/esm/decorate";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import env from './env';
import { deepClone } from './utils';
import { coreConfig, mergeState, isEluxComponent, MetaData } from './basic';
import { ActionTypes, moduleInitAction, reducer } from './actions';

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

export function baseExportModule(moduleName, ModelClass, components, data) {
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

export function injectActions(moduleName, model, hmr) {
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
export function modelHotReplacement(moduleName, ModelClass) {
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
export function getModuleMap(data) {
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
export function exportComponent(component) {
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
export function exportView(component) {
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}
export var EmptyModel = function () {
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
export var RouteModel = _decorate(null, function (_initialize) {
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