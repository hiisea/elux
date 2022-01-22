import { Action, IStore, IStoreMiddleware, State, ICoreRouter, IStoreLogger } from './basic';
/*** @internal */
export declare const errorProcessed = "__eluxProcessed__";
/*** @internal */
export declare function isProcessedError(error: any): boolean;
/*** @internal */
export declare function setProcessedError(error: any, processed: boolean): {
    [errorProcessed]: boolean;
    [key: string]: any;
};
export declare function getActionData(action: Action): any[];
export declare function createStore<S extends State = any>(sid: number, router: ICoreRouter, data: S, initState: (data: S) => S, middlewares?: IStoreMiddleware[], logger?: IStoreLogger): IStore<S>;
//# sourceMappingURL=store.d.ts.map