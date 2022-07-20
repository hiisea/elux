import { buildApp, buildSSR, env } from '@elux/core';
import { setReactComponentsConfig } from '@elux/react-components';
import { renderToString } from '@elux/react-web/server';
import { createClientRouter, createServerRouter } from '@elux/route-browser';
import { hydrate, render } from 'react-dom';
export { DocumentHead, Else, Link, Switch } from '@elux/react-components';
export { connectRedux, connectStore, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
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
  const {
    pathname,
    search,
    hash
  } = env.location;
  return buildApp({}, router, {
    url: [pathname, search, hash].join('')
  });
}
export function createSSR(appConfig, routerOptions) {
  const router = createServerRouter();
  return buildSSR({}, router, routerOptions);
}