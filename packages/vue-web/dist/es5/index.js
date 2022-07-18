import { buildApp, buildSSR, env } from '@elux/core';
import { createClientRouter, createServerRouter } from '@elux/route-browser';
import { RouterComponent, setVueComponentsConfig } from '@elux/vue-components';
import { renderToString } from '@elux/vue-web/server';
import { createApp as createCSRApp, createSSRApp } from 'vue';
export { DocumentHead, Else, Link, Switch, connectStore } from '@elux/vue-components';
export * from '@elux/app';
setVueComponentsConfig({
  renderToString: renderToString
});
var cientSingleton = undefined;
export function createApp(appConfig) {
  if (cientSingleton) {
    return cientSingleton;
  }

  var router = createClientRouter();
  var app = createCSRApp(RouterComponent);
  cientSingleton = Object.assign(app, {
    render: function render() {
      return Promise.resolve();
    }
  });
  var _ref = env.location,
      pathname = _ref.pathname,
      search = _ref.search,
      hash = _ref.hash;
  return buildApp(app, router, {
    url: [pathname, search, hash].join('')
  });
}
export function createSSR(appConfig, routerOptions) {
  var router = createServerRouter();
  var app = createSSRApp(RouterComponent);
  return buildSSR(app, router, routerOptions);
}