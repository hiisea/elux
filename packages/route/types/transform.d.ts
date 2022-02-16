import { RootState } from '@elux/core';
import { NativeLocationMap, PagenameMap, EluxLocation, NativeLocation, StateLocation } from './basic';
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
/*** @public */
export interface ULocationTransform {
    getPagename(): string;
    getEluxUrl(): string;
    getNativeUrl(withoutProtocol?: boolean): string;
    getParams(): RootState | Promise<RootState>;
}
/*** @public */
export declare function location(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation): ULocationTransform;
/*** @public */
export declare function createRouteModule<G extends PagenameMap, N extends string>(moduleName: N, pagenameMap: G, nativeLocationMap?: NativeLocationMap): {
    moduleName: N;
    initModel: (store: import("@elux/core").UStore<RootState, RootState>) => void | Promise<void>;
    state: import("@elux/core").ModuleState;
    routeParams: import("@elux/core").ModuleState;
    actions: import("@elux/core").PickActions<import("@elux/core").CommonModel>;
    components: {};
    data: keyof G;
};
//# sourceMappingURL=transform.d.ts.map