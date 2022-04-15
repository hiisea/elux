import { createApp as createCSRApp, createSSRApp } from 'vue';
import { buildApp, buildSSR } from '@elux/core';
import { createClientRouter, createServerRouter } from '@elux/route-browser';
import { RouterComponent } from '@elux/vue-components';
export { DocumentHead, Else, Link, Switch } from '@elux/vue-components';
export * from '@elux/app';
let cientSingleton = undefined;
export function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  const router = createClientRouter();
  const app = createCSRApp(RouterComponent);
  cientSingleton = Object.assign(app, {
    render() {
      return Promise.resolve();
    }

  });
  return buildApp(app, router);
}
export function createSSR(appConfig, nativeRequest) {
  const router = createServerRouter(nativeRequest);
  const app = createSSRApp(RouterComponent);
  return buildSSR(app, router);
}