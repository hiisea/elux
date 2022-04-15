import { buildApp, buildSSR } from '@elux/core';
import { createClientRouter, createServerRouter } from '@elux/route-browser';
export { DocumentHead, Else, Link, Switch } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export * from '@elux/app';
let cientSingleton = undefined;
export function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  const router = createClientRouter();
  cientSingleton = {
    render() {
      return Promise.resolve();
    }

  };
  return buildApp({}, router);
}
export function createSSR(appConfig, nativeRequest) {
  const router = createServerRouter(nativeRequest);
  return buildSSR({}, router);
}