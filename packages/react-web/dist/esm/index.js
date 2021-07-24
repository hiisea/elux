import { renderToString, renderToDocument, setReactComponentsConfig, loadComponent } from '@elux/react-components';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter } from '@elux/route-browser';
export * from '@elux/react-components';
export * from '@elux/app';
setAppConfig({
  loadComponent: loadComponent,
  MutableData: false
});
export function setConfig(conf) {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}
export var createApp = function createApp(moduleGetter, middlewares, appModuleName) {
  return createBaseApp({}, function (locationTransform) {
    return createRouter('Browser', locationTransform);
  }, renderToDocument, moduleGetter, middlewares, appModuleName);
};
export var createSSR = function createSSR(moduleGetter, url, middlewares, appModuleName) {
  return createBaseSSR({}, function (locationTransform) {
    return createRouter(url, locationTransform);
  }, renderToString, moduleGetter, middlewares, appModuleName);
};