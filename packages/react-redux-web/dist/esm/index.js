import { defineModuleGetter } from '@elux/core';
import { setReactComponentsConfig, loadComponent, useRouter } from '@elux/react-components';
import { renderToString, renderToDocument } from '@elux/react-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter, createBrowserHistory, createServerHistory } from '@elux/route-browser';
import { Provider, useStore } from '@elux/react-redux';
export { DocumentHead, Switch, Else, Link, loadComponent } from '@elux/react-components';
export * from '@elux/app';
export * from '@elux/react-redux';
setAppConfig({
  loadComponent: loadComponent,
  useRouter: useRouter,
  useStore: useStore
});
setReactComponentsConfig({
  Provider: Provider,
  useStore: useStore
});
export function setConfig(conf) {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}
export var createApp = function createApp(moduleGetter, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  var history = createBrowserHistory();
  var router = createRouter(history, {});
  return createBaseApp({}, router, renderToDocument, function (data) {
    return data;
  }, storeMiddlewares, storeLogger);
};
export var createSSR = function createSSR(moduleGetter, url, nativeData, storeMiddlewares, storeLogger) {
  defineModuleGetter(moduleGetter);
  var history = createServerHistory(url);
  var router = createRouter(history, nativeData);
  return createBaseSSR({}, router, renderToString, function (data) {
    return data;
  }, storeMiddlewares, storeLogger);
};