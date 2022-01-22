import { EluxComponent, IStore, State, IStoreMiddleware, ICoreRouter, ICoreRouteState, IStoreLogger } from './basic';
export declare function initApp<S extends State>(router: ICoreRouter, data: S, initState: (data: S) => S, middlewares?: IStoreMiddleware[], storeLogger?: IStoreLogger, appViewName?: string, preloadComponents?: string[]): {
    store: IStore<S>;
    AppView: EluxComponent;
    setup: Promise<void>;
};
export declare function reinitApp(store: IStore): Promise<void>;
export declare function forkStore<T extends IStore, R extends ICoreRouteState>(originalStore: T, routeState: R): T;
//# sourceMappingURL=app.d.ts.map