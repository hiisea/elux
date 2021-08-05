import {ComponentType} from 'react';
import {RootModuleFacade} from '@elux/core';
import {setReactComponentsConfig, loadComponent, LoadComponentOptions, useRouter} from '@elux/react-components';
import {renderToString, renderToDocument} from '@elux/react-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, LocationTransform, UserConfig, GetBaseAPP} from '@elux/app';
import {createRouter, setBrowserRouteConfig} from '@elux/route-browser';

export * from '@elux/react-components';
export * from '@elux/app';

setAppConfig({loadComponent, useRouter});

export type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;

export function setConfig(
  conf: UserConfig & {enableMultiPage?: boolean; LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
  setBrowserRouteConfig(conf);
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
