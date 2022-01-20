import { EluxComponent, IStore, BStore, IStoreMiddleware, ICoreRouter, ICoreRouteState, IStoreLogger } from './basic';
export declare function initApp<ST extends BStore = BStore>(router: ICoreRouter, baseStore: ST, middlewares?: IStoreMiddleware[], storeLogger?: IStoreLogger, appViewName?: string, preloadComponents?: string[]): {
    store: IStore & ST;
    AppView: EluxComponent;
    setup: Promise<void>;
};
export declare function reinitApp(store: IStore): Promise<void>;
export declare function forkStore<T extends IStore, S extends ICoreRouteState>(originalStore: T, routeState: S): T;
//# sourceMappingURL=app.d.ts.map