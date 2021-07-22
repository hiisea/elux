import React from 'react';
import {IStore} from '@elux/core';
import type {Router} from '@elux/route-mp';

export const MetaData: {
  router: Router<any, string>;
} = {
  router: undefined as any,
};

export interface EluxContextType {
  documentHead: string;
  store?: IStore;
}
export const EluxContext = React.createContext<EluxContextType>({documentHead: ''});
