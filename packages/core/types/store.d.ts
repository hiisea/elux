import { StoreMiddleware, RouteState, CoreRouter, StoreLogger, EStore, Action, RootState } from './basic';
export declare const routeMiddleware: StoreMiddleware;
export declare function forkStore(originalStore: EStore, newRouteState: RouteState): EStore;
export declare function createStore(sid: number, router: CoreRouter, data: RootState, initState: (data: RootState) => RootState, middlewares?: StoreMiddleware[], logger?: StoreLogger): EStore;
export declare const errorProcessed = "__eluxProcessed__";
export declare function isProcessedError(error: any): boolean;
export declare function setProcessedError(error: any, processed: boolean): {
    [errorProcessed]: boolean;
    [key: string]: any;
};
export declare function getActionData(action: Action): any[];
//# sourceMappingURL=store.d.ts.map