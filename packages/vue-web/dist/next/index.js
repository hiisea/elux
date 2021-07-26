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
  loadComponent
});
export function setConfig(conf) {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}
export const createApp = (moduleGetter, middlewares, appModuleName) => {
  const app = createVue(RootComponent);
  return createBaseApp(app, locationTransform => createRouter('Browser', locationTransform), renderToDocument, moduleGetter, middlewares, appModuleName);
};
export const createSSR = (moduleGetter, url, middlewares, appModuleName) => {
  const app = createSSRApp(RootComponent);
  return createBaseSSR(app, locationTransform => createRouter(url, locationTransform), renderToString, moduleGetter, middlewares, appModuleName);
};