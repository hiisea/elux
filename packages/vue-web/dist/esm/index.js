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
  loadComponent: loadComponent,
  useRouter: useRouter,
  useStore: useStore
});
export function setConfig(conf) {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}
export var createApp = function createApp(moduleGetter, middlewares) {
  defineModuleGetter(moduleGetter);
  var url = ['n:/', location.pathname, location.search].join('');
  var app = createVue(Router);
  var router = createRouter(url, {});
  return createBaseApp(app, router, renderToDocument, middlewares);
};
export var createSSR = function createSSR(moduleGetter, url, nativeData, middlewares) {
  defineModuleGetter(moduleGetter);
  var app = createSSRApp(Router);
  var router = createRouter('n:/' + url, nativeData);
  return createBaseSSR(app, router, renderToString, middlewares);
};