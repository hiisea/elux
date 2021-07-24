import { IStore, LoadComponent, ModuleGetter, IStoreMiddleware, StoreBuilder, BStoreOptions, BStore, RootModuleFacade, RootModuleAPI, RootModuleActions } from '@elux/core';
import { IBaseRouter, LocationTransform } from '@elux/route';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers, } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export type { RootModuleFacade as Facade, Dispatch, IStore, EluxComponent } from '@elux/core';
export type { RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial } from '@elux/route';
export declare const appConfig: {
    loadComponent: LoadComponent;
};
export declare const setAppConfig: (config: Partial<{
    loadComponent: LoadComponent;
}>) => void;
export interface UserConfig {
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    NSP?: string;
    MSP?: string;
    DepthTimeOnLoading?: number;
    disableNativeRoute?: boolean;
}
export declare function setUserConfig(conf: UserConfig): void;
export interface RenderOptions {
    viewName?: string;
    id?: string;
    ssrKey?: string;
}
export interface CreateApp<INS = {}> {
    (moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
        useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): INS & {
            render({ id, ssrKey, viewName }?: RenderOptions): Promise<IStore<any> & B>;
        };
    };
}
export interface CreateSSR<INS = {}> {
    (moduleGetter: ModuleGetter, url: string, middlewares?: IStoreMiddleware[], appModuleName?: string): {
        useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): INS & {
            render({ id, ssrKey, viewName }?: RenderOptions): Promise<string>;
        };
    };
}
export interface EluxContext {
    deps?: Record<string, boolean>;
    documentHead: string;
    store?: IStore;
    router?: IBaseRouter<any, string>;
}
export declare const EluxContextKey = "__EluxContext__";
export declare function createBaseApp<INS = {}>(ins: INS, createRouter: (locationTransform: LocationTransform) => IBaseRouter<any, string>, render: (id: string, component: any, store: IStore, eluxContext: EluxContext, fromSSR: boolean) => void, moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): INS & {
        render({ id, ssrKey, viewName }?: RenderOptions): Promise<IStore<any> & B>;
    };
};
export declare function createBaseSSR<INS = {}>(ins: INS, createRouter: (locationTransform: LocationTransform) => IBaseRouter<any, string>, render: (id: string, component: any, store: IStore, eluxContext: EluxContext) => string, moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): INS & {
        render({ id, ssrKey, viewName }?: RenderOptions): Promise<string>;
    };
};
export declare function patchActions(typeName: string, json?: string): void;
export declare type GetBaseAPP<A extends RootModuleFacade, LoadComponentOptions> = {
    State: {
        [M in keyof A]: A[M]['state'];
    };
    RouteParams: {
        [M in keyof A]?: A[M]['params'];
    };
    GetRouter: () => IBaseRouter<{
        [M in keyof A]: A[M]['params'];
    }, Extract<keyof A['route']['components'], string>>;
    GetActions<N extends keyof A>(...args: N[]): {
        [K in N]: A[K]['actions'];
    };
    LoadComponent: LoadComponent<A, LoadComponentOptions>;
    Modules: RootModuleAPI<A>;
    Actions: RootModuleActions<A>;
    Pagenames: {
        [K in keyof A['route']['components']]: K;
    };
};
export declare function getApp<T extends {
    GetActions: any;
    GetRouter: any;
    LoadComponent: any;
    Modules: any;
    Pagenames: any;
}>(): Pick<T, 'GetActions' | 'GetRouter' | 'LoadComponent' | 'Modules' | 'Pagenames'>;
