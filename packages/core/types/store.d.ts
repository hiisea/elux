import { Action, BStore, IStore, IStoreMiddleware, State, ICoreRouter } from './basic';
declare const errorProcessed = "__eluxProcessed__";
export declare function isProcessedError(error: any): boolean;
export declare function setProcessedError(error: any, processed: boolean): {
    [errorProcessed]: boolean;
    [key: string]: any;
};
export declare function getActionData(action: Action): any[];
export declare function enhanceStore<S extends State = any>(baseStore: BStore, router: ICoreRouter, middlewares?: IStoreMiddleware[]): IStore<S>;
export {};
