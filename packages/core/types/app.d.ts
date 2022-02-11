import { CoreRouter, StoreMiddleware, StoreLogger, EluxComponent, EStore, RootState } from './basic';
export declare function initApp(router: CoreRouter, data: RootState, initState: (data: RootState) => RootState, middlewares?: StoreMiddleware[], storeLogger?: StoreLogger, appViewName?: string, preloadComponents?: string[]): {
    store: EStore;
    AppView: EluxComponent;
    setup: Promise<void>;
};
export declare function reinitApp(store: EStore): Promise<void>;
//# sourceMappingURL=app.d.ts.map