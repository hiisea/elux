import { coreConfig, isEluxComponent, MetaData } from './basic';
import env from './env';
import { isPromise, promiseCaseCallback } from './utils';
export function getModule(moduleName) {
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
export function getComponent(moduleName, componentName) {
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
export function getEntryComponent() {
  return getComponent(coreConfig.StageModuleName, coreConfig.StageViewName);
}
export function getModuleApiMap(data) {
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
export function injectModule(moduleOrName, moduleGetter) {
  if (typeof moduleOrName === 'string') {
    coreConfig.ModuleGetter[moduleOrName] = moduleGetter;
  } else {
    coreConfig.ModuleGetter[moduleOrName.moduleName] = function () {
      return moduleOrName;
    };
  }
}
export function injectComponent(moduleName, componentName, store) {
  return promiseCaseCallback(getComponent(moduleName, componentName), function (component) {
    if (component.__elux_component__ === 'view' && !env.isServer) {
      return promiseCaseCallback(store.mount(moduleName, 'update'), function () {
        return component;
      });
    }

    return component;
  });
}
export function injectActions(model, hmr) {
  var moduleName = model.moduleName;
  var handlers = model;

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

function transformAction(actionName, handler, listenerModule, actionHandlerMap, hmr) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    env.console.warn("Action duplicate : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}