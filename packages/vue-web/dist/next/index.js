import { createSSRApp, createApp as createVue } from 'vue';
import { setCoreConfig, defineModuleGetter } from '@elux/core';
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
  defineModuleGetter(moduleGetter);
  const url = ['n:/', location.pathname, location.search].join('');
  const app = createVue(Router);
  const router = createRouter(url, {});
  return createBaseApp(app, router, renderToDocument, middlewares);
};
export const createSSR = (moduleGetter, url, nativeData, middlewares) => {
  defineModuleGetter(moduleGetter);
  const app = createSSRApp(Router);
  const router = createRouter('n:/' + url, nativeData);
  return createBaseSSR(app, router, renderToString, middlewares);
};