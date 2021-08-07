import _extends from "@babel/runtime/helpers/esm/extends";
import { MetaData } from './basic';
import { getModuleList, getComponentList, getComponet, getModule } from './inject';
import { enhanceStore } from './store';
export function defineModuleGetter(moduleGetter, appModuleName, routeModuleName) {
  if (appModuleName === void 0) {
    appModuleName = 'stage';
  }

  if (routeModuleName === void 0) {
    routeModuleName = 'route';
  }

  MetaData.appModuleName = appModuleName;
  MetaData.routeModuleName = routeModuleName;
  MetaData.moduleGetter = moduleGetter;

  if (!moduleGetter[appModuleName]) {
    throw appModuleName + " module not found in moduleGetter";
  }

  if (!moduleGetter[routeModuleName]) {
    throw routeModuleName + " module not found in moduleGetter";
  }
}
export function forkStore(originalStore, initState) {
  var _originalStore$baseFo = originalStore.baseFork,
      creator = _originalStore$baseFo.creator,
      options = _originalStore$baseFo.options,
      middlewares = originalStore.fork.middlewares,
      router = originalStore.router,
      id = originalStore.id;
  var baseStore = creator(_extends({}, options, {
    initState: initState
  }), router, id + 1);

  var _renderApp = renderApp(router, baseStore, middlewares),
      store = _renderApp.store;

  return store;
}
export function renderApp(router, baseStore, middlewares, appViewName, preloadComponents) {
  if (preloadComponents === void 0) {
    preloadComponents = [];
  }

  var store = enhanceStore(baseStore, middlewares);
  store.id === 0 && router.init(store);
  var moduleGetter = MetaData.moduleGetter,
      appModuleName = MetaData.appModuleName;
  var routeModuleName = MetaData.routeModuleName;
  var appModule = getModule(appModuleName);
  var routeModule = getModule(routeModuleName);
  var AppView = appViewName ? getComponet(appModuleName, appViewName) : {
    __elux_component__: 'view'
  };
  var preloadModules = [].concat(Object.keys(baseStore.getState()), Object.keys(router.getParams()));
  preloadModules = preloadModules.filter(function (moduleName) {
    return moduleGetter[moduleName] && moduleName !== appModuleName && moduleName !== routeModuleName;
  });
  var promiseList = [routeModule.model(store), appModule.model(store)];
  promiseList.concat(getModuleList(preloadModules), getComponentList(preloadComponents));
  var setup = Promise.all(promiseList);
  return {
    store: store,
    AppView: AppView,
    setup: setup
  };
}