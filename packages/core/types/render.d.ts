import { ModuleGetter, BStore, IStore } from './basic';
import { IStoreMiddleware } from './store';
export declare function defineModuleGetter(moduleGetter: ModuleGetter, appModuleName?: string): void;
export declare function renderApp<ST extends BStore = BStore>(baseStore: ST, preloadModules: string[], preloadComponents: string[], middlewares?: IStoreMiddleware[], appViewName?: string): Promise<{
    store: IStore<any> & ST;
    AppView: any;
}>;
export declare function ssrApp<ST extends BStore = BStore>(baseStore: ST, preloadModules: string[], middlewares?: IStoreMiddleware[], appViewName?: string): Promise<{
    store: IStore<any> & ST;
    AppView: any;
}>;
