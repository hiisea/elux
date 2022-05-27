import { buildConfigSetter } from '@elux/core';
import { createContext, useContext } from 'react';
export const EluxContextComponent = createContext({
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