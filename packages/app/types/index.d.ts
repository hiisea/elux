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
/**
 * 全局参数设置
 *
 * @public
 */
export interface UserConfig {
    /**
     * 最大历史记录栈数
     *
     * @remarks
     * 默认: 10
     *
     * 此数值也表示可能同时存在的历史Page数量，设置过大可能导致页面Dom过多
     *
     * @defaultValue `10`
     */
    maxHistory?: number;
    /**
     * 最大路由转换缓存数
     *
     * @remarks
     * 服务器环境(SSR)下默认: 10000，浏览器环境下默认: 500
     *
     * 由于elux中存在3种路由协议：eluxUrl [`e://...`]，nativeUrl [`n://...`]，stateUrl [`s://...`]，为了提高路由协议之间相互转换的性能（尤其是在SSR时，存在大量重复路由协议转换），框架做了缓存，此项目设置最大缓存数量
     *
     * @defaultValue `SSR：10000; CSR: 500`
     */
    maxLocationCache?: number;
    /**
     * 超过多少秒Loading视为深度加载
     *
     * @remarks
     * 默认: 2
     *
     * 框架将Loading状态分为3种：{@link LoadingState | LoadingState}，可根据不同的状态来个性化显示，如：浅度loading时仅显示icon图标，深度loading时显示icon图标+灰色蒙层
     *
     * @defaultValue `2`
     */
    DepthTimeOnLoading?: number;
    /**
     * 设置应用的首页路由
     *
     * @remarks
     * 默认: `/index`
     *
     * 当调用路由Router.back(...)回退时，如果回退步数溢出（超出历史记录数），默认使用此路由回到应用首页。
     *
     * Router.back(...)中可以单独设置，参见 {@link URouter.back | URouter.back() }
     *
     * @defaultValue `/index`
     */
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