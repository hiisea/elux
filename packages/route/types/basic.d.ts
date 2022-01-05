/*** @internal */
export declare type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';
/*** @internal */
export declare type RootParams = Record<string, any>;
/*** @internal */
export declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
/*** @internal */
export interface EluxLocation<P extends RootParams = any> {
    pathmatch: string;
    args: DeepPartial<P>;
}
/*** @internal */
export interface NativeLocation {
    pathname: string;
    query: string;
}
/*** @internal */
export interface StateLocation<P extends RootParams = any, N extends string = string> {
    pagename: N;
    payload: DeepPartial<P>;
}
/*** @internal */
export interface LocationState<P extends RootParams = any> {
    pagename: string;
    params: Partial<P>;
}
/*** @internal */
export interface RouteState<P extends RootParams = any> {
    action: HistoryAction;
    key: string;
    pagename: string;
    params: Partial<P>;
}
/*** @internal */
export interface NativeLocationMap {
    in(nativeLocation: NativeLocation): EluxLocation;
    out(eluxLocation: EluxLocation): NativeLocation;
}
/*** @internal */
export interface PagenameMap {
    [pageName: string]: {
        argsToParams(pathArgs: Array<string | undefined>): Record<string, any>;
        paramsToArgs: Function;
        page?: any;
    };
}
export interface RouteConfig {
    RouteModuleName: string;
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
    pagenames: Record<string, string>;
    defaultParams: Record<string, any>;
    pages: Record<string, any>;
    pagenameMap: Record<string, any>;
    pagenameList: string[];
    nativeLocationMap: NativeLocationMap;
};
/*** @internal */
export declare function safeJsonParse(json: string): Record<string, any>;
//# sourceMappingURL=basic.d.ts.map