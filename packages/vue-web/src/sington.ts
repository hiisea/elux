import type {Router} from '@elux/route-browser';
import {IStore} from '@elux/core';

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

export const EluxContextKey = '__EluxContext__';
