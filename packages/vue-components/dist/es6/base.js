import { buildConfigSetter } from '@elux/core';
import { inject, shallowReactive, watch } from 'vue';
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
export const vueComponentsConfig = {
  renderToString: undefined
};
export const setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);
export function connectStore(mapStateToProps = () => ({})) {
  const store = UseStore();
  const storeProps = shallowReactive({});
  watch(() => mapStateToProps(store.state), val => Object.assign(storeProps, val, {
    dispatch: store.dispatch
  }), {
    immediate: true
  });
  return storeProps;
}