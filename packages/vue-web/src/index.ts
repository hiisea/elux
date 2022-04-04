import {createSSRApp, createApp as createCSRApp} from 'vue';
import {buildApp, buildSSR, NativeRequest} from '@elux/core';
import {createClientRouter, createServerRouter} from '@elux/route-browser';
import {AppConfig} from '@elux/app';
import {RouterComponent} from '@elux/vue-components';

export {DocumentHead, Switch, Else, Link} from '@elux/vue-components';
export type {DocumentHeadProps, SwitchProps, ElseProps, LinkProps} from '@elux/vue-components';

export * from '@elux/app';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createApp(appConfig: AppConfig) {
  const router = createClientRouter();
  const app = createCSRApp(RouterComponent);
  return buildApp(app, router);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createSSR(appConfig: AppConfig, nativeRequest: NativeRequest) {
  const router = createServerRouter(nativeRequest);
  const app = createSSRApp(RouterComponent);
  return buildSSR(app, router);
}
