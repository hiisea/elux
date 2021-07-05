import type { Router } from '@elux/route-browser';
import { IStore } from '@elux/core';
export declare const MetaData: {
    router: Router<any, string>;
};
export interface EluxContextType {
    deps?: Record<string, boolean>;
    documentHead: string;
    store?: IStore;
}
export declare const EluxContextKey = "__EluxContext__";
