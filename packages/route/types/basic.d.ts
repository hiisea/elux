export interface RouteConfig {
    actionMaxHistory: number;
    pagesMaxHistory: number;
    pagenames: Record<string, string>;
    disableNativeRoute: boolean;
    indexUrl: string;
    defaultParams: null | Record<string, any>;
}
export declare const routeConfig: RouteConfig;
export declare function setRouteConfig(conf: {
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    indexUrl?: string;
    disableNativeRoute?: boolean;
    defaultParams?: Record<string, any>;
}): void;
export declare type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';
export declare type ModuleParams = Record<string, any>;
export declare type RootParams = Record<string, ModuleParams>;
export interface Location<P extends RootParams = {}> {
    pagename: string;
    params: Partial<P>;
}
export interface PayloadLocation<P extends RootParams = {}, N extends string = string> {
    pagename?: N;
    params?: DeepPartial<P>;
    extendParams?: DeepPartial<P> | 'current';
}
export interface PartialLocation<P extends RootParams = {}> {
    pagename: string;
    params: DeepPartial<P>;
}
export declare type RouteState<P extends RootParams = {}> = Location<P> & {
    action: HistoryAction;
    key: string;
};
export declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
export interface EluxLocation {
    pagename: string;
    params: unknown;
}
