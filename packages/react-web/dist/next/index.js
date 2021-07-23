import { renderToString, renderToDocument, setLoadComponentOptions } from '@elux/react-components';
import { createBaseApp, createBaseSSR, setBaseConfig } from '@elux/app';
import { createRouter } from '@elux/route-browser';
export * from '@elux/react-components';
export * from '@elux/app';
export function setConfig(conf) {
  setLoadComponentOptions(conf);
  setBaseConfig(conf);
}
export const createApp = (moduleGetter, middlewares, appModuleName) => {
  return createBaseApp({}, locationTransform => createRouter('Browser', locationTransform), renderToDocument, moduleGetter, middlewares, appModuleName);
};
export const createSSR = (moduleGetter, url, middlewares, appModuleName) => {
  return createBaseSSR({}, locationTransform => createRouter(url, locationTransform), renderToString, moduleGetter, middlewares, appModuleName);
};