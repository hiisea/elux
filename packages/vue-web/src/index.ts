import {Component, createSSRApp, createApp as createVue} from 'vue';
import type {App} from 'vue';
import {RootModuleFacade, setCoreConfig, defineModuleGetter} from '@elux/core';
import {setVueComponentsConfig, loadComponent, LoadComponentOptions, useRouter, useStore} from '@elux/vue-components';
import {renderToString, renderToDocument, Router} from '@elux/vue-components/stage';
import {createBaseApp, createBaseSSR, setAppConfig, setUserConfig, CreateApp, CreateSSR, UserConfig, GetBaseAPP} from '@elux/app';
import {createRouter, LocationData} from '@elux/route-browser';

export {DocumentHead, Switch, Else, Link, loadComponent} from '@elux/vue-components';
export * from '@elux/app';

setCoreConfig({MutableData: true});
setAppConfig({loadComponent, useRouter, useStore});

declare const location: LocationData;
export type GetApp<A extends RootModuleFacade, R extends string = 'route', NT = unknown> = GetBaseAPP<A, LoadComponentOptions, R, NT>;

export function setConfig(conf: UserConfig & {LoadComponentOnError?: Component<{message: string}>; LoadComponentOnLoading?: Component<{}>}): void {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}

export const createApp: CreateApp<App> = (moduleGetter, middlewares) => {
  defineModuleGetter(moduleGetter);
  const url = ['n:/', location.pathname, location.search].join('');
  const app = createVue(Router);
  const router = createRouter(url, {});
  return createBaseApp(app, router, renderToDocument, middlewares);
};
export const createSSR: CreateSSR<App> = (moduleGetter, url, nativeData, middlewares) => {
  defineModuleGetter(moduleGetter);
  const app = createSSRApp(Router);
  const router = createRouter('n:/' + url, nativeData);
  return createBaseSSR(app, router, renderToString, middlewares);
};
