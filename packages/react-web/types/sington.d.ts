import React from 'react';
import { IStore } from '@elux/core';
import type { Router } from '@elux/route-browser';
export declare const MetaData: {
    router: Router<any, string>;
};
export interface EluxContextType {
    deps?: Record<string, boolean>;
    documentHead: string;
    store?: IStore;
}
export declare const EluxContext: React.Context<EluxContextType>;
