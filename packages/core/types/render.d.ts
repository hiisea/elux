import { ModuleGetter, BStore, IStore, EluxComponent, IStoreMiddleware, ICoreRouter } from './basic';
export declare function defineModuleGetter(moduleGetter: ModuleGetter, appModuleName?: string): void;
export declare function renderApp<ST extends BStore = BStore>(router: ICoreRouter, baseStore: ST, preloadModules: string[], preloadComponents: string[], middlewares?: IStoreMiddleware[], appViewName?: string): Promise<{
    store: IStore & ST;
    AppView: EluxComponent;
}>;
export declare function initApp<ST extends BStore = BStore>(router: ICoreRouter, baseStore: ST, middlewares?: IStoreMiddleware[]): IStore & ST;
export declare function ssrApp<ST extends BStore = BStore>(router: ICoreRouter, baseStore: ST, preloadModules: string[], middlewares?: IStoreMiddleware[], appViewName?: string): Promise<{
    store: IStore & ST;
    AppView: EluxComponent;
}>;
