import { inject } from 'vue';
export const EluxContextKey = '__EluxContext__';
export const EluxStoreContextKey = '__EluxStoreContext__';
export function UseRouter() {
  const {
    router
  } = inject(EluxContextKey, {});
  return router;
}
export function UseStore() {
  const {
    store
  } = inject(EluxStoreContextKey, {});
  return store;
}