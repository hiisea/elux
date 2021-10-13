import {Component, inject} from 'vue';
import {env, IStore, ICoreRouter, buildConfigSetter} from '@elux/core';
import {IEluxRouter} from '@elux/route';

export const vueComponentsConfig: {
  setPageTitle(title: string): void;
  Provider: Component<{store: IStore}>;
  LoadComponentOnError: Component<{message: string}>;
  LoadComponentOnLoading: Component<{}>;
} = {
  setPageTitle(title: string) {
    return (env.document.title = title);
  },
  Provider: null as any,
  LoadComponentOnError: ({message}: {message: string}) => <div class="g-component-error">{message}</div>,
  LoadComponentOnLoading: () => <div class="g-component-loading">loading...</div>,
};

export const setVueComponentsConfig = buildConfigSetter(vueComponentsConfig);
export interface EluxContext {
  deps?: Record<string, boolean>;
  documentHead: string;
  router?: IEluxRouter;
}
export interface EluxStoreContext {
  store: IStore;
}
export const EluxContextKey = '__EluxContext__';
export const EluxStoreContextKey = '__EluxStoreContext__';

export function useRouter(): ICoreRouter {
  const {router} = inject<EluxContext>(EluxContextKey, {documentHead: ''});
  return router!;
}
export function useStore(): IStore {
  const {store} = inject<EluxStoreContext>(EluxStoreContextKey, {} as any);
  return store;
}
