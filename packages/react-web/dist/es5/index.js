import { buildApp, buildSSR, env } from '@elux/core';
import { setReactComponentsConfig } from '@elux/react-components';
import { renderToString } from '@elux/react-web/server';
import { createClientRouter, createServerRouter } from '@elux/route-browser';
import { hydrate, render } from 'react-dom';
export { DocumentHead, Else, Link, Switch } from '@elux/react-components';
export { connectRedux, connectStore, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
export * from '@elux/app';
setReactComponentsConfig({
  hydrate: hydrate,
  render: render,
  renderToString: renderToString
});
var cientSingleton = undefined;
export function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  var router = createClientRouter();
  cientSingleton = {
    render: function render() {
      return Promise.resolve();
    }
  };
  var _ref = env.location,
      pathname = _ref.pathname,
      search = _ref.search,
      hash = _ref.hash;
  return buildApp({}, router, {
    url: [pathname, search, hash].join('')
  });
}
export function createSSR(appConfig, routerOptions) {
  var router = createServerRouter();
  return buildSSR({}, router, routerOptions);
}