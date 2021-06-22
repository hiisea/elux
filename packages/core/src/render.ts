import {MetaData, ModuleGetter, BStore, IStore} from './basic';
import {getModuleList, getComponentList, getComponet} from './inject';
import {IStoreMiddleware, enhanceStore} from './store';

const defFun: any = () => undefined;

export function defineModuleGetter(moduleGetter: ModuleGetter, appModuleName: string = 'stage') {
  MetaData.appModuleName = appModuleName;
  MetaData.moduleGetter = moduleGetter;
  if (typeof moduleGetter[appModuleName] !== 'function') {
    throw `${appModuleName} could not be found in moduleGetter`;
  }
}

export async function renderApp<ST extends BStore = BStore>(
  baseStore: ST,
  preloadModules: string[],
  preloadComponents: string[],
  middlewares?: IStoreMiddleware[],
  appViewName: string = 'main'
) {
  const {moduleGetter, appModuleName} = MetaData;
  preloadModules = preloadModules.filter((moduleName) => moduleGetter[moduleName] && moduleName !== appModuleName);
  preloadModules.unshift(appModuleName);
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  MetaData.clientStore = store;
  // 防止view中瀑布式懒加载
  const modules = await getModuleList(preloadModules);
  await getComponentList(preloadComponents);
  const appModule = modules[0].default;
  await appModule.model(store);
  const AppView = getComponet(appModuleName, appViewName);
  return {
    store,
    AppView,
  };
}

export async function ssrApp<ST extends BStore = BStore>(
  baseStore: ST,
  preloadModules: string[],
  middlewares?: IStoreMiddleware[],
  appViewName: string = 'main'
) {
  const {moduleGetter, appModuleName} = MetaData;
  preloadModules = preloadModules.filter((moduleName) => moduleGetter[moduleName] && moduleName !== appModuleName);
  preloadModules.unshift(appModuleName);
  const store = enhanceStore(baseStore, middlewares) as IStore<any> & ST;
  const [{default: appModule}, ...otherModules] = await getModuleList(preloadModules);
  await appModule.model(store);
  await Promise.all(otherModules.map((module) => module.default.model(store)));
  store.dispatch = defFun;
  const AppView = getComponet(appModuleName, appViewName);
  return {
    store,
    AppView,
  };
}
