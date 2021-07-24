import { renderToString, renderToDocument, setReactComponentsConfig, loadComponent } from '@elux/react-components';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter } from '@elux/route-browser';
export * from '@elux/react-components';
export * from '@elux/app';
setAppConfig({
  loadComponent,
  MutableData: false
});
export function setConfig(conf) {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}
export const createApp = (moduleGetter, middlewares, appModuleName) => {
  return createBaseApp({}, locationTransform => createRouter('Browser', locationTransform), renderToDocument, moduleGetter, middlewares, appModuleName);
};
export const createSSR = (moduleGetter, url, middlewares, appModuleName) => {
  return createBaseSSR({}, locationTransform => createRouter(url, locationTransform), renderToString, moduleGetter, middlewares, appModuleName);
};