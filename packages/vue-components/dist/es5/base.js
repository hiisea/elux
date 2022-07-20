import { buildConfigSetter } from '@elux/core';
import { inject, shallowReactive, watch } from 'vue';
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
export var vueComponentsConfig = {
  renderToString: undefined
};
export var setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);
export function connectStore(mapStateToProps) {
  if (mapStateToProps === void 0) {
    mapStateToProps = function mapStateToProps() {
      return {};
    };
  }

  var store = UseStore();
  var storeProps = shallowReactive({});
  watch(function () {
    return mapStateToProps(store.state);
  }, function (val) {
    return Object.assign(storeProps, val, {
      dispatch: store.dispatch
    });
  }, {
    immediate: true
  });
  return storeProps;
}