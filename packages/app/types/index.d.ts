import { IStore, LoadComponent, ModuleGetter, IStoreMiddleware, StoreBuilder, BStore, RootModuleFacade, RootModuleAPI, RootModuleActions, ICoreRouter, StoreOptions } from '@elux/core';
import { IEluxRouter, RouteState } from '@elux/route';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, action, mutation, setLoading, logger, isServer, serverSide, clientSide, deepClone, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, exportView, exportComponent, modelHotReplacement, EmptyModuleHandlers, TaskCounter, SingleDispatcher, CoreModuleHandlers as BaseModuleHandlers, errorProcessed, } from '@elux/core';
export { RouteActionTypes, location, createRouteModule, safeJsonParse } from '@elux/route';
export type { RootModuleFacade as Facade, Dispatch, IStore, EluxComponent, LoadComponent, ICoreRouter, ModuleGetter, IStoreMiddleware, StoreOptions, BStore, StoreBuilder, RootModuleAPI, RootModuleActions, GetState, State, ICoreRouteState, IModuleHandlersClass, PickActions, ModuleFacade, GetPromiseModule, ReturnComponents, CommonModule, IModuleHandlers, GetPromiseComponent, ActionsThis, Action, HandlerThis, PickHandler, } from '@elux/core';
export type { LocationState, PagenameMap, NativeLocationMap, HistoryAction, EluxLocation, NativeLocation, StateLocation, RouteState, DeepPartial, IEluxRouter, RootParams, ILocationTransform, IHistoryRecord, } from '@elux/route';
/**
 * @internal
 */
export declare type ComputedStore<T> = {
    [K in keyof T]-?: () => T[K];
};
/**
 * @internal
 */
export declare const appConfig: {
    loadComponent: LoadComponent;
    useRouter: () => ICoreRouter;
    useStore: () => IStore;
};
/**
 * @internal
 */
export declare const setAppConfig: (config: Partial<{
    loadComponent: LoadComponent;
    useRouter: () => ICoreRouter;
    useStore: () => IStore;
}>) => void;
/**
 * @internal
 */
export interface UserConfig {
    maxHistory?: number;
    maxLocationCache?: number;
    NSP?: string;
    MSP?: string;
    DepthTimeOnLoading?: number;
    indexUrl?: string;
    notfoundPagename: string;
    paramsKey: string;
    AppModuleName?: string;
    RouteModuleName?: string;
    disableNativeRouter?: boolean;
}
/**
 * @internal
 */
export declare function setUserConfig(conf: UserConfig): void;
/**
 * @internal
 */
export interface RenderOptions {
    viewName?: string;
    id?: string;
    ssrKey?: string;
}
/**
 * @internal
 */
export interface ContextWrap {
}
/**
 * @internal
 */
export interface AttachMP<App> {
    (app: App, moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[]): {
        useStore<O extends StoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): App & {
            render(): {
                store: IStore & B;
                context: ContextWrap;
            };
        };
    };
}
/**
 * @internal
 */
export interface CreateMP {
    (moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[]): {
        useStore<O extends StoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): {
            render(): {
                store: IStore & B;
                context: ContextWrap;
            };
        };
    };
}
/**
 * @internal
 */
export interface CreateApp<INS = {}> {
    (moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[]): {
        useStore<O extends StoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): INS & {
            render({ id, ssrKey, viewName }?: RenderOptions): Promise<IStore & B>;
        };
    };
}
/**
 * @internal
 */
export interface CreateSSR<INS = {}> {
    (moduleGetter: ModuleGetter, url: string, nativeData: any, middlewares?: IStoreMiddleware[]): {
        useStore<O extends StoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator, }: StoreBuilder<O, B>): INS & {
            render({ id, ssrKey, viewName }?: RenderOptions): Promise<string>;
        };
    };
}
/**
 * @internal
 */
export interface EluxContext {
    deps?: Record<string, boolean>;
    documentHead: string;
    router?: IEluxRouter<any, string>;
}
/**
 * @internal
 */
export declare function createBaseMP<INS = {}>(ins: INS, router: IEluxRouter, render: (eluxContext: EluxContext, ins: INS) => any, middlewares?: IStoreMiddleware[]): {
    useStore<O extends StoreOptions, B extends BStore<{}> = BStore<{}>>(storeBuilder: StoreBuilder<O, B>): INS & {
        render(): {
            store: IStore & B;
            context: ContextWrap;
        };
    };
};
/**
 * @internal
 */
export declare function createBaseApp<INS = {}>(ins: INS, router: IEluxRouter, render: (id: string, component: any, eluxContext: EluxContext, fromSSR: boolean, ins: INS) => void, middlewares?: IStoreMiddleware[]): {
    useStore<O extends StoreOptions, B extends BStore<{}> = BStore<{}>>(storeBuilder: StoreBuilder<O, B>): INS & {
        render({ id, ssrKey, viewName }?: RenderOptions): Promise<IStore & B>;
    };
};
/**
 * @internal
 */
export declare function createBaseSSR<INS = {}>(ins: INS, router: IEluxRouter, render: (id: string, component: any, eluxContext: EluxContext, ins: INS) => Promise<string>, middlewares?: IStoreMiddleware[]): {
    useStore<O extends StoreOptions, B extends BStore<{}> = BStore<{}>>(storeBuilder: StoreBuilder<O, B>): INS & {
        render({ id, ssrKey, viewName }?: RenderOptions): Promise<string>;
    };
};
/**
 * @internal
 */
export declare function patchActions(typeName: string, json?: string): void;
/**
 * @internal
 */
export declare type GetBaseAPP<A extends RootModuleFacade, LoadComponentOptions, R extends string = 'route', NT = unknown> = {
    State: {
        [M in keyof A]: A[M]['state'];
    };
    RouteParams: {
        [M in keyof A]?: A[M]['params'];
    };
    RouteState: RouteState<{
        [M in keyof A]?: A[M]['params'];
    }>;
    Router: IEluxRouter<{
        [M in keyof A]: A[M]['params'];
    }, Extract<keyof A[R]['components'], string>, NT>;
    GetActions<N extends keyof A>(...args: N[]): {
        [K in N]: A[K]['actions'];
    };
    LoadComponent: LoadComponent<A, LoadComponentOptions>;
    Modules: RootModuleAPI<A>;
    Actions: RootModuleActions<A>;
    Pagenames: {
        [K in keyof A[R]['components']]: K;
    };
};
/**
 * @internal
 */
export declare function getApp<T extends {
    State: any;
    GetActions: any;
    LoadComponent: any;
    Modules: any;
    Pagenames: any;
    Router: any;
}>(demoteForProductionOnly?: boolean, injectActions?: Record<string, string[]>): Pick<T, 'GetActions' | 'LoadComponent' | 'Modules' | 'Pagenames'> & {
    GetRouter: () => T['Router'];
    useRouter: () => T['Router'];
    useStore: () => IStore<T['State']>;
};
//# sourceMappingURL=index.d.ts.map