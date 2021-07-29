import {MetaData, ModuleGetter, BStore, IStore, EluxComponent, CommonModule, IStoreMiddleware} from './basic';
import {getModuleList, getComponentList, getComponet} from './inject';
import {enhanceStore} from './store';

const defFun: any = () => undefined;

export function defineModuleGetter(moduleGetter: ModuleGetter, appModuleName = 'stage'): void {
  MetaData.appModuleName = appModuleName;
  MetaData.moduleGetter = moduleGetter;
  if (!moduleGetter[appModuleName]) {
    throw `${appModuleName} could not be found in moduleGetter`;
  }
}

export async function renderApp<ST extends BStore = BStore>(
  baseStore: ST,
  preloadModules: string[],
  preloadComponents: string[],
  middlewares?: IStoreMiddleware[],
  appViewName = 'main'
): Promise<{store: IStore<any> & ST; AppView: EluxComponent}> {
  const {moduleGetter, appModuleName} = MetaData;
  preloadModules = preloadModules.filter((moduleName) => moduleGetter[moduleName] && moduleName !== appModuleName);
  preloadModules.unshift(appModuleName);
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  // 防止view中瀑布式懒加载
  const modules = await getModuleList(preloadModules);
  await getComponentList(preloadComponents);
  const appModule = modules[0];
  await appModule.model(store);
  const AppView = getComponet(appModuleName, appViewName) as EluxComponent;
  return {
    store,
    AppView,
  };
}

export function initApp<ST extends BStore = BStore>(baseStore: ST, middlewares?: IStoreMiddleware[]): IStore<any> & ST {
  const {moduleGetter, appModuleName} = MetaData;
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  const appModule = moduleGetter[appModuleName]() as CommonModule<string>;
  appModule.model(store);
  return store;
}

export async function ssrApp<ST extends BStore = BStore>(
  baseStore: ST,
  preloadModules: string[],
  middlewares?: IStoreMiddleware[],
  appViewName = 'main'
): Promise<{store: IStore<any> & ST; AppView: EluxComponent}> {
  const {moduleGetter, appModuleName} = MetaData;
  preloadModules = preloadModules.filter((moduleName) => moduleGetter[moduleName] && moduleName !== appModuleName);
  preloadModules.unshift(appModuleName);
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  const [appModule, ...otherModules] = await getModuleList(preloadModules);
  await appModule.model(store);
  await Promise.all(otherModules.map((module) => module.model(store)));
  store.dispatch = defFun;
  const AppView = getComponet(appModuleName, appViewName) as EluxComponent;
  return {
    store,
    AppView,
  };
}
