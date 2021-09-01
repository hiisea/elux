import {ComponentType} from 'react';
import {RootModuleFacade} from '@elux/core';
import {setReactComponentsConfig, loadComponent, LoadComponentOptions, useRouter} from '@elux/react-components';
import {renderToString, renderToDocument} from '@elux/react-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, LocationTransform, UserConfig, GetBaseAPP} from '@elux/app';
import {createRouter} from '@elux/route-browser';

export {DocumentHead, Switch, Else, Link, loadComponent} from '@elux/react-components';
export * from '@elux/app';

setAppConfig({loadComponent, useRouter});

declare const location: {pathname: string; search: string; hash: string};
export type GetApp<A extends RootModuleFacade, R extends string = 'route', NT = unknown> = GetBaseAPP<A, LoadComponentOptions, R, NT>;

export function setConfig(
  conf: UserConfig & {LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}

export const createApp: CreateApp = (moduleGetter, middlewares) => {
  const url = [location.pathname, location.search, location.hash].join('');
  return createBaseApp(
    {},
    (locationTransform: LocationTransform) => createRouter(url, locationTransform, {}),
    renderToDocument,
    moduleGetter,
    middlewares
  );
};
export const createSSR: CreateSSR = (moduleGetter, url, nativeData, middlewares) => {
  return createBaseSSR(
    {},
    (locationTransform: LocationTransform) => createRouter(url, locationTransform, nativeData),
    renderToString,
    moduleGetter,
    middlewares
  );
};
