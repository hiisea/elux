import _decorate from "@babel/runtime/helpers/esm/decorate";
import { isPromise } from './sprite';
import { isEluxComponent, injectActions, MetaData, config, reducer, mergeState, moduleInitAction, moduleReInitAction } from './basic';
import { env } from './env';
export function exportModule(moduleName, ModuleHandles, params, components) {
  Object.keys(components).forEach(key => {
    const component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn(`The exported component must implement interface EluxComponent: ${moduleName}.${key}`);
    }
  });

  const model = store => {
    if (!store.injectedModules[moduleName]) {
      const moduleHandles = new ModuleHandles(moduleName);
      store.injectedModules[moduleName] = moduleHandles;
      moduleHandles.store = store;
      injectActions(moduleName, moduleHandles);
      const initState = moduleHandles.initState;
      const preModuleState = store.getState(moduleName);

      if (preModuleState) {
        return store.dispatch(moduleReInitAction(moduleName, initState));
      }

      return store.dispatch(moduleInitAction(moduleName, initState));
    }

    return undefined;
  };

  return {
    moduleName,
    model,
    components,
    state: undefined,
    params,
    actions: undefined
  };
}
export function getModule(moduleName) {
  if (MetaData.moduleCaches[moduleName]) {
    return MetaData.moduleCaches[moduleName];
  }

  const moduleOrPromise = MetaData.moduleGetter[moduleName]();

  if (isPromise(moduleOrPromise)) {
    const promiseModule = moduleOrPromise.then(({
      default: module
    }) => {
      MetaData.moduleCaches[moduleName] = module;
      return module;
    }, reason => {
      MetaData.moduleCaches[moduleName] = undefined;
      throw reason;
    });
    MetaData.moduleCaches[moduleName] = promiseModule;
    return promiseModule;
  }

  MetaData.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}
export function getModuleList(moduleNames) {
  if (moduleNames.length < 1) {
    return Promise.resolve([]);
  }

  return Promise.all(moduleNames.map(moduleName => {
    if (MetaData.moduleCaches[moduleName]) {
      return MetaData.moduleCaches[moduleName];
    }

    return getModule(moduleName);
  }));
}

function _loadModel(moduleName, store = MetaData.clientStore) {
  const moduleOrPromise = getModule(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(module => module.model(store));
  }

  return moduleOrPromise.model(store);
}

export { _loadModel as loadModel };
export function getComponet(moduleName, componentName, initView) {
  const key = [moduleName, componentName].join(config.NSP);

  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key];
  }

  const moduleCallback = module => {
    const componentOrFun = module.components[componentName];

    if (isEluxComponent(componentOrFun)) {
      const component = componentOrFun;
      MetaData.componentCaches[key] = component;

      if (component.__elux_component__ === 'view' && initView && !env.isServer) {
        module.model(MetaData.clientStore);
      }

      return component;
    }

    const promiseComponent = componentOrFun().then(({
      default: component
    }) => {
      MetaData.componentCaches[key] = component;

      if (component.__elux_component__ === 'view' && initView && !env.isServer) {
        module.model(MetaData.clientStore);
      }

      return component;
    }, reason => {
      MetaData.componentCaches[key] = undefined;
      throw reason;
    });
    MetaData.componentCaches[key] = promiseComponent;
    return promiseComponent;
  };

  const moduleOrPromise = getModule(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(moduleCallback);
  }

  return moduleCallback(moduleOrPromise);
}
export function getComponentList(keys) {
  if (keys.length < 1) {
    return Promise.resolve([]);
  }

  return Promise.all(keys.map(key => {
    if (MetaData.componentCaches[key]) {
      return MetaData.componentCaches[key];
    }

    const [moduleName, componentName] = key.split(config.NSP);
    return getComponet(moduleName, componentName);
  }));
}
export function getCachedModules() {
  return MetaData.moduleCaches;
}
export let CoreModuleHandlers = _decorate(null, function (_initialize) {
  class CoreModuleHandlers {
    constructor(moduleName, initState) {
      _initialize(this);

      this.moduleName = moduleName;
      this.initState = initState;
    }

  }

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "field",
      key: "store",
      value: void 0
    }, {
      kind: "get",
      key: "actions",
      value: function actions() {
        return MetaData.facadeMap[this.moduleName].actions;
      }
    }, {
      kind: "method",
      key: "getPrivateActions",
      value: function getPrivateActions(actionsMap) {
        return MetaData.facadeMap[this.moduleName].actions;
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
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Update",
      value: function Update(payload, key) {
        return mergeState(this.state, payload);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "Loading",
      value: function Loading(payload) {
        const loading = mergeState(this.state.loading, payload);
        return mergeState(this.state, {
          loading
        });
      }
    }]
  };
});
export function getRootModuleAPI(data) {
  if (!MetaData.facadeMap) {
    if (data) {
      MetaData.facadeMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions = {};
        const actionNames = {};
        arr.forEach(actionName => {
          actions[actionName] = (...payload) => ({
            type: moduleName + config.NSP + actionName,
            payload
          });

          actionNames[actionName] = moduleName + config.NSP + actionName;
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
      MetaData.facadeMap = new Proxy({}, {
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
                  return moduleName + config.NSP + actionName;
                }

              }),
              actions: new Proxy({}, {
                get(__, actionName) {
                  return (...payload) => ({
                    type: moduleName + config.NSP + actionName,
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

  return MetaData.facadeMap;
}
export function defineComponent(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
export function defineView(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}