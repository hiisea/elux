import { defineModuleGetter } from '@elux/core';
import { setReactComponentsConfig, loadComponent, useRouter } from '@elux/react-components';
import { renderToString, renderToDocument } from '@elux/react-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter, createBrowserHistory, createServerHistory } from '@elux/route-browser';
export { DocumentHead, Switch, Else, Link, loadComponent } from '@elux/react-components';
export * from '@elux/app';
setAppConfig({
  loadComponent,
  useRouter
});
export function setConfig(conf) {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}
export const createApp = (moduleGetter, middlewares) => {
  defineModuleGetter(moduleGetter);
  const history = createBrowserHistory();
  const router = createRouter(history, {});
  return createBaseApp({}, router, renderToDocument, middlewares);
};
export const createSSR = (moduleGetter, url, nativeData, middlewares) => {
  defineModuleGetter(moduleGetter);
  const history = createServerHistory(url);
  const router = createRouter(history, nativeData);
  return createBaseSSR({}, router, renderToString, middlewares);
};