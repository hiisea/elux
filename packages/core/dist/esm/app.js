import _extends from "@babel/runtime/helpers/esm/extends";
import { MetaData, coreConfig } from './basic';
import { getModule, getComponet, getModuleList, getComponentList } from './inject';
import { enhanceStore } from './store';
import env from './env';
export function initApp(router, baseStore, middlewares, appViewName, preloadComponents) {
  if (preloadComponents === void 0) {
    preloadComponents = [];
  }

  MetaData.currentRouter = router;
  var store = enhanceStore(baseStore, router, middlewares);
  router.startup(store);
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
  var results = Promise.all([getModuleList(Object.keys(preloadModules)), getComponentList(preloadComponents), routeModule.model(store), appModule.model(store)]);
  var setup;

  if (env.isServer) {
    setup = results.then(function (_ref) {
      var modules = _ref[0];
      return Promise.all(modules.map(function (mod) {
        return mod.model(store);
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
  return Promise.all([getModuleList(preloadModules), routeModule.model(store), appModule.model(store)]);
}
var ForkStoreId = 0;
export function forkStore(originalStore, routeState) {
  var _initState;

  var _originalStore$builde = originalStore.builder,
      storeCreator = _originalStore$builde.storeCreator,
      storeOptions = _originalStore$builde.storeOptions,
      middlewares = originalStore.options.middlewares,
      router = originalStore.router;
  var baseStore = storeCreator(_extends({}, storeOptions, {
    initState: (_initState = {}, _initState[coreConfig.RouteModuleName] = routeState, _initState)
  }), ++ForkStoreId);
  var store = enhanceStore(baseStore, router, middlewares);
  return store;
}