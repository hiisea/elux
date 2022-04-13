import { ModuleGetter, StoreLogger, StoreMiddleware } from '@elux/core';
export { BaseModel, deepMerge, effect, effectLogger, EmptyModel, env, errorAction, exportComponent, exportModule, exportView, getApi, getComponent, getModule, isServer, modelHotReplacement, reducer, setLoading, } from '@elux/core';
export type { Action, ActionCreator, ActionError, API, AsyncEluxComponent, CommonModel, CommonModelClass, CommonModule, Dispatch, EluxComponent, Facade, GetPromiseComponent, GetPromiseModule, GetState, HandlerToAction, ILoadComponent, IRouter, IRouteRecord, IStore, LoadingState, Location, ModelAsCreators, ModuleFacade, ModuleGetter, ModuleState, NativeRequest, PickModelActions, RenderOptions, ReturnComponents, RouteAction, RouteRuntime, RouteTarget, StoreLogger, storeLoggerInfo, StoreMiddleware, StoreState, } from '@elux/core';
export { ErrorCodes, locationToNativeLocation, locationToUrl, nativeLocationToLocation, nativeUrlToUrl, urlToLocation, urlToNativeUrl, } from '@elux/route';
/*** @public */
export declare type ComputedStore<T> = {
    [K in keyof T]-?: () => T[K];
};
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
     * 定义应用的首页
     *
     * @defaultValue `/`
     *
     * @remarks
     * 默认: `/`
     */
    HomeUrl: string;
    /**
     * 定义内部和宿主平台路由之间的转换与映射
     */
    NativePathnameMapping?: {
        in(pathname: string): string;
        out(pathname: string): string;
    };
    /**
     * 定义Loading超过多少秒视为深度加载
     *
     * @defaultValue `2`
     *
     * @remarks
     * 默认: `2`
     *
     * 框架将Loading状态分为3种：{@link LoadingState}，可根据不同的状态来个性化显示，如：浅度loading时显示透明蒙层，深度loading时显示icon+灰色蒙层
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
     * 定义默认视图加载错误组件
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
     * 是否不通知原生路由
     *
     * @defaultValue `false`
     *
     * @remarks
     * 默认: `false`
     *
     * 框架有自己的路由体系，运行平台的原生路由体系作为外挂模式存在。默认情况下二者之间会建立关联，此设置为true可以彻底忽略原生路由体系。
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