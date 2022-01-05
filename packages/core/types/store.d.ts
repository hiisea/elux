import { Action, BStore, IStore, IStoreMiddleware, State, ICoreRouter } from './basic';
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
export declare function enhanceStore<S extends State = any>(baseStore: BStore, router: ICoreRouter, middlewares?: IStoreMiddleware[]): IStore<S>;
//# sourceMappingURL=store.d.ts.map