import { createSSRApp, createApp as createVue, reactive } from 'vue';
import { setCoreConfig, defineModuleGetter } from '@elux/core';
import { setVueComponentsConfig, loadComponent, useRouter, useStore } from '@elux/vue-components';
import { renderToString, renderToDocument, Router } from '@elux/vue-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter, createBrowserHistory, createServerHistory } from '@elux/route-browser';
export { DocumentHead, Switch, Else, Link } from '@elux/vue-components';
export { errorAction, LoadingState, env, effect, reducer, setLoading, effectLogger, isServer, deepMerge, exportModule, exportView, exportComponent, modelHotReplacement, EmptyModel, BaseModel, loadModel, getModule, getComponent } from '@elux/core';
export { location, createRouteModule, routeJsonParse } from '@elux/route';
export { getApi } from '@elux/app';
setCoreConfig({
  MutableData: true
});
setAppConfig({
  loadComponent,
  useRouter,
  useStore
});
export function setConfig(conf) {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}
export function createApp(moduleGetter, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  const app = createVue(Router);
  const history = createBrowserHistory();
  const router = createRouter(history, {});
  return createBaseApp(app, router, renderToDocument, reactive, storeMiddlewares, storeLogger);
}
export function createSSR(moduleGetter, url, nativeData, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  const app = createSSRApp(Router);
  const history = createServerHistory(url);
  const router = createRouter(history, nativeData);
  return createBaseSSR(app, router, renderToString, reactive, storeMiddlewares, storeLogger);
}