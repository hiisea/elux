import {Component, createSSRApp, createApp as createVue} from 'vue';
import type {App} from 'vue';
import {RootModuleFacade, setCoreConfig} from '@elux/core';
import {setVueComponentsConfig, loadComponent, LoadComponentOptions, useRouter, useStore} from '@elux/vue-components';
import {renderToString, renderToDocument, Router} from '@elux/vue-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, LocationTransform, UserConfig, GetBaseAPP} from '@elux/app';
import {createRouter} from '@elux/route-browser';

export {DocumentHead, Switch, Else, Link, loadComponent} from '@elux/vue-components';
export * from '@elux/app';

setCoreConfig({MutableData: true});
setAppConfig({loadComponent, useRouter, useStore});

declare const location: {pathname: string; search: string; hash: string};
export type GetApp<A extends RootModuleFacade, R extends string = 'route', NT = unknown> = GetBaseAPP<A, LoadComponentOptions, R, NT>;

export function setConfig(conf: UserConfig & {LoadComponentOnError?: Component<{message: string}>; LoadComponentOnLoading?: Component<{}>}): void {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}

export const createApp: CreateApp<App> = (moduleGetter, middlewares) => {
  const url = [location.pathname, location.search, location.hash].join('');
  const app = createVue(Router);
  return createBaseApp(
    app,
    (locationTransform: LocationTransform) => createRouter(url, locationTransform, {}),
    renderToDocument,
    moduleGetter,
    middlewares
  );
};
export const createSSR: CreateSSR<App> = (moduleGetter, url, nativeData, middlewares) => {
  const app = createSSRApp(Router);
  return createBaseSSR(
    app,
    (locationTransform: LocationTransform) => createRouter(url, locationTransform, nativeData),
    renderToString,
    moduleGetter,
    middlewares
  );
};
