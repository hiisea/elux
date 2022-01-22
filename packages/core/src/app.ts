import {
  EluxComponent,
  CommonModule,
  MetaData,
  IStore,
  State,
  IStoreMiddleware,
  ICoreRouter,
  ICoreRouteState,
  coreConfig,
  IStoreLogger,
} from './basic';
import {getModule, getComponet, getModuleList, getComponentList} from './inject';
import {createStore} from './store';
import env from './env';

export function initApp<S extends State>(
  router: ICoreRouter,
  data: S,
  initState: (data: S) => S,
  middlewares?: IStoreMiddleware[],
  storeLogger?: IStoreLogger,
  appViewName?: string,
  preloadComponents: string[] = []
): {store: IStore<S>; AppView: EluxComponent; setup: Promise<void>} {
  MetaData.currentRouter = router;
  const store = createStore(0, router, data, initState, middlewares, storeLogger);
  router.startup(store);
  const {AppModuleName, RouteModuleName} = coreConfig;
  const {moduleGetter} = MetaData;
  const appModule = getModule(AppModuleName) as CommonModule;
  const routeModule = getModule(RouteModuleName) as CommonModule;
  const AppView: EluxComponent = appViewName ? (getComponet(AppModuleName, appViewName) as EluxComponent) : {__elux_component__: 'view'};
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

export function forkStore<T extends IStore, R extends ICoreRouteState>(originalStore: T, routeState: R): T {
  const {
    sid,
    options: {initState, middlewares, logger},
    router,
  } = originalStore;

  return createStore(sid + 1, router, {[coreConfig.RouteModuleName]: routeState}, initState, middlewares, logger) as T;
}
