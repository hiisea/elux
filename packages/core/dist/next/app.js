import { MetaData, coreConfig } from './basic';
import { getModule, getComponet, getModuleList, getComponentList } from './inject';
import { enhanceStore } from './store';
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
  const setup = Promise.all([getModuleList(Object.keys(preloadModules)), getComponentList(preloadComponents), routeModule.model(store), appModule.model(store)]);
  return {
    store,
    AppView,
    setup
  };
}
let ForkStoreId = 0;
export function forkStore(originalStore) {
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
  const {
    moduleGetter
  } = MetaData;
  const baseStore = storeCreator({ ...storeOptions,
    initState: undefined
  }, ++ForkStoreId);
  const store = enhanceStore(baseStore, router, middlewares);
  const {
    AppModuleName,
    RouteModuleName
  } = coreConfig;
  const appModule = getModule(AppModuleName);
  const routeModule = getModule(RouteModuleName);
  const preloadModules = Object.keys(router.routeState.params).filter(moduleName => moduleGetter[moduleName] && moduleName !== AppModuleName);
  getModuleList(preloadModules);
  routeModule.model(store);
  appModule.model(store);
  return store;
}