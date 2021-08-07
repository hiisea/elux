import { MetaData } from './basic';
import { getModuleList, getComponentList, getComponet, getModule } from './inject';
import { enhanceStore } from './store';
export function defineModuleGetter(moduleGetter, appModuleName = 'stage', routeModuleName = 'route') {
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
export function forkStore(originalStore, initState) {
  const {
    baseFork: {
      creator,
      options
    },
    fork: {
      middlewares
    },
    router,
    id
  } = originalStore;
  const baseStore = creator({ ...options,
    initState
  }, router, id + 1);
  const {
    store
  } = renderApp(router, baseStore, middlewares);
  return store;
}
export function renderApp(router, baseStore, middlewares, appViewName, preloadComponents = []) {
  const store = enhanceStore(baseStore, middlewares);
  store.id === 0 && router.init(store);
  const {
    moduleGetter,
    appModuleName
  } = MetaData;
  const routeModuleName = MetaData.routeModuleName;
  const appModule = getModule(appModuleName);
  const routeModule = getModule(routeModuleName);
  const AppView = appViewName ? getComponet(appModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  let preloadModules = [...Object.keys(baseStore.getState()), ...Object.keys(router.getParams())];
  preloadModules = preloadModules.filter(moduleName => moduleGetter[moduleName] && moduleName !== appModuleName && moduleName !== routeModuleName);
  const promiseList = [routeModule.model(store), appModule.model(store)];
  promiseList.concat(getModuleList(preloadModules), getComponentList(preloadComponents));
  const setup = Promise.all(promiseList);
  return {
    store,
    AppView,
    setup
  };
}