"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.defineModuleGetter = defineModuleGetter;
exports.forkStore = forkStore;
exports.renderApp = renderApp;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _basic = require("./basic");

var _inject = require("./inject");

var _store = require("./store");

function defineModuleGetter(moduleGetter, appModuleName, routeModuleName) {
  if (appModuleName === void 0) {
    appModuleName = 'stage';
  }

  if (routeModuleName === void 0) {
    routeModuleName = 'route';
  }

  _basic.MetaData.appModuleName = appModuleName;
  _basic.MetaData.routeModuleName = routeModuleName;
  _basic.MetaData.moduleGetter = moduleGetter;

  if (!moduleGetter[appModuleName]) {
    throw appModuleName + " module not found in moduleGetter";
  }

  if (!moduleGetter[routeModuleName]) {
    throw routeModuleName + " module not found in moduleGetter";
  }
}

function forkStore(originalStore, initState) {
  var _originalStore$baseFo = originalStore.baseFork,
      creator = _originalStore$baseFo.creator,
      options = _originalStore$baseFo.options,
      middlewares = originalStore.fork.middlewares,
      router = originalStore.router,
      id = originalStore.id;
  var baseStore = creator((0, _extends2.default)({}, options, {
    initState: initState
  }), router, id + 1);

  var _renderApp = renderApp(router, baseStore, middlewares),
      store = _renderApp.store;

  return store;
}

function renderApp(router, baseStore, middlewares, appViewName, preloadComponents) {
  if (preloadComponents === void 0) {
    preloadComponents = [];
  }

  var store = (0, _store.enhanceStore)(baseStore, middlewares);
  store.id === 0 && router.init(store);
  var moduleGetter = _basic.MetaData.moduleGetter,
      appModuleName = _basic.MetaData.appModuleName;
  var routeModuleName = _basic.MetaData.routeModuleName;
  var appModule = (0, _inject.getModule)(appModuleName);
  var routeModule = (0, _inject.getModule)(routeModuleName);
  var AppView = appViewName ? (0, _inject.getComponet)(appModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  var preloadModules = [].concat(Object.keys(baseStore.getState()), Object.keys(router.getParams()));
  preloadModules = preloadModules.filter(function (moduleName) {
    return moduleGetter[moduleName] && moduleName !== appModuleName && moduleName !== routeModuleName;
  });
  var promiseList = [routeModule.model(store), appModule.model(store)];
  promiseList.concat((0, _inject.getModuleList)(preloadModules), (0, _inject.getComponentList)(preloadComponents));
  var setup = Promise.all(promiseList);
  return {
    store: store,
    AppView: AppView,
    setup: setup
  };
}