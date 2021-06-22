import { Action, IStore, BStore, BStoreOptions, Dispatch, GetState, State } from './basic';
declare const errorProcessed = "__eluxProcessed__";
export declare function isProcessedError(error: any): boolean;
export declare function setProcessedError(error: any, processed: boolean): {
    [errorProcessed]: boolean;
    [key: string]: any;
};
export declare function getActionData(action: Action): any[];
export declare type IStoreMiddleware = (api: {
    getState: GetState;
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
export declare function enhanceStore<S extends State = any>(baseStore: BStore, middlewares?: IStoreMiddleware[]): IStore<S>;
export interface StoreBuilder<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore> {
    storeOptions: O;
    storeCreator: (options: O) => B;
}
export {};
