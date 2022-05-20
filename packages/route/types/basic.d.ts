import { Action, Location, RouteAction } from '@elux/core';
/**
 * 内置ErrorCode
 *
 * @public
 */
export declare const ErrorCodes: {
    /**
     * 在SSR服务器渲染时，操作路由跳转会抛出该错误
     */
    ROUTE_REDIRECT: string;
    /**
     * 在路由后退时，如果步数溢出则抛出该错误
     */
    ROUTE_BACK_OVERFLOW: string;
};
/**
 * 原生路由Url转换为内部路由Url
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export declare function nativeUrlToUrl(nativeUrl: string): string;
/**
 * 内部路由Url转换为原生路由Url
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export declare function urlToNativeUrl(eluxUrl: string): string;
/**
 * Url转换为Location
 *
 * @public
 */
export declare function urlToLocation(url: string): Location;
/**
 * Location转换为Url
 *
 * @public
 */
export declare function locationToUrl({ url, pathname, search, hash, classname, searchQuery, hashQuery }: Partial<Location>): string;
/**
 * 内部路由Location转换为原生路由Location
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export declare function locationToNativeLocation(location: Location): Location;
/**
 * 原生路由Location转换为内部路由Location
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export declare function nativeLocationToLocation(location: Location): Location;
export declare function testChangeAction(location: Location, routeAction: RouteAction): Action;
export declare function beforeChangeAction(location: Location, routeAction: RouteAction): Action;
export declare function afterChangeAction(location: Location, routeAction: RouteAction): Action;
export interface RouteConfig {
    NotifyNativeRouter: {
        window: boolean;
        page: boolean;
    };
    QueryString: {
        parse(str: string): {
            [key: string]: any;
        };
        stringify(query: {
            [key: string]: any;
        }): string;
    };
    HomeUrl: string;
    NativePathnameMapping: {
        in(nativePathname: string): string;
        out(internalPathname: string): string;
    };
}
export declare const routeConfig: RouteConfig;
export declare const setRouteConfig: (config: Partial<RouteConfig>) => void;
//# sourceMappingURL=basic.d.ts.map