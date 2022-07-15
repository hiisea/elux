import {buildConfigSetter, EluxContext, EluxStoreContext, IRouter, VStore} from '@elux/core';
import {inject} from 'vue';

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
