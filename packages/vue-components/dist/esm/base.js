import { inject } from 'vue';
export var EluxContextKey = '__EluxContext__';
export var EluxStoreContextKey = '__EluxStoreContext__';
export function UseRouter() {
  var _inject = inject(EluxContextKey, {}),
      router = _inject.router;

  return router;
}
export function UseStore() {
  var _inject2 = inject(EluxStoreContextKey, {}),
      store = _inject2.store;

  return store;
}