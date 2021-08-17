import { setReactComponentsConfig, loadComponent, useRouter } from '@elux/react-components';
import { renderToString, renderToDocument } from '@elux/react-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter } from '@elux/route-browser';
export * from '@elux/react-components';
export * from '@elux/app';
setAppConfig({
  loadComponent: loadComponent,
  useRouter: useRouter
});
export function setConfig(conf) {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}
export var createApp = function createApp(moduleGetter, middlewares) {
  return createBaseApp({}, function (locationTransform) {
    return createRouter('Browser', locationTransform);
  }, renderToDocument, moduleGetter, middlewares);
};
export var createSSR = function createSSR(moduleGetter, url, middlewares) {
  return createBaseSSR({}, function (locationTransform) {
    return createRouter(url, locationTransform);
  }, renderToString, moduleGetter, middlewares);
};