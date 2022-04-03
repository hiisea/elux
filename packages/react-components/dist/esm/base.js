import React, { useContext } from 'react';
export var EluxContextComponent = React.createContext({
  documentHead: '',
  router: null
});
export function UseRouter() {
  var eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}