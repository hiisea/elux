import React from 'react';
import { IStore } from '@elux/core';
import type { Router } from '@elux/route-mp';
export declare const MetaData: {
    router: Router<any, string>;
};
export interface EluxContextType {
    documentHead: string;
    store?: IStore;
}
export declare const EluxContext: React.Context<EluxContextType>;
