import { createSSRApp, createApp as createCSRApp } from 'vue';
import { buildApp, buildSSR } from '@elux/core';
import { createClientRouter, createServerRouter } from '@elux/route-browser';
import { RouterComponent } from '@elux/vue-components';
export { DocumentHead, Switch, Else, Link } from '@elux/vue-components';
export * from '@elux/app';
export function createApp(appConfig) {
  var router = createClientRouter();
  var app = createCSRApp(RouterComponent);
  return buildApp(app, router);
}
export function createSSR(appConfig, url, nativeData) {
  var router = createServerRouter(url, nativeData);
  var app = createSSRApp(RouterComponent);
  return buildSSR(app, router);
}