import { setReactComponentsConfig, loadComponent, useRouter } from '@elux/react-components';
import { renderToString, renderToDocument } from '@elux/react-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter, setBrowserRouteConfig } from '@elux/route-browser';
export * from '@elux/react-components';
export * from '@elux/app';
setAppConfig({
  loadComponent,
  useRouter
});
export function setConfig(conf) {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
  setBrowserRouteConfig(conf);
}
export const createApp = (moduleGetter, middlewares) => {
  return createBaseApp({}, locationTransform => createRouter('Browser', locationTransform), renderToDocument, moduleGetter, middlewares);
};
export const createSSR = (moduleGetter, url, middlewares) => {
  return createBaseSSR({}, locationTransform => createRouter(url, locationTransform), renderToString, moduleGetter, middlewares);
};