import env from './env';
import { MetaData, coreConfig } from './basic';
import { createStore } from './store';
import { getModule, getComponent, getModuleList, getComponentList } from './inject';
export function initApp(router, data, initState, middlewares, storeLogger, appViewName, preloadComponents = []) {
  MetaData.currentRouter = router;
  const store = createStore(0, router, data, initState, middlewares, storeLogger);
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
  const AppView = appViewName ? getComponent(AppModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  const preloadModules = Object.keys(router.routeState.params).concat(Object.keys(store.getState())).reduce((data, moduleName) => {
    if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
      data[moduleName] = true;
    }

    return data;
  }, {});
  const results = Promise.all([getModuleList(Object.keys(preloadModules)), getComponentList(preloadComponents), routeModule.initModel(store), appModule.initModel(store)]);
  let setup;

  if (env.isServer) {
    setup = results.then(([modules]) => {
      return Promise.all(modules.map(mod => mod.initModel(store)));
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
  return Promise.all([getModuleList(preloadModules), routeModule.initModel(store), appModule.initModel(store)]);
}