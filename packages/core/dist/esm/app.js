import _extends from "@babel/runtime/helpers/esm/extends";
import { MetaData, coreConfig } from './basic';
import { getModule, getComponet, getModuleList, getComponentList } from './inject';
import { enhanceStore } from './store';
export function initApp(natvieData, router, baseStore, middlewares, appViewName, preloadComponents) {
  if (preloadComponents === void 0) {
    preloadComponents = [];
  }

  MetaData.currentRouter = router;
  var store = enhanceStore(baseStore, router, middlewares);
  router.startup(store, natvieData);
  var AppModuleName = coreConfig.AppModuleName,
      RouteModuleName = coreConfig.RouteModuleName;
  var moduleGetter = MetaData.moduleGetter;
  var appModule = getModule(AppModuleName);
  var routeModule = getModule(RouteModuleName);
  var AppView = appViewName ? getComponet(AppModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  var preloadModules = Object.keys(router.routeState.params).concat(Object.keys(baseStore.getState())).reduce(function (data, moduleName) {
    if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
      data[moduleName] = true;
    }

    return data;
  }, {});
  var setup = Promise.all([getModuleList(Object.keys(preloadModules)), getComponentList(preloadComponents), routeModule.model(store), appModule.model(store)]);
  return {
    store: store,
    AppView: AppView,
    setup: setup
  };
}
var ForkStoreId = 0;
export function forkStore(originalStore) {
  var _originalStore$builde = originalStore.builder,
      storeCreator = _originalStore$builde.storeCreator,
      storeOptions = _originalStore$builde.storeOptions,
      middlewares = originalStore.options.middlewares,
      router = originalStore.router;
  var moduleGetter = MetaData.moduleGetter;
  var baseStore = storeCreator(_extends({}, storeOptions, {
    initState: undefined
  }), ++ForkStoreId);
  var store = enhanceStore(baseStore, router, middlewares);
  var AppModuleName = coreConfig.AppModuleName,
      RouteModuleName = coreConfig.RouteModuleName;
  var appModule = getModule(AppModuleName);
  var routeModule = getModule(RouteModuleName);
  var preloadModules = Object.keys(router.routeState.params).filter(function (moduleName) {
    return moduleGetter[moduleName] && moduleName !== AppModuleName;
  });
  getModuleList(preloadModules);
  routeModule.model(store);
  appModule.model(store);
  return store;
}