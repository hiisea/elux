import _decorate from "@babel/runtime/helpers/esm/decorate";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import env from './env';
import { deepClone } from './utils';
import { coreConfig, mergeState, isEluxComponent, MetaData } from './basic';
import { ActionTypes, moduleInitAction, reducer } from './actions';

function initModel(moduleName, ModelClass, _store) {
  const store = _store;

  if (!store.injectedModules[moduleName]) {
    const {
      latestState
    } = store.router;
    const preState = store.getState();
    const model = new ModelClass(moduleName, store);
    const initState = model.init(latestState, preState) || {};
    store.injectedModules[moduleName] = model;
    return store.dispatch(moduleInitAction(moduleName, coreConfig.MutableData ? deepClone(initState) : initState));
  }

  return undefined;
}

export function exportModule(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(key => {
    const component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn(`The exported component must implement interface EluxComponent: ${moduleName}.${key}`);
    }
  });
  const model = new ModelClass(moduleName, null);
  injectActions(moduleName, model);
  return {
    moduleName,
    initModel: initModel.bind(null, moduleName, ModelClass),
    state: {},
    actions: {},
    components,
    routeParams: model.defaultRouteParams,
    data
  };
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

export function injectActions(moduleName, model, hmr) {
  const handlers = model;
  const injectedModules = MetaData.injectedModules;

  if (injectedModules[moduleName]) {
    return;
  }

  injectedModules[moduleName] = true;

  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];

      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(coreConfig.MSP).forEach(actionName => {
          actionName = actionName.trim().replace(new RegExp(`^this[${coreConfig.NSP}]`), `${moduleName}${coreConfig.NSP}`);
          const arr = actionName.split(coreConfig.NSP);

          if (arr[1]) {
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
          } else {
            transformAction(moduleName + coreConfig.NSP + actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
          }
        });
      }
    }
  }
}
export function modelHotReplacement(moduleName, ModelClass) {
  const moduleCache = MetaData.moduleCaches[moduleName];

  if (moduleCache && moduleCache['initModel']) {
    moduleCache.initModel = initModel.bind(null, moduleName, ModelClass);
  }

  if (MetaData.injectedModules[moduleName]) {
    MetaData.injectedModules[moduleName] = false;
    const model = new ModelClass(moduleName, null);
    injectActions(moduleName, model, true);
  }

  const stores = MetaData.currentRouter.getStoreList();
  stores.forEach(store => {
    if (store.injectedModules[moduleName]) {
      const model = new ModelClass(moduleName, store);
      store.injectedModules[moduleName] = model;
    }
  });
  env.console.log(`[HMR] @medux Updated model: ${moduleName}`);
}
export function getModuleMap(data) {
  if (!MetaData.moduleMap) {
    if (data) {
      MetaData.moduleMap = Object.keys(data).reduce((prev, moduleName) => {
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
      MetaData.moduleMap = new Proxy({}, {
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

  return MetaData.moduleMap;
}
export function exportComponent(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
export function exportView(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}
export class EmptyModel {
  constructor(moduleName, store) {
    _defineProperty(this, "initState", {});

    _defineProperty(this, "defaultRouteParams", {});

    this.moduleName = moduleName;
    this.store = store;
  }

  init() {
    return {};
  }

  destroy() {
    return;
  }

}
export let RouteModel = _decorate(null, function (_initialize) {
  class RouteModel {
    constructor(moduleName, store) {
      _initialize(this);

      this.moduleName = moduleName;
      this.store = store;
    }

  }

  return {
    F: RouteModel,
    d: [{
      kind: "field",
      key: "defaultRouteParams",

      value() {
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
      value: function (initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: ActionTypes.MRouteChange,
      value: function (routeState) {
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