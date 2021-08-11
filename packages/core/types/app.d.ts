import { EluxComponent, IStore, BStore, IStoreMiddleware, ICoreRouter } from './basic';
export declare function initApp<ST extends BStore = BStore>(router: ICoreRouter, baseStore: ST, middlewares?: IStoreMiddleware[], appViewName?: string, preloadComponents?: string[]): {
    store: IStore & ST;
    AppView: EluxComponent;
    setup: Promise<void>;
};
export declare function forkStore<T extends IStore>(originalStore: T): T;
