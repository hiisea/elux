import { MetaData, coreConfig } from './basic';
import { getModule, getComponet, getModuleList, getComponentList } from './inject';
import { enhanceStore } from './store';
import env from './env';
export function initApp(router, baseStore, middlewares, appViewName, preloadComponents = []) {
  MetaData.currentRouter = router;
  const store = enhanceStore(baseStore, router, middlewares);
  router.startup(store);
  const {
    AppModuleName,
    RouteModuleName
  } = coreConfig;
  const {
    moduleGetter
  } = MetaData;
  const appModule = getModule(AppModuleName);
  const routeModule = getModule(RouteModuleName);
  const AppView = appViewName ? getComponet(AppModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  const preloadModules = Object.keys(router.routeState.params).concat(Object.keys(baseStore.getState())).reduce((data, moduleName) => {
    if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
      data[moduleName] = true;
    }

    return data;
  }, {});
  const results = Promise.all([getModuleList(Object.keys(preloadModules)), getComponentList(preloadComponents), routeModule.model(store), appModule.model(store)]);
  let setup;

  if (env.isServer) {
    setup = results.then(([modules]) => {
      return Promise.all(modules.map(mod => mod.model(store)));
    });
  } else {
    setup = results;
  }

  return {
    store,
    AppView,
    setup
  };
}
export function reinitApp(store) {
  const {
    moduleGetter
  } = MetaData;
  const preloadModules = Object.keys(store.router.routeState.params).filter(moduleName => moduleGetter[moduleName] && moduleName !== AppModuleName);
  const {
    AppModuleName,
    RouteModuleName
  } = coreConfig;
  const appModule = getModule(AppModuleName);
  const routeModule = getModule(RouteModuleName);
  return Promise.all([getModuleList(preloadModules), routeModule.model(store), appModule.model(store)]);
}
let ForkStoreId = 0;
export function forkStore(originalStore, routeState) {
  const {
    builder: {
      storeCreator,
      storeOptions
    },
    options: {
      middlewares
    },
    router
  } = originalStore;
  const baseStore = storeCreator({ ...storeOptions,
    initState: {
      [coreConfig.RouteModuleName]: routeState
    }
  }, ++ForkStoreId);
  const store = enhanceStore(baseStore, router, middlewares);
  return store;
}