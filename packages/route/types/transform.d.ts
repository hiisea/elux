import { NativeLocationMap, PagenameMap, RouteState, RootParams, EluxLocation, NativeLocation, StateLocation } from './basic';
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
    withoutProtocol(url: string): string;
};
export interface ILocationTransform<P extends RootParams = any> {
    getPagename(): string;
    getFastUrl(): string;
    getEluxUrl(): string;
    getNativeUrl(withoutProtocol?: boolean): string;
    getParams(): Partial<P> | Promise<Partial<P>>;
}
export declare function location<P extends RootParams = any>(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation): ILocationTransform<P>;
export declare function createRouteModule<G extends PagenameMap>(pagenameMap: G, nativeLocationMap?: NativeLocationMap): {
    moduleName: any;
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
