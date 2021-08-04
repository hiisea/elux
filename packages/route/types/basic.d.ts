export interface RouteConfig {
    maxHistory: number;
    notifyNativeRouter: {
        root: boolean;
        internal: boolean;
    };
    indexUrl: string;
}
export declare const routeConfig: RouteConfig;
export declare const setRouteConfig: (config: Partial<RouteConfig>) => void;
export declare const routeMeta: {
    pagenames: Record<string, string>;
    defaultParams: Record<string, any>;
    pages: Record<string, any>;
};
export declare type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';
export declare type ModuleParams = Record<string, any>;
export declare type RootParams = Record<string, ModuleParams>;
export interface Location<P extends RootParams = {}> {
    pagename: string;
    params: Partial<P>;
}
export interface PayloadLocation<P extends RootParams = {}, N extends string = string> {
    pathname?: N;
    params?: DeepPartial<P>;
    extendParams?: DeepPartial<P> | 'current';
}
export declare type RouteState<P extends RootParams = {}> = Location<P> & {
    action: HistoryAction;
    key: string;
};
export declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export interface PartialLocation {
    pagename: string;
    params: Record<string, any>;
}
export interface EluxLocation {
    pathname: string;
    params: Record<string, any>;
}
export interface NativeLocation {
    pathname: string;
    searchData?: Record<string, string>;
    hashData?: Record<string, string>;
}
