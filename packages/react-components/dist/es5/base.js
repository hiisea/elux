import React, { useContext } from 'react';
import { buildConfigSetter } from '@elux/core';
export var EluxContextComponent = React.createContext({
  documentHead: '',
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