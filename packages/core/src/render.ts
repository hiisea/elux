import {MetaData, ModuleGetter, BStore, IStore, EluxComponent, CommonModule, IStoreMiddleware, ICoreRouter} from './basic';
import {getModuleList, getComponentList, getComponet, getModule} from './inject';
import {enhanceStore} from './store';

export function defineModuleGetter(moduleGetter: ModuleGetter, appModuleName = 'stage', routeModuleName = 'route'): void {
  MetaData.appModuleName = appModuleName;
  MetaData.routeModuleName = routeModuleName;
  MetaData.moduleGetter = moduleGetter;
  if (!moduleGetter[appModuleName]) {
    throw `${appModuleName} module not found in moduleGetter`;
  }
  if (!moduleGetter[routeModuleName]) {
    throw `${routeModuleName} module not found in moduleGetter`;
  }
}

export function forkStore<T extends IStore>(originalStore: T, initState: Record<string, any>): T {
  const {
    baseFork: {creator, options},
    fork: {middlewares},
    router,
    id,
  } = originalStore;
  const baseStore = creator({...options, initState}, router, id + 1);
  const {store} = initApp(router, baseStore, middlewares);
  return store as T;
}

export function initApp<ST extends BStore = BStore>(
  router: ICoreRouter,
  baseStore: ST,
  middlewares?: IStoreMiddleware[],
  appViewName?: string,
  preloadComponents: string[] = []
): {store: IStore & ST; AppView: EluxComponent; setup: Promise<void>} {
  MetaData.currentRouter = router;
  const store = enhanceStore(baseStore, middlewares) as IStore & ST;
  store.id === 0 && router.init(store);
  const {moduleGetter, appModuleName} = MetaData;
  const routeModuleName = MetaData.routeModuleName;
  const appModule = getModule(appModuleName) as CommonModule;
  const routeModule = getModule(routeModuleName) as CommonModule;
  const AppView: EluxComponent = appViewName ? (getComponet(appModuleName, appViewName) as EluxComponent) : {__elux_component__: 'view'};
  // 防止view中瀑布式懒加载
  let preloadModules = [...Object.keys(baseStore.getState()), ...Object.keys(router.getParams())];
  preloadModules = preloadModules.filter((moduleName) => moduleGetter[moduleName] && moduleName !== appModuleName && moduleName !== routeModuleName);
  const promiseList: any[] = [routeModule.model(store), appModule.model(store)];
  promiseList.concat(getModuleList(preloadModules), getComponentList(preloadComponents));
  const setup: Promise<void> = Promise.all(promiseList) as any;
  return {
    store,
    AppView,
    setup,
  };
}

// export function initApp<ST extends BStore = BStore>(router: ICoreRouter, baseStore: ST, middlewares?: IStoreMiddleware[]): IStore & ST {
//   const {moduleGetter, appModuleName} = MetaData;
//   const store = enhanceStore(baseStore, middlewares) as IStore & ST;
//   router.init(store);
//   const routeModule = moduleGetter[MetaData.routeModuleName]() as CommonModule;
//   routeModule.model(store);
//   const appModule = moduleGetter[appModuleName]() as CommonModule;
//   appModule.model(store);
//   return store;
// }

// export async function ssrApp<ST extends BStore = BStore>(
//   router: ICoreRouter,
//   baseStore: ST,
//   middlewares?: IStoreMiddleware[],
//   appViewName = 'main'
// ): Promise<{store: IStore & ST; AppView: EluxComponent}> {
//   const store = enhanceStore(baseStore, middlewares) as IStore & ST;
//   router.init(store);
//   const {moduleGetter, appModuleName} = MetaData;
//   const routeModuleName = MetaData.routeModuleName;
//   const appModule = getModule(appModuleName) as CommonModule;
//   const routeModule = getModule(routeModuleName) as CommonModule;
//   const AppView = getComponet(appModuleName, appViewName) as EluxComponent;

//   let preloadModules = [...Object.keys(baseStore.getState()), ...Object.keys(router.getParams())];
//   preloadModules = preloadModules.filter((moduleName) => moduleGetter[moduleName] && moduleName !== appModuleName && moduleName !== routeModuleName);
//   preloadModules.unshift(appModuleName);

//   const [appModule, ...otherModules] = await getModuleList(preloadModules);
//   await appModule.model(store);
//   await Promise.all(otherModules.map((module) => module.model(store)));
//   store.dispatch = defFun;
//   const AppView = getComponet(appModuleName, appViewName) as EluxComponent;
//   return {
//     store,
//     AppView,
//   };
// }
