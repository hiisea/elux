import { defineModuleGetter } from '@elux/core';
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
  defineModuleGetter(moduleGetter);
  var url = ['n:/', location.pathname, location.search].join('');
  var router = createRouter(url, {});
  return createBaseApp({}, router, renderToDocument, middlewares);
};
export var createSSR = function createSSR(moduleGetter, url, nativeData, middlewares) {
  defineModuleGetter(moduleGetter);
  var router = createRouter('n:/' + url, nativeData);
  return createBaseSSR({}, router, renderToString, middlewares);
};