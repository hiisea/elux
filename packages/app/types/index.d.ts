import { ModuleGetter, StoreLogger, StoreMiddleware } from '@elux/core';
export { BaseModel, deepMerge, effect, effectLogger, EmptyModel, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isServer, modelHotReplacement, moduleExists, reducer, setLoading, ErrorCodes, locationToNativeLocation, locationToUrl, nativeLocationToLocation, nativeUrlToUrl, urlToLocation, urlToNativeUrl, } from '@elux/core';
export type { Action, ActionCreator, ActionError, API, AsyncEluxComponent, CommonModel, CommonModelClass, CommonModule, Dispatch, EluxComponent, Facade, GetPromiseComponent, GetPromiseModule, GetState, HandlerToAction, IGetComponent, IGetData, ILoadComponent, IRouter, IRouteRecord, IStore, VStore, LoadingState, Location, ModelAsCreators, ModuleFacade, ModuleGetter, ModuleState, PickModelActions, PickThisActions, RenderOptions, ReturnComponents, RouteAction, RouteEvent, RouterInitOptions, RouteRuntime, RouteTarget, StoreLogger, StoreLoggerInfo, StoreMiddleware, StoreState, UNListener, } from '@elux/core';
/**
 * 全局参数设置
 *
 * @remarks
 * 可通过 {@link setConfig} 个性化设置
 *
 * @public
 */
export interface UserConfig {
    /**
     * 定义模块获取方法
     */
    ModuleGetter: ModuleGetter;
    /**
     * 定义路由参数序列化方法
     */
    QueryString: {
        parse(str: string): {
            [key: string]: any;
        };
        stringify(query: {
            [key: string]: any;
        }): string;
    };
    /**
     * 定义虚拟路由和原生路由的Url映射
     */
    NativePathnameMapping?: {
        in(nativePathname: string): string;
        out(internalPathname: string): string;
    };
    /**
     * 定义Loading超过多少秒视为深度加载
     *
     * @defaultValue `1`
     *
     * @remarks
     * 默认: `1`
     *
     * 框架中存在3种不同程度的Loading状态:{@link LoadingState}，可定制不同的界面。如浅度loading时显示无感知的透明蒙层，深度时显示Icon和灰色
     */
    DepthTimeOnLoading?: number;
    /**
     * 定义APP根模块名称
     *
     * @defaultValue `stage`
     *
     * @remarks
     * 默认: `stage`
     */
    StageModuleName?: string;
    /**
     * 定义APP根视图名称
     *
     * @defaultValue `main`
     *
     * @remarks
     * 默认: `main`
     */
    StageViewName?: string;
    /**
     * 定义默认的视图加载错误组件
     *
     * @defaultValue `<div className="g-component-error">{message}</div>`
     *
     * @remarks
     * 默认: `<div className="g-component-error">{message}</div>`
     *
     * 此设置为全局默认，LoadComponent方法中可以单独设置，参见 {@link ILoadComponent}
     *
     */
    LoadComponentOnError?: Elux.Component<{
        message: string;
    }>;
    /**
     * 定义默认视图加载中组件
     *
     * @defaultValue `<div className="g-component-loading">loading...</div>`
     *
     * @remarks
     * 默认: `<div className="g-component-loading">loading...</div>`
     *
     * 此设置为全局默认，LoadComponent方法中可以单独设置，参见 {@link ILoadComponent}
     */
    LoadComponentOnLoading?: Elux.Component<{}>;
    /**
     * 定义Store中间件
     */
    StoreMiddlewares?: StoreMiddleware[];
    /**
     * 定义Store日志记录器
     */
    StoreLogger?: StoreLogger;
    /**
     * 强制不与原生路由关联
     *
     * @defaultValue `false`
     *
     * @remarks
     * 默认: `false`
     *
     * 虚拟路由默认会关联到原生路由，可以断开关联
     *
     */
    DisableNativeRouter?: boolean;
}
declare const appConfig: unique symbol;
/*** @public */
export declare type AppConfig = typeof appConfig;
/**
 * 全局参数设置
 *
 * @remarks
 *
 * - UserConfig：{@link UserConfig | UserConfig}
 *
 * @param conf - 全局参数
 *
 * @public
 */
export declare function setConfig(conf: UserConfig): AppConfig;
/**
 * 用于兼容不支持Proxy的低版本浏览器
 *
 * @public
 */
export declare function patchActions(typeName: string, json?: string): void;
//# sourceMappingURL=index.d.ts.map