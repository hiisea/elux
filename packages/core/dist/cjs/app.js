"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.initApp = initApp;
exports.reinitApp = reinitApp;

var _env = _interopRequireDefault(require("./env"));

var _basic = require("./basic");

var _store = require("./store");

var _inject = require("./inject");

function initApp(router, data, initState, middlewares, storeLogger, appViewName, preloadComponents) {
  if (preloadComponents === void 0) {
    preloadComponents = [];
  }

  _basic.MetaData.currentRouter = router;
  var store = (0, _store.createStore)(0, router, data, initState, middlewares, storeLogger);
  router.startup(store);
  var AppModuleName = _basic.coreConfig.AppModuleName,
      RouteModuleName = _basic.coreConfig.RouteModuleName;
  var moduleGetter = _basic.MetaData.moduleGetter;
  var appModule = (0, _inject.getModule)(AppModuleName);
  var routeModule = (0, _inject.getModule)(RouteModuleName);
  var AppView = appViewName ? (0, _inject.getComponent)(AppModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  var preloadModules = Object.keys(router.routeState.params).concat(Object.keys(store.getState())).reduce(function (data, moduleName) {
    if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
      data[moduleName] = true;
    }

    return data;
  }, {});
  var results = Promise.all([(0, _inject.getModuleList)(Object.keys(preloadModules)), (0, _inject.getComponentList)(preloadComponents), routeModule.initModel(store), appModule.initModel(store)]);
  var setup;

  if (_env.default.isServer) {
    setup = results.then(function (_ref) {
      var modules = _ref[0];
      return Promise.all(modules.map(function (mod) {
        return mod.initModel(store);
      }));
    });
  } else {
    setup = results;
  }

  return {
    store: store,
    AppView: AppView,
    setup: setup
  };
}

function reinitApp(store) {
  var moduleGetter = _basic.MetaData.moduleGetter;
  var preloadModules = Object.keys(store.router.routeState.params).filter(function (moduleName) {
    return moduleGetter[moduleName] && moduleName !== AppModuleName;
  });
  var AppModuleName = _basic.coreConfig.AppModuleName,
      RouteModuleName = _basic.coreConfig.RouteModuleName;
  var appModule = (0, _inject.getModule)(AppModuleName);
  var routeModule = (0, _inject.getModule)(RouteModuleName);
  return Promise.all([(0, _inject.getModuleList)(preloadModules), routeModule.initModel(store), appModule.initModel(store)]);
}