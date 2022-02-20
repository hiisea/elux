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
 * 可通过 {@link setConfig | setConfig(...)} 个性化设置（通常使用默认设置即可）
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
     * 由于elux中存在{@link EluxLocation | 3种路由协议}：eluxUrl [`e://...`]，nativeUrl [`n://...`]，stateUrl [`s://...`]，为了提高路由协议之间相互转换的性能（尤其是在SSR时，存在大量重复路由协议转换），框架做了缓存，此项目设置最大缓存数量
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
export declare function setUserConfig(conf: UserConfig): void;
/**
 * APP Render参数
 *
 * @example
 * ```js
 * createApp(moduleGetter).render({id: 'root', viewName: 'main', ssrKey: 'eluxInitStore'})
 * ```
 *
 * @public
 */
export interface RenderOptions {
    /**
     * 根视图名称，默认为 `main`
     */
    viewName?: string;
    /**
     * 挂载 Dom 的 id，默认为 `root`
     */
    id?: string;
    /**
     * SSR脱水数据的变量名称，默认为 `eluxInitStore`
     */
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
/**
 * 获取应用全局方法
 *
 * @remarks
 * 参数 `components` 支持异步获取组件，当组件代码量大时，可以使用 `import(...)` 返回Promise
 *
 * @param demoteForProductionOnly - 用于不支持Proxy的运行环境，参见：`兼容IE浏览器`
 * @param injectActions -  用于不支持Proxy的运行环境，参见：`兼容IE浏览器`
 *
 * @returns
 * 返回包含多个全局方法的结构体：
 *
 * - `LoadComponent`：用于加载其它模块导出的{@link exportView | EluxUI组件}，参见 {@link LoadComponent}。
 * 相比直接 `import`，使用此方法加载组件不仅可以`按需加载`，而且还可以自动初始化其所属 Model，例如：
 * ```js
 *   const Article = LoadComponent('article', 'main')
 * ```
 *
 * - `Modules`：用于获取所有模块的对外接口，参见 {@link FacadeModules}，例如：
 * ```js
 *   dispatch(Modules.article.actions.refresh())
 * ```
 *
 * - `GetActions`：当需要 dispatch 多个 module 的 action 时，例如：
 * ```js
 *   dispatch(Modules.a.actions.a1())
 *   dispatch(Modules.b.actions.b1())
 * ```
 *   这种写法可以简化为：
 * ```js
 *   const {a, b} = GetActions('a', 'b')
 *   dispatch(a.a1())
 *   dispatch(b.b1())
 * ```
 *
 * - `GetRouter`：用于获取全局Roter，注意此方法不能运行在SSR（`服务端渲染`）中，因为服务端每个 `request` 都将生成一个 Router，不存在全局 Roter，请使用 `useRouter()`
 *
 * - `useRouter`：React Hook，用于获取当前 Router，在CSR（`客户端渲染`）中，因为只存在一个Router，所以其值等于`GetRouter()`，例如：
 * ```js
 *   const blobalRouter = GetRouter()
 *   const currentRouter = useRouter()
 *   console.log(blobalRouter===currentRouter)
 * ```
 *
 * - `useStore`：React Hook，用于获取当前 Store，例如：
 * ```js
 *   const store = useStore()
 *   store.dispatch(Modules.article.actions.refresh())
 * ```
 *
 * @example
 * ```js
 * const {Modules, LoadComponent, GetActions, GetRouter, useStore, useRouter} = getApi<API, Router>();
 * ```
 *
 * @public
 */
export declare function getApi<TAPI extends {
    State: any;
    GetActions: any;
    LoadComponent: any;
    Modules: any;
}, R extends URouter>(demoteForProductionOnly?: boolean, injectActions?: Record<string, string[]>): Pick<TAPI, 'GetActions' | 'LoadComponent' | 'Modules'> & {
    GetRouter: () => R;
    useRouter: () => R;
    useStore: () => UStore<TAPI['State'], R['routeState']['params']>;
};
//# sourceMappingURL=index.d.ts.map