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
 * @remarks
 * 通常使用默认设置即可
 *
 * @public
 */
export interface UserConfig {
    /**
     * 最大历史记录栈数
     *
     * @remarks
     * 默认: `10`
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
     * 默认: `服务器环境(SSR)：10000; 浏览器环境(CSR): 500`
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
     * 默认: `2`
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
    /**
     * 应用默认的404 Pagename
     *
     * @remarks
     * 默认: `/404`
     *
     * 未找到页面时默认使用该Pagename替代。
     *
     * @defaultValue `/404`
     */
    notfoundPagename: string;
    /**
     * 序列化路由参数key名
     *
     * @remarks
     * 默认: `_`
     *
     * 框架将路由参数序列化为string后，作为该key的value存入url，如：/index?`_`=`{...}`
     *
     * @defaultValue `_`
     */
    paramsKey: string;
    /**
     * APP根模块名称
     *
     * @remarks
     * 默认: `stage`
     *
     * APP根模块名称，通常约定为stage
     *
     * @defaultValue `stage`
     */
    AppModuleName?: string;
    /**
     * 不通知原生路由
     *
     * @remarks
     * 默认: `false`
     *
     * 框架有自己的路由体系，运行平台的原生路由体系作为外挂模式存在。默认情况下二者之间会建立关联，此设置为true可以彻底忽略原生路由体系。
     *
     * @defaultValue `false`
     */
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
export declare type ICreateApp<INS = {}> = (moduleGetter: ModuleGetter, storeMiddlewares?: StoreMiddleware[], storeLogger?: StoreLogger) => INS & {
    render({ id, ssrKey, viewName }?: RenderOptions): Promise<void>;
};
export declare type ICreateSSR<INS = {}> = (moduleGetter: ModuleGetter, url: string, nativeData: any, storeMiddlewares?: StoreMiddleware[], storeLogger?: StoreLogger) => INS & {
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