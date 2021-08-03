import React, {ComponentType} from 'react';
import {env, IStore, buildConfigSetter} from '@elux/core';
import {IBaseRouter} from '@elux/route';

export const reactComponentsConfig: {
  setPageTitle(title: string): void;
  Provider: ComponentType<{store: IStore}>;
  useStore(): IStore<any>;
  LoadComponentOnError: ComponentType<{message: string}>;
  LoadComponentOnLoading: ComponentType<{}>;
} = {
  setPageTitle(title: string) {
    return (env.document.title = title);
  },
  Provider: null as any,
  useStore: null as any,
  LoadComponentOnError: ({message}: {message: string}) => <div className="g-component-error">{message}</div>,
  LoadComponentOnLoading: () => <div className="g-component-loading">loading...</div>,
};

export const setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);
export interface EluxContext {
  deps?: Record<string, boolean>;
  documentHead: string;
  store?: IStore;
  router?: IBaseRouter<any, string>;
}
export const EluxContextComponent = React.createContext<EluxContext>({documentHead: ''});
