import {ComponentType} from 'react';
import {RootModuleFacade, defineModuleGetter} from '@elux/core';
import {setReactComponentsConfig, loadComponent, LoadComponentOptions, useRouter} from '@elux/react-components';
import {renderToString, renderToDocument} from '@elux/react-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, UserConfig, GetBaseAPP} from '@elux/app';
import {createRouter, createBrowserHistory, createServerHistory} from '@elux/route-browser';
import {Provider, useStore} from '@elux/react-redux';

export {DocumentHead, Switch, Else, Link, loadComponent} from '@elux/react-components';
export type {DocumentHeadProps, SwitchProps, ElseProps, LinkProps, LoadComponentOptions} from '@elux/react-components';

export * from '@elux/app';
export * from '@elux/react-redux';

setAppConfig({loadComponent, useRouter, useStore: useStore as any});
setReactComponentsConfig({Provider: Provider as any, useStore: useStore as any});

/*** @public */
export type GetApp<A extends RootModuleFacade, R extends string = 'route', NT = unknown> = GetBaseAPP<A, LoadComponentOptions, R, NT>;

/*** @public */
export function setConfig(
  conf: UserConfig & {LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}

/*** @internal */
export const createApp: CreateApp<{}> = (moduleGetter, storeMiddlewares, storeLogger) => {
  defineModuleGetter(moduleGetter);
  const history = createBrowserHistory();
  const router = createRouter(history, {});
  return createBaseApp({}, router, renderToDocument, (data) => data, storeMiddlewares, storeLogger);
};

/*** @internal */
export const createSSR: CreateSSR<{}> = (moduleGetter, url, nativeData, storeMiddlewares, storeLogger) => {
  defineModuleGetter(moduleGetter);
  const history = createServerHistory(url);
  const router = createRouter(history, nativeData);
  return createBaseSSR({}, router, renderToString, (data) => data, storeMiddlewares, storeLogger);
};
