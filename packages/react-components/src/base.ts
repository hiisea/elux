import React, {useContext} from 'react';

import {buildConfigSetter, EluxContext, IRouter} from '@elux/core';

export const EluxContextComponent = React.createContext<EluxContext>({documentHead: '', router: null as any});

export function UseRouter(): IRouter {
  const eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}

export const reactComponentsConfig: {
  hydrate?: (component: any, container: any) => void;
  render?: (component: any, container: any) => void;
  renderToString?: (component: any) => string;
} = {
  hydrate: undefined,
  render: undefined,
  renderToString: undefined,
};

export const setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);
