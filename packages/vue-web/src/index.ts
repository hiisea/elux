import {Component, createSSRApp, createApp as createVue} from 'vue';
import type {App} from 'vue';
import {RootModuleFacade, setCoreConfig} from '@elux/core';
import {setVueComponentsConfig, loadComponent, LoadComponentOptions, useRouter} from '@elux/vue-components';
import {renderToString, renderToDocument, Router} from '@elux/vue-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, LocationTransform, UserConfig, GetBaseAPP} from '@elux/app';
import {createRouter} from '@elux/route-browser';

export * from '@elux/vue-components';
export * from '@elux/app';

setCoreConfig({MutableData: true});
setAppConfig({loadComponent, useRouter});

export type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;

export function setConfig(conf: UserConfig & {LoadComponentOnError?: Component<{message: string}>; LoadComponentOnLoading?: Component<{}>}): void {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}

export const createApp: CreateApp<App> = (moduleGetter, middlewares, appModuleName) => {
  const app = createVue(Router);
  return createBaseApp(
    app,
    (locationTransform: LocationTransform) => createRouter('Browser', locationTransform),
    renderToDocument,
    moduleGetter,
    middlewares,
    appModuleName
  );
};
export const createSSR: CreateSSR<App> = (moduleGetter, url, middlewares, appModuleName) => {
  const app = createSSRApp(Router);
  return createBaseSSR(
    app,
    (locationTransform: LocationTransform) => createRouter(url, locationTransform),
    renderToString,
    moduleGetter,
    middlewares,
    appModuleName
  );
};
