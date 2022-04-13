import {inject} from 'vue';

import {EluxContext, EluxStoreContext, IRouter, IStore} from '@elux/core';

export const EluxContextKey = '__EluxContext__';
export const EluxStoreContextKey = '__EluxStoreContext__';

export function UseRouter(): IRouter {
  const {router} = inject<EluxContext>(EluxContextKey, {} as any);
  return router;
}
export function UseStore(): IStore {
  const {store} = inject<EluxStoreContext>(EluxStoreContextKey, {} as any);
  return store;
}
