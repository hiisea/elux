import React, {ComponentType} from 'react';
import {env, UStore, buildConfigSetter} from '@elux/core';
import {URouter} from '@elux/route';

export const reactComponentsConfig: {
  setPageTitle(title: string): void;
  Provider: ComponentType<{store: UStore}>;
  useStore(): UStore;
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
  router?: URouter;
}
export const EluxContextComponent = React.createContext<EluxContext>({documentHead: ''});
