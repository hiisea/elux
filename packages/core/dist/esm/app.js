import env from './env';
import { MetaData, coreConfig } from './basic';
import { createStore } from './store';
import { getModule, getComponent, getModuleList, getComponentList } from './inject';
export function initApp(router, data, initState, middlewares, storeLogger, appViewName, preloadComponents) {
  if (preloadComponents === void 0) {
    preloadComponents = [];
  }

  MetaData.currentRouter = router;
  var store = createStore(0, router, data, initState, middlewares, storeLogger);
  router.startup(store);
  var AppModuleName = coreConfig.AppModuleName,
      RouteModuleName = coreConfig.RouteModuleName;
  var moduleGetter = MetaData.moduleGetter;
  var appModule = getModule(AppModuleName);
  var routeModule = getModule(RouteModuleName);
  var AppView = appViewName ? getComponent(AppModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  var preloadModules = Object.keys(router.routeState.params).concat(Object.keys(store.getState())).reduce(function (data, moduleName) {
    if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
      data[moduleName] = true;
    }

    return data;
  }, {});
  var results = Promise.all([getModuleList(Object.keys(preloadModules)), getComponentList(preloadComponents), routeModule.initModel(store), appModule.initModel(store)]);
  var setup;

  if (env.isServer) {
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
export function reinitApp(store) {
  var moduleGetter = MetaData.moduleGetter;
  var preloadModules = Object.keys(store.router.routeState.params).filter(function (moduleName) {
    return moduleGetter[moduleName] && moduleName !== AppModuleName;
  });
  var AppModuleName = coreConfig.AppModuleName,
      RouteModuleName = coreConfig.RouteModuleName;
  var appModule = getModule(AppModuleName);
  var routeModule = getModule(RouteModuleName);
  return Promise.all([getModuleList(preloadModules), routeModule.initModel(store), appModule.initModel(store)]);
}