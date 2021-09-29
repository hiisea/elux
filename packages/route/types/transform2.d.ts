import { NativeLocationMap, PagenameMap, RouteState, RootParams } from './basic';
export declare const urlParser: {
    type: {
        e: string;
        s: string;
        n: string;
    };
    getNativeUrl(pathname: string, query: string): string;
    getEluxUrl(pathmatch: string, args: Record<string, any>): string;
    getStateUrl(pagename: string, payload: Record<string, any>): string;
    parseNativeUrl(nurl: string): {
        pathname: string;
        query: string;
    };
    parseStateUrl(surl: string): {
        pagename: string;
        payload: Record<string, any>;
    };
    getUrl(type: 'e' | 'n' | 's', path: string, search: string): string;
    getPath(url: string): string;
    getSearch(url: string): string;
    stringifySearch(data: Record<string, any>): string;
    parseSearch(search: string): Record<string, any>;
    checkUrl(url: string): string;
    checkPath(path: string): string;
};
export interface LocationCache {
    _eurl?: string;
    _nurl?: string;
    _pagename?: string;
    _payload?: Record<string, any>;
    _params?: Record<string, any>;
}
interface ILocationTransform<P extends RootParams = any> {
    getPagename(): string;
    getFastUrl(): string;
    getEluxUrl(): string;
    getNativeUrl(): string;
    getParams(): Partial<P> | Promise<Partial<P>>;
}
export declare class LocationTransform implements ILocationTransform, LocationCache {
    private readonly url;
    readonly _eurl?: string;
    readonly _nurl?: string;
    readonly _pagename?: string;
    readonly _payload?: Record<string, any>;
    readonly _params?: Record<string, any>;
    private _pathmatch?;
    private _search?;
    private _pathArgs?;
    private _args?;
    private _minData?;
    constructor(url: string, data: LocationCache);
    private update;
    private getPathmatch;
    private getSearch;
    private getArgs;
    private getPathArgs;
    private getPayload;
    private getMinData;
    private toStringArgs;
    getPagename(): string;
    getFastUrl(): string;
    getEluxUrl(): string;
    getNativeUrl(): string;
    getParams(): Record<string, any> | Promise<Record<string, any>>;
}
export declare function createLocationTransform<P extends RootParams = any>(dataOrUrl: string | {
    pathmatch: string;
    args: Record<string, any>;
} | {
    pagename: string;
    payload: Record<string, any>;
} | {
    pathname: string;
    query: string;
}): ILocationTransform<P>;
export declare function createRouteModule<N extends string, G extends PagenameMap>(moduleName: N, pagenameMap: G, nativeLocationMap?: NativeLocationMap): {
    moduleName: N;
    model: (store: import("@elux/core").IStore<any>) => void | Promise<void>;
    state: RouteState<any>;
    params: {};
    actions: {
        destroy: () => {
            type: string;
        };
    };
    components: { [k in keyof G]: any; };
};
export {};
