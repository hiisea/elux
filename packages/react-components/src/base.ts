import React, {useContext} from 'react';

import {EluxContext, IRouter} from '@elux/core';

export const EluxContextComponent = React.createContext<EluxContext>({documentHead: '', router: null as any});

export function UseRouter(): IRouter {
  const eluxContext = useContext(EluxContextComponent);
  return eluxContext.router;
}
