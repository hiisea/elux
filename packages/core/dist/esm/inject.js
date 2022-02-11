import env from './env';
import { isPromise } from './utils';
import { MetaData, coreConfig, isEluxComponent } from './basic';
export function getModule(moduleName) {
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
export function getModuleList(moduleNames) {
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
export function getComponent(moduleName, componentName) {
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
export function getComponentList(keys) {
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
export function loadModel(moduleName, store) {
  var moduleOrPromise = getModule(moduleName);

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      return module.initModel(store);
    });
  }

  return moduleOrPromise.initModel(store);
}
export function loadComponent(moduleName, componentName, store, deps) {
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
export function moduleExists() {
  return MetaData.moduleExists;
}
export function getCachedModules() {
  return MetaData.moduleCaches;
}
export function defineModuleGetter(moduleGetter) {
  MetaData.moduleGetter = moduleGetter;
  MetaData.moduleExists = Object.keys(moduleGetter).reduce(function (data, moduleName) {
    data[moduleName] = true;
    return data;
  }, {});
}