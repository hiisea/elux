import { RootState, DeepPartial } from '@elux/core';
/*** @public */
export interface EluxLocation<P extends RootState = RootState> {
    pathmatch: string;
    args: DeepPartial<P>;
}
/*** @public */
export interface NativeLocation {
    pathname: string;
    query: string;
}
/*** @public */
export interface StateLocation<P extends RootState = RootState, N extends string = string> {
    pagename: N;
    payload: DeepPartial<P>;
}
/*** @public */
export interface NativeLocationMap {
    in(nativeLocation: NativeLocation): EluxLocation;
    out(eluxLocation: EluxLocation): NativeLocation;
}
/*** @public */
export declare type PagenameMap<P extends string = string> = {
    [K in P]: {
        argsToParams(pathArgs: Array<string | undefined>): Record<string, any>;
        paramsToArgs(params: Record<string, any>): Array<string | undefined>;
        pageData?: any;
    };
};
export interface RouteConfig {
    maxHistory: number;
    maxLocationCache: number;
    notifyNativeRouter: {
        root: boolean;
        internal: boolean;
    };
    indexUrl: string;
    notfoundPagename: string;
    paramsKey: string;
}
export declare const routeConfig: RouteConfig;
export declare const setRouteConfig: (config: Partial<RouteConfig>) => void;
export declare const routeMeta: {
    defaultParams: Record<string, any>;
    pageDatas: Record<string, any>;
    pagenameMap: Record<string, any>;
    pagenameList: string[];
    nativeLocationMap: NativeLocationMap;
};
/*** @public */
export declare function safeJsonParse(json: string): Record<string, any>;
//# sourceMappingURL=basic.d.ts.map