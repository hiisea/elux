import {ComponentType} from 'react';
import {renderToString, renderToDocument, setLoadComponentOptions} from '@elux/react-components';
import {createBaseApp, createBaseSSR, setBaseConfig, CreateApp, CreateSSR, LocationTransform, BaseConfig} from '@elux/app';
import {createRouter} from '@elux/route-browser';

export * from '@elux/react-components';
export * from '@elux/app';

export function setConfig(
  conf: BaseConfig & {LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setLoadComponentOptions(conf);
  setBaseConfig(conf);
}

export const createApp: CreateApp = (moduleGetter, middlewares, appModuleName) => {
  return createBaseApp(
    {},
    (locationTransform: LocationTransform) => createRouter('Browser', locationTransform),
    renderToDocument,
    moduleGetter,
    middlewares,
    appModuleName
  );
};
export const createSSR: CreateSSR = (moduleGetter, url, middlewares, appModuleName) => {
  return createBaseSSR(
    {},
    (locationTransform: LocationTransform) => createRouter(url, locationTransform),
    renderToString,
    moduleGetter,
    middlewares,
    appModuleName
  );
};
