import { Action, BStoreOptions, IModuleHandlers, BStore, IStore, IStoreMiddleware, State, ICoreRouter } from './basic';
declare const errorProcessed = "__eluxProcessed__";
export declare function isProcessedError(error: any): boolean;
export declare function setProcessedError(error: any, processed: boolean): {
    [errorProcessed]: boolean;
    [key: string]: any;
};
export declare function getActionData(action: Action): any[];
export declare function forkStore<T extends IStore>(store: T): T;
export declare function enhanceStore<S extends State = any>(baseStore: BStore, middlewares?: IStoreMiddleware[], injectedModules?: {
    [moduleName: string]: IModuleHandlers;
}): IStore<S>;
export interface StoreBuilder<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore> {
    storeOptions: O;
    storeCreator: (options: O, router: ICoreRouter, id?: number) => B;
}
export {};
