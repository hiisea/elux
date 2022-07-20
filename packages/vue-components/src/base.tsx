import {buildConfigSetter, Dispatch, EluxContext, EluxStoreContext, IRouter, StoreState, VStore} from '@elux/core';
import {inject, shallowReactive, watch} from 'vue';

export const EluxContextKey = '__EluxContext__';
export const EluxStoreContextKey = '__EluxStoreContext__';

export function UseRouter(): IRouter {
  const {router} = inject<EluxContext>(EluxContextKey, {} as any);
  return router;
}
export function UseStore(): VStore {
  const {store} = inject<EluxStoreContext>(EluxStoreContextKey, {} as any);
  return store;
}
export const vueComponentsConfig: {
  renderToString?: (component: any) => Promise<string>;
} = {
  renderToString: undefined,
};

export const setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);

/**
 * 提供类似于react-redux的connect方法
 *
 * @param mapStateToProps - state与props之间的映射与转换
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function connectStore<S extends StoreState, P extends Record<string, any>>(mapStateToProps: (state: S) => P = () => ({} as P)) {
  const store = UseStore();
  const storeProps = shallowReactive<P & {dispatch: Dispatch}>({} as any);
  watch(
    () => mapStateToProps(store.state as any),
    (val) => Object.assign(storeProps, val, {dispatch: store.dispatch}),
    {immediate: true}
  );
  return storeProps;
}
