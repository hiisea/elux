import { Action, RouteAction, Location } from '@elux/core';
export declare const ErrorCodes: {
    ROUTE_REDIRECT: string;
    ROUTE_BACK_OVERFLOW: string;
};
export declare function nativeUrlToUrl(nativeUrl: string): string;
export declare function urlToNativeUrl(eluxUrl: string): string;
export declare function urlToLocation(url: string): Location;
export declare function locationToUrl({ url, pathname, search, hash, searchQuery, hashQuery }: Partial<Location>): string;
export declare function locationToNativeLocation(location: Location): Location;
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
        in(pathname: string): string;
        out(pathname: string): string;
    };
}
export declare const routeConfig: RouteConfig;
export declare const setRouteConfig: (config: Partial<RouteConfig>) => void;
//# sourceMappingURL=basic.d.ts.map