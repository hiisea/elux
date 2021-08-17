import {ComponentType} from 'react';
import {RootModuleFacade} from '@elux/core';
import {setReactComponentsConfig, loadComponent, LoadComponentOptions, useRouter} from '@elux/react-components';
import {renderToString, renderToDocument} from '@elux/react-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, LocationTransform, UserConfig, GetBaseAPP} from '@elux/app';
import {createRouter} from '@elux/route-browser';

export * from '@elux/react-components';
export * from '@elux/app';

setAppConfig({loadComponent, useRouter});

export type GetApp<A extends RootModuleFacade, R extends string = 'route'> = GetBaseAPP<A, LoadComponentOptions, R>;

export function setConfig(
  conf: UserConfig & {LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}

export const createApp: CreateApp = (moduleGetter, middlewares) => {
  return createBaseApp(
    {},
    (locationTransform: LocationTransform) => createRouter('Browser', locationTransform),
    renderToDocument,
    moduleGetter,
    middlewares
  );
};
export const createSSR: CreateSSR = (moduleGetter, url, middlewares) => {
  return createBaseSSR({}, (locationTransform: LocationTransform) => createRouter(url, locationTransform), renderToString, moduleGetter, middlewares);
};
