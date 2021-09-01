import { setReactComponentsConfig, loadComponent, useRouter } from '@elux/react-components';
import { renderToString, renderToDocument } from '@elux/react-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter } from '@elux/route-browser';
export { DocumentHead, Switch, Else, Link, loadComponent } from '@elux/react-components';
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
  var url = [location.pathname, location.search, location.hash].join('');
  return createBaseApp({}, function (locationTransform) {
    return createRouter(url, locationTransform, {});
  }, renderToDocument, moduleGetter, middlewares);
};
export var createSSR = function createSSR(moduleGetter, url, nativeData, middlewares) {
  return createBaseSSR({}, function (locationTransform) {
    return createRouter(url, locationTransform, nativeData);
  }, renderToString, moduleGetter, middlewares);
};