import {
  EluxComponent,
  CommonModule,
  MetaData,
  IStore,
  BStore,
  IStoreMiddleware,
  ICoreRouter,
  ICoreRouteState,
  coreConfig,
  IStoreLogger,
} from './basic';
import {getModule, getComponet, getModuleList, getComponentList} from './inject';
import {enhanceStore} from './store';
import env from './env';

export function initApp<ST extends BStore = BStore>(
  router: ICoreRouter,
  baseStore: ST,
  middlewares?: IStoreMiddleware[],
  storeLogger?: IStoreLogger,
  appViewName?: string,
  preloadComponents: string[] = []
): {store: IStore & ST; AppView: EluxComponent; setup: Promise<void>} {
  MetaData.currentRouter = router;
  const store = enhanceStore(0, baseStore, router, middlewares, storeLogger) as IStore & ST;
  router.startup(store);
  const {AppModuleName, RouteModuleName} = coreConfig;
  const {moduleGetter} = MetaData;
  const appModule = getModule(AppModuleName) as CommonModule;
  const routeModule = getModule(RouteModuleName) as CommonModule;
  const AppView: EluxComponent = appViewName ? (getComponet(AppModuleName, appViewName) as EluxComponent) : {__elux_component__: 'view'};
  // 防止view中瀑布式懒加载
  const preloadModules: Record<string, boolean> = Object.keys(router.routeState.params)
    .concat(Object.keys(baseStore.getState()))
    .reduce((data, moduleName) => {
      if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
        data[moduleName] = true;
      }
      return data;
    }, {});
  const results = Promise.all([
    getModuleList(Object.keys(preloadModules)),
    getComponentList(preloadComponents),
    routeModule.model(store),
    appModule.model(store),
  ]);
  let setup: Promise<any>;
  if (env.isServer) {
    setup = results.then(([modules]) => {
      return Promise.all(modules.map((mod) => mod.model(store)));
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
export function reinitApp(store: IStore): Promise<void> {
  const {moduleGetter} = MetaData;
  const preloadModules = Object.keys(store.router.routeState.params).filter((moduleName) => moduleGetter[moduleName] && moduleName !== AppModuleName);
  const {AppModuleName, RouteModuleName} = coreConfig;
  const appModule = getModule(AppModuleName) as CommonModule;
  const routeModule = getModule(RouteModuleName) as CommonModule;
  return Promise.all([getModuleList(preloadModules), routeModule.model(store), appModule.model(store)]) as Promise<any>;
}

export function forkStore<T extends IStore, S extends ICoreRouteState>(originalStore: T, routeState: S): T {
  const {
    sid,
    builder: {storeCreator, storeOptions},
    options: {middlewares, logger},
    router,
  } = originalStore;

  const baseStore = storeCreator({...storeOptions, initState: {[coreConfig.RouteModuleName]: routeState}});
  const store = enhanceStore(sid + 1, baseStore, router, middlewares, logger) as T;

  return store;
}
