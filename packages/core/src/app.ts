import env from './env';
import {CoreRouter, StoreMiddleware, StoreLogger, EluxComponent, EStore, MetaData, coreConfig, CommonModule, RootState} from './basic';
import {createStore} from './store';
import {getModule, getComponent, getModuleList, getComponentList} from './inject';

export function initApp(
  router: CoreRouter,
  data: RootState,
  initState: (data: RootState) => RootState,
  middlewares?: StoreMiddleware[],
  storeLogger?: StoreLogger,
  appViewName?: string,
  preloadComponents: string[] = []
): {store: EStore; AppView: EluxComponent; setup: Promise<void>} {
  MetaData.currentRouter = router;
  const store = createStore(0, router, data, initState, middlewares, storeLogger);
  router.startup(store);
  const {AppModuleName, RouteModuleName} = coreConfig;
  const {moduleGetter} = MetaData;
  const appModule = getModule(AppModuleName) as CommonModule;
  const routeModule = getModule(RouteModuleName) as CommonModule;
  const AppView: EluxComponent = appViewName ? (getComponent(AppModuleName, appViewName) as EluxComponent) : {__elux_component__: 'view'};
  // 防止view中瀑布式懒加载
  const preloadModules: Record<string, boolean> = Object.keys(router.routeState.params)
    .concat(Object.keys(store.getState()))
    .reduce((data, moduleName) => {
      if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
        data[moduleName] = true;
      }
      return data;
    }, {});
  const results = Promise.all([
    getModuleList(Object.keys(preloadModules)),
    getComponentList(preloadComponents),
    routeModule.initModel(store),
    appModule.initModel(store),
  ]);
  let setup: Promise<any>;
  if (env.isServer) {
    setup = results.then(([modules]) => {
      return Promise.all(modules.map((mod) => mod.initModel(store)));
    });
  } else {
    setup = results;
  }
  return {
    store,
    AppView,
    setup,
  };
}
export function reinitApp(store: EStore): Promise<void> {
  const {moduleGetter} = MetaData;
  const preloadModules = Object.keys(store.router.routeState.params).filter((moduleName) => moduleGetter[moduleName] && moduleName !== AppModuleName);
  const {AppModuleName, RouteModuleName} = coreConfig;
  const appModule = getModule(AppModuleName) as CommonModule;
  const routeModule = getModule(RouteModuleName) as CommonModule;
  return Promise.all([getModuleList(preloadModules), routeModule.initModel(store), appModule.initModel(store)]) as Promise<any>;
}
