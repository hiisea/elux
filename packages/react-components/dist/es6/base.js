import React, { useContext } from 'react';
import { buildConfigSetter } from '@elux/core';
export const EluxContextComponent = React.createContext({
  documentHead: '',
  router: null
});
export function UseRouter() {
  const eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}
export const reactComponentsConfig = {
  hydrate: undefined,
  render: undefined,
  renderToString: undefined
};
export const setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);