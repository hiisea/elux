import { setReactComponentsConfig, loadComponent, useRouter } from '@elux/react-components';
import { renderToString, renderToDocument } from '@elux/react-components/stage';
import { createBaseApp, createBaseSSR, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter } from '@elux/route-browser';
export * from '@elux/react-components';
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
  return createBaseApp({}, locationTransform => createRouter('Browser', locationTransform), renderToDocument, moduleGetter, middlewares);
};
export const createSSR = (moduleGetter, request, response, middlewares) => {
  return createBaseSSR({}, locationTransform => createRouter(request.url, locationTransform), renderToString, moduleGetter, middlewares, request, response);
};