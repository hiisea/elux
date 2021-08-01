import {Component, h} from 'vue';
import type {App} from 'vue';
import {env, IStore} from '@elux/core';
import {EluxContext, EluxContextKey} from './base';

let StageView: Component<any>;

export const RootComponent: Component = (props, context) => {
  return h(StageView, props, context.slots);
};
export function renderToMP(store: IStore, eluxContext: EluxContext, app: App): void {
  app.use(store as any);
  app.provide<EluxContext>(EluxContextKey, eluxContext);
  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
}
export function renderToDocument(id: string, APPView: Component<any>, store: IStore, eluxContext: EluxContext, fromSSR: boolean, app: App): void {
  StageView = APPView;
  app.use(store as any);
  app.provide<EluxContext>(EluxContextKey, eluxContext);
  if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
  }
  app.mount(`#${id}`);
}
export function renderToString(id: string, APPView: Component<any>, store: IStore, eluxContext: EluxContext, app: App): Promise<string> {
  StageView = APPView;
  app.use(store as any);
  app.provide<EluxContext>(EluxContextKey, eluxContext);
  const htmlPromise: Promise<string> = require('@vue/server-renderer').renderToString(app);
  return htmlPromise;
}
