/// <reference path="../runtime/runtime.d.ts" />
import { IStore, LoadComponent, ModuleGetter, IStoreMiddleware, StoreBuilder, BStoreOptions, BStore, RootModuleFacade, RootModuleAPI, RootModuleActions } from '@elux/core';
import { IBaseRouter, LocationTransform } from './index';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers, } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from './index';
export type { RootModuleFacade as Facade, Dispatch, IStore, EluxComponent } from '@elux/core';
export type { RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial } from './index';
export interface SetConfig<Comp, Ext> {
    (conf: {
        actionMaxHistory?: number;
        pagesMaxHistory?: number;
        pagenames?: Record<string, string>;
        NSP?: string;
        MSP?: string;
        MutableData?: boolean;
        DepthTimeOnLoading?: number;
        LoadComponentOnError?: Comp;
        LoadComponentOnLoading?: Comp;
        disableNativeRoute?: boolean;
    } & Ext): void;
}
export declare function setMeta({ loadComponent, componentRender, componentSSR, MutableData, router, SSRTPL, }: {
    loadComponent?: LoadComponent;
    componentRender?: (id: string, component: EluxRuntime.Component, store: IStore) => void;
    componentSSR?: (id: string, component: EluxRuntime.Component, store: IStore) => string;
    MutableData?: boolean;
    router?: IBaseRouter<any, string>;
    SSRTPL?: string;
}): void;
export declare function setBaseConfig(conf: {
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    pagenames?: Record<string, string>;
    NSP?: string;
    MSP?: string;
    DepthTimeOnLoading?: number;
    LoadComponentOnError?: any;
    LoadComponentOnLoading?: any;
    disableNativeRoute?: boolean;
}): void;
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
}
export declare const EluxContextKey = "__EluxContext__";
export declare function createBaseApp<INS = {}>(ins: INS, createRouter: (locationTransform: LocationTransform) => IBaseRouter<any, string>, moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): INS & {
        render({ id, ssrKey, viewName }?: RenderOptions): Promise<IStore<any> & B>;
    };
};
export declare function createBaseSSR<INS = {}>(ins: INS, createRouter: (locationTransform: LocationTransform) => IBaseRouter<any, string>, moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): INS & {
        render({ id, ssrKey, viewName }?: RenderOptions): Promise<string>;
    };
};
export declare function patchActions(typeName: string, json?: string): void;
export declare type GetAPP<A extends RootModuleFacade, Component> = {
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
    LoadComponent: LoadComponent<A, {
        OnError?: Component;
        OnLoading?: Component;
    }>;
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
