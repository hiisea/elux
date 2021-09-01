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
  loadComponent: loadComponent,
  useRouter: useRouter,
  useStore: useStore
});
export function setConfig(conf) {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}
export var createApp = function createApp(moduleGetter, middlewares) {
  var url = [location.pathname, location.search, location.hash].join('');
  var app = createVue(Router);
  return createBaseApp(app, function (locationTransform) {
    return createRouter(url, locationTransform, {});
  }, renderToDocument, moduleGetter, middlewares);
};
export var createSSR = function createSSR(moduleGetter, url, nativeData, middlewares) {
  var app = createSSRApp(Router);
  return createBaseSSR(app, function (locationTransform) {
    return createRouter(url, locationTransform, nativeData);
  }, renderToString, moduleGetter, middlewares);
};