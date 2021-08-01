import { h } from 'vue';
import { env } from '@elux/core';
import { EluxContextKey } from './base';
var StageView;
export var RootComponent = function RootComponent(props, context) {
  return h(StageView, props, context.slots);
};
export function renderToMP(store, eluxContext, app) {
  app.use(store);
  app.provide(EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
}
export function renderToDocument(id, APPView, store, eluxContext, fromSSR, app) {
  StageView = APPView;
  app.use(store);
  app.provide(EluxContextKey, eluxContext);

  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }

  app.mount("#" + id);
}
export function renderToString(id, APPView, store, eluxContext, app) {
  StageView = APPView;
  app.use(store);
  app.provide(EluxContextKey, eluxContext);

  var htmlPromise = require('@vue/server-renderer').renderToString(app);

  return htmlPromise;
}