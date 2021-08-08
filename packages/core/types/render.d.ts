import { ModuleGetter, BStore, IStore, EluxComponent, IStoreMiddleware, ICoreRouter } from './basic';
export declare function defineModuleGetter(moduleGetter: ModuleGetter, appModuleName?: string, routeModuleName?: string): void;
export declare function forkStore<T extends IStore>(originalStore: T, initState: Record<string, any>): T;
export declare function initApp<ST extends BStore = BStore>(router: ICoreRouter, baseStore: ST, middlewares?: IStoreMiddleware[], appViewName?: string, preloadComponents?: string[]): {
    store: IStore & ST;
    AppView: EluxComponent;
    setup: Promise<void>;
};
