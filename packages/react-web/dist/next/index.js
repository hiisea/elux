import { defineModuleGetter } from '@elux/core';
import { setReactComponentsConfig, loadComponent, useRouter } from '@elux/react-components';
import { renderToString, renderToDocument } from '@elux/react-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter, createBrowserHistory, createServerHistory } from '@elux/route-browser';
import { Provider, useStore } from '@elux/react-redux';
export { DocumentHead, Switch, Else, Link } from '@elux/react-components';
export { errorAction, LoadingState, env, effect, reducer, setLoading, effectLogger, isServer, deepMerge, exportModule, exportView, exportComponent, modelHotReplacement, EmptyModel, BaseModel, RouteModel, loadModel, getModule, getComponent } from '@elux/core';
export { location, createRouteModule, safeJsonParse } from '@elux/route';
export { getApi, patchActions } from '@elux/app';
export { connectRedux, shallowEqual, useSelector, createSelectorHook } from '@elux/react-redux';
setAppConfig({
  loadComponent,
  useRouter,
  useStore: useStore
});
setReactComponentsConfig({
  Provider: Provider,
  useStore: useStore
});
export function setConfig(conf) {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}
export function createApp(moduleGetter, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  const history = createBrowserHistory();
  const router = createRouter(history, {});
  return createBaseApp({}, router, renderToDocument, data => data, storeMiddlewares, storeLogger);
}
export function createSSR(moduleGetter, url, nativeData, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  const history = createServerHistory(url);
  const router = createRouter(history, nativeData);
  return createBaseSSR({}, router, renderToString, data => data, storeMiddlewares, storeLogger);
}