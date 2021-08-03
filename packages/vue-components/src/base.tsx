import {Component} from 'vue';
import {env, IStore, buildConfigSetter} from '@elux/core';
import {IBaseRouter} from '@elux/route';

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
  router?: IBaseRouter<any, string>;
}
export interface EluxStoreContext {
  store: IStore;
}
export const EluxContextKey = '__EluxContext__';
export const EluxStoreContextKey = '__EluxStoreContext__';
