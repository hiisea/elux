import { UStore, LoadComponent, ModuleGetter, StoreMiddleware, StoreLogger, RootState, Facade, FacadeStates, FacadeModules, FacadeActions } from '@elux/core';
import { URouter, BaseEluxRouter } from '@elux/route';
/*** @public */
export declare type ComputedStore<T> = {
    [K in keyof T]-?: () => T[K];
};
export declare const appConfig: {
    loadComponent: LoadComponent;
    useRouter: () => URouter;
    useStore: () => UStore;
};
export declare const setAppConfig: (config: Partial<{
    loadComponent: LoadComponent;
    useRouter: () => URouter;
    useStore: () => UStore;
}>) => void;
/*** @public */
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
    disableNativeRouter?: boolean;
}
/*** @public */
export declare function setUserConfig(conf: UserConfig): void;
/*** @public */
export interface RenderOptions {
    viewName?: string;
    id?: string;
    ssrKey?: string;
}
export interface ContextWrap {
}
export declare type AttachMP<App> = (app: App, moduleGetter: ModuleGetter, storeMiddlewares?: StoreMiddleware[], storeLogger?: StoreLogger) => App & {
    render(): {
        store: UStore;
        context: ContextWrap;
    };
};
export declare type CreateMP = (moduleGetter: ModuleGetter, storeMiddlewares?: StoreMiddleware[], storeLogger?: StoreLogger) => {
    render(): {
        store: UStore;
        context: ContextWrap;
    };
};
/*** @public */
export declare type CreateApp<INS = {}> = (moduleGetter: ModuleGetter, storeMiddlewares?: StoreMiddleware[], storeLogger?: StoreLogger) => INS & {
    render({ id, ssrKey, viewName }?: RenderOptions): Promise<void>;
};
/*** @public */
export declare type CreateSSR<INS = {}> = (moduleGetter: ModuleGetter, url: string, nativeData: any, storeMiddlewares?: StoreMiddleware[], storeLogger?: StoreLogger) => INS & {
    render({ id, ssrKey, viewName }?: RenderOptions): Promise<string>;
};
export interface EluxContext {
    deps?: Record<string, boolean>;
    documentHead: string;
    router?: URouter;
}
export declare function createBaseMP<INS = {}>(ins: INS, router: BaseEluxRouter, render: (eluxContext: EluxContext, ins: INS) => any, storeInitState: (data: RootState) => RootState, storeMiddlewares?: StoreMiddleware[], storeLogger?: StoreLogger): INS & {
    render(): {
        store: UStore;
        context: ContextWrap;
    };
};
export declare function createBaseApp<INS = {}>(ins: INS, router: BaseEluxRouter, render: (id: string, component: any, eluxContext: EluxContext, fromSSR: boolean, ins: INS, store: UStore) => void, storeInitState: (data: RootState) => RootState, storeMiddlewares?: StoreMiddleware[], storeLogger?: StoreLogger): INS & {
    render({ id, ssrKey, viewName }?: RenderOptions): Promise<void>;
};
export declare function createBaseSSR<INS = {}>(ins: INS, router: BaseEluxRouter, render: (id: string, component: any, eluxContext: EluxContext, ins: INS, store: UStore) => Promise<string>, storeInitState: (data: RootState) => RootState, storeMiddlewares?: StoreMiddleware[], storeLogger?: StoreLogger): INS & {
    render({ id, ssrKey, viewName }?: RenderOptions): Promise<string>;
};
/*** @public */
export declare function patchActions(typeName: string, json?: string): void;
/*** @public */
export declare type GetBaseFacade<F extends Facade, LoadComponentOptions, R extends string> = {
    State: FacadeStates<F, R>;
    GetActions<N extends Exclude<keyof F, R>>(...args: N[]): {
        [K in N]: F[K]['actions'];
    };
    LoadComponent: LoadComponent<F, LoadComponentOptions>;
    Modules: FacadeModules<F, R>;
    Actions: FacadeActions<F, R>;
};
/*** @public */
export declare function getApi<T extends {
    State: any;
    GetActions: any;
    LoadComponent: any;
    Modules: any;
}, R extends URouter>(demoteForProductionOnly?: boolean, injectActions?: Record<string, string[]>): Pick<T, 'GetActions' | 'LoadComponent' | 'Modules'> & {
    GetRouter: () => R;
    useRouter: () => R;
    useStore: () => UStore<T['State'], R['routeState']['params']>;
};
//# sourceMappingURL=index.d.ts.map