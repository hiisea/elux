import { hydrate, render } from 'react-dom';
import { buildApp, buildSSR } from '@elux/core';
import { setReactComponentsConfig } from '@elux/react-components';
import { renderToString } from '@elux/react-web/server';
import { createClientRouter, createServerRouter } from '@elux/route-browser';
export { DocumentHead, Else, Link, Switch, EWindow } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export * from '@elux/app';
setReactComponentsConfig({
  hydrate,
  render,
  renderToString
});
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