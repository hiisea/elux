"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.defineModuleGetter = defineModuleGetter;
exports.getCachedModules = getCachedModules;
exports.getComponent = getComponent;
exports.getComponentList = getComponentList;
exports.getModule = getModule;
exports.getModuleList = getModuleList;
exports.loadComponent = loadComponent;
exports.loadModel = loadModel;
exports.moduleExists = moduleExists;

var _env = _interopRequireDefault(require("./env"));

var _utils = require("./utils");

var _basic = require("./basic");

function getModule(moduleName) {
  if (_basic.MetaData.moduleCaches[moduleName]) {
    return _basic.MetaData.moduleCaches[moduleName];
  }

  var moduleOrPromise = _basic.MetaData.moduleGetter[moduleName]();

  if ((0, _utils.isPromise)(moduleOrPromise)) {
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
    return (0, _utils.isPromise)(item);
  })) {
    return Promise.all(list);
  } else {
    return list;
  }
}

function getComponent(moduleName, componentName) {
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

  if ((0, _utils.isPromise)(moduleOrPromise)) {
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

    return getComponent(moduleName, componentName);
  }));
}

function loadModel(moduleName, store) {
  var moduleOrPromise = getModule(moduleName);

  if ((0, _utils.isPromise)(moduleOrPromise)) {
    return moduleOrPromise.then(function (module) {
      return module.initModel(store);
    });
  }

  return moduleOrPromise.initModel(store);
}

function loadComponent(moduleName, componentName, store, deps) {
  var promiseOrComponent = getComponent(moduleName, componentName);

  var callback = function callback(component) {
    if (component.__elux_component__ === 'view' && !store.injectedModules[moduleName]) {
      if (_env.default.isServer) {
        return null;
      }

      var module = getModule(moduleName);
      module.initModel(store);
    }

    deps[moduleName + _basic.coreConfig.NSP + componentName] = true;
    return component;
  };

  if ((0, _utils.isPromise)(promiseOrComponent)) {
    if (_env.default.isServer) {
      return null;
    }

    return promiseOrComponent.then(callback);
  }

  return callback(promiseOrComponent);
}

function moduleExists() {
  return _basic.MetaData.moduleExists;
}

function getCachedModules() {
  return _basic.MetaData.moduleCaches;
}

function defineModuleGetter(moduleGetter) {
  _basic.MetaData.moduleGetter = moduleGetter;
  _basic.MetaData.moduleExists = Object.keys(moduleGetter).reduce(function (data, moduleName) {
    data[moduleName] = true;
    return data;
  }, {});
}