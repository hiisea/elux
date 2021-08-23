import {EluxComponent, CommonModule, MetaData, IStore, BStore, IStoreMiddleware, ICoreRouter, coreConfig} from './basic';
import {getModule, getComponet, getModuleList, getComponentList} from './inject';
import {enhanceStore} from './store';

export function initApp<ST extends BStore = BStore>(
  router: ICoreRouter,
  baseStore: ST,
  middlewares?: IStoreMiddleware[],
  appViewName?: string,
  preloadComponents: string[] = [],
  request?: unknown,
  response?: unknown
): {store: IStore & ST; AppView: EluxComponent; setup: Promise<void>} {
  MetaData.currentRouter = router;
  const store = enhanceStore(baseStore, router, middlewares) as IStore & ST;
  router.startup(store, request, response);
  const {AppModuleName, RouteModuleName} = coreConfig;
  const {moduleGetter} = MetaData;
  const appModule = getModule(AppModuleName) as CommonModule;
  const routeModule = getModule(RouteModuleName) as CommonModule;
  const AppView: EluxComponent = appViewName ? (getComponet(AppModuleName, appViewName) as EluxComponent) : {__elux_component__: 'view'};
  // 防止view中瀑布式懒加载
  const preloadModules = Object.keys(router.routeState.params)
    .concat(Object.keys(baseStore.getState()))
    .reduce((data, moduleName) => {
      if (moduleGetter[moduleName] && moduleName !== AppModuleName && moduleName !== RouteModuleName) {
        data[moduleName] = true;
      }
      return data;
    }, {});

  const setup: Promise<void> = Promise.all([
    getModuleList(Object.keys(preloadModules)),
    getComponentList(preloadComponents),
    routeModule.model(store),
    appModule.model(store),
  ]) as any;
  return {
    store,
    AppView,
    setup,
  };
}
let ForkStoreId = 0;
export function forkStore<T extends IStore>(originalStore: T): T {
  const {
    builder: {storeCreator, storeOptions},
    options: {middlewares},
    router,
  } = originalStore;
  const {moduleGetter} = MetaData;
  const baseStore = storeCreator({...storeOptions, initState: undefined}, ++ForkStoreId);
  const store = enhanceStore(baseStore, router, middlewares) as T;
  const {AppModuleName, RouteModuleName} = coreConfig;
  const appModule = getModule(AppModuleName) as CommonModule;
  const routeModule = getModule(RouteModuleName) as CommonModule;
  const preloadModules = Object.keys(router.routeState.params).filter((moduleName) => moduleGetter[moduleName] && moduleName !== AppModuleName);
  getModuleList(preloadModules);
  routeModule.model(store);
  appModule.model(store);
  return store;
}
