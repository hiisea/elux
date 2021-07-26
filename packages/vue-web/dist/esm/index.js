import { createSSRApp, createApp as createVue } from 'vue';
import { setCoreConfig } from '@elux/core';
import { setVueComponentsConfig, loadComponent } from '@elux/vue-components';
import { renderToString, renderToDocument, RootComponent } from '@elux/vue-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter } from '@elux/route-browser';
export * from '@elux/vue-components';
export * from '@elux/app';
setCoreConfig({
  MutableData: true
});
setAppConfig({
  loadComponent: loadComponent
});
export function setConfig(conf) {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}
export var createApp = function createApp(moduleGetter, middlewares, appModuleName) {
  var app = createVue(RootComponent);
  return createBaseApp(app, function (locationTransform) {
    return createRouter('Browser', locationTransform);
  }, renderToDocument, moduleGetter, middlewares, appModuleName);
};
export var createSSR = function createSSR(moduleGetter, url, middlewares, appModuleName) {
  var app = createSSRApp(RootComponent);
  return createBaseSSR(app, function (locationTransform) {
    return createRouter(url, locationTransform);
  }, renderToString, moduleGetter, middlewares, appModuleName);
};