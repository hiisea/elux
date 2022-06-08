import { buildConfigSetter } from '@elux/core';
import { createContext, useContext } from 'react';
export var EluxContextComponent = createContext({
  router: null
});
export function UseRouter() {
  var eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}
export var reactComponentsConfig = {
  hydrate: undefined,
  render: undefined,
  renderToString: undefined
};
export var setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);