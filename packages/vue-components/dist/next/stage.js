import { h, provide, inject } from 'vue';
import { env } from '@elux/core';
import { EluxContextKey, EluxStoreContextKey } from './base';
let StageView;
export const Router = (props, context) => {
  return h(Page, props, context.slots);
};
export const Page = {
  setup(props, context) {
    const {
      router
    } = inject(EluxContextKey, {
      documentHead: ''
    });
    const store = router.getCurrentStore();
    const storeContext = {
      store
    };
    provide(EluxStoreContextKey, storeContext);
    return () => h(StageView, props, context.slots);
  }

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

  app.mount(`#${id}`);
}
export function renderToString(id, APPView, store, eluxContext, app) {
  StageView = APPView;
  app.use(store);
  app.provide(EluxContextKey, eluxContext);

  const htmlPromise = require('@vue/server-renderer').renderToString(app);

  return htmlPromise;
}