import { createSSRApp, createApp as createVue } from 'vue';
import { setCoreConfig } from '@elux/core';
import { setVueComponentsConfig, loadComponent, useRouter, useStore } from '@elux/vue-components';
import { renderToString, renderToDocument, Router } from '@elux/vue-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter } from '@elux/route-browser';
export { DocumentHead, Switch, Else, Link, loadComponent } from '@elux/vue-components';
export * from '@elux/app';
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
export const createApp = (moduleGetter, middlewares) => {
  const url = [location.pathname, location.search, location.hash].join('');
  const app = createVue(Router);
  return createBaseApp(app, locationTransform => createRouter(url, locationTransform, {}), renderToDocument, moduleGetter, middlewares);
};
export const createSSR = (moduleGetter, url, nativeData, middlewares) => {
  const app = createSSRApp(Router);
  return createBaseSSR(app, locationTransform => createRouter(url, locationTransform, nativeData), renderToString, moduleGetter, middlewares);
};