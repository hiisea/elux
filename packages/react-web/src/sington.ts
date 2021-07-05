import React from 'react';
import {IStore} from '@elux/core';
import type {Router} from '@elux/route-browser';

export const MetaData: {
  router: Router<any, string>;
} = {
  router: undefined as any,
};

export interface EluxContextType {
  deps?: Record<string, boolean>;
  documentHead: string;
  store?: IStore;
}
export const EluxContext = React.createContext<EluxContextType>({documentHead: ''});
