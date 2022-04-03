import React, { useContext } from 'react';
export const EluxContextComponent = React.createContext({
  documentHead: '',
  router: null
});
export function UseRouter() {
  const eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}