import { hydrate, render } from 'react-dom';
import { buildApp, buildSSR } from '@elux/core';
import { setReactComponentsConfig } from '@elux/react-components';
import { renderToString } from '@elux/react-web/server';
import { createClientRouter, createServerRouter } from '@elux/route-browser';
export { DocumentHead, Else, Link, Switch } from '@elux/react-components';
export { connectRedux, createSelectorHook, shallowEqual, useSelector } from '@elux/react-redux';
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

  var _createClientRouter = createClientRouter(),
      router = _createClientRouter.router,
      url = _createClientRouter.url;

  cientSingleton = {
    render: function render() {
      return Promise.resolve();
    }
  };
  return buildApp({}, router, {
    url: url
  });
}
export function createSSR(appConfig, routerOptions) {
  var router = createServerRouter(routerOptions.url);
  return buildSSR({}, router, routerOptions);
}