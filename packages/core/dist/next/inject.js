import env from './env';
import { isPromise } from './utils';
import { MetaData, coreConfig, isEluxComponent } from './basic';
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
    return [];
  }

  const list = moduleNames.map(moduleName => {
    if (MetaData.moduleCaches[moduleName]) {
      return MetaData.moduleCaches[moduleName];
    }

    return getModule(moduleName);
  });

  if (list.some(item => isPromise(item))) {
    return Promise.all(list);
  } else {
    return list;
  }
}
export function getComponent(moduleName, componentName) {
  const key = [moduleName, componentName].join(coreConfig.NSP);

  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key];
  }

  const moduleCallback = module => {
    const componentOrFun = module.components[componentName];

    if (isEluxComponent(componentOrFun)) {
      const component = componentOrFun;
      MetaData.componentCaches[key] = component;
      return component;
    }

    const promiseComponent = componentOrFun().then(({
      default: component
    }) => {
      MetaData.componentCaches[key] = component;
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

    const [moduleName, componentName] = key.split(coreConfig.NSP);
    return getComponent(moduleName, componentName);
  }));
}
export function loadModel(moduleName, store) {
  const moduleOrPromise = getModule(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(module => module.initModel(store));
  }

  return moduleOrPromise.initModel(store);
}
export function loadComponent(moduleName, componentName, store, deps) {
  const promiseOrComponent = getComponent(moduleName, componentName);

  const callback = component => {
    if (component.__elux_component__ === 'view' && !store.injectedModules[moduleName]) {
      if (env.isServer) {
        return null;
      }

      const module = getModule(moduleName);
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
export function moduleExists() {
  return MetaData.moduleExists;
}
export function getCachedModules() {
  return MetaData.moduleCaches;
}
export function defineModuleGetter(moduleGetter) {
  MetaData.moduleGetter = moduleGetter;
  MetaData.moduleExists = Object.keys(moduleGetter).reduce((data, moduleName) => {
    data[moduleName] = true;
    return data;
  }, {});
}