import { buildApp, buildSSR } from '@elux/core';
import { createClientRouter, createServerRouter } from '@elux/route-browser';
export { DocumentHead, Switch, Else, Link } from '@elux/react-components';
export { connectRedux, shallowEqual, useSelector, createSelectorHook } from '@elux/react-redux';
export * from '@elux/app';
export function createApp(appConfig) {
  var router = createClientRouter();
  return buildApp({}, router);
}
export function createSSR(appConfig, nativeRequest) {
  var router = createServerRouter(nativeRequest);
  return buildSSR({}, router);
}