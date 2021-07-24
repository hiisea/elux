import {ComponentType} from 'react';
import {renderToString, renderToDocument, setReactComponentsConfig, loadComponent} from '@elux/react-components';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, LocationTransform, UserConfig} from '@elux/app';
import {createRouter} from '@elux/route-browser';

export * from '@elux/react-components';
export * from '@elux/app';

setAppConfig({loadComponent, MutableData: false});

export function setConfig(
  conf: UserConfig & {LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
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
