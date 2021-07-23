import React from 'react';
import {IStore} from '@elux/core';
import {IBaseRouter} from '@elux/route';

export interface EluxContext {
  deps?: Record<string, boolean>;
  documentHead: string;
  store?: IStore;
  router?: IBaseRouter<any, string>;
}
export const EluxContextComponent = React.createContext<EluxContext>({documentHead: ''});
