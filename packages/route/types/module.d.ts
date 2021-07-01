import { CoreModuleHandlers, CoreModuleState, IStoreMiddleware, IStore, CommonModule } from '@elux/core';
import { LocationTransform } from './transform';
import type { RootParams, RouteState, HistoryAction } from './basic';
import type { PagenameMap, NativeLocationMap } from './transform';
export declare class ModuleWithRouteHandlers<S extends CoreModuleState, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
    Init(initState: S): S;
    RouteParams(payload: Partial<S>): S;
}
export declare const RouteActionTypes: {
    MRouteParams: string;
    RouteChange: string;
    TestRouteChange: string;
};
export declare function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): {
    type: string;
    payload: RouteState<P>[];
};
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction): {
    type: string;
    payload: any[];
};
export declare function routeChangeAction<P extends RootParams>(routeState: RouteState<P>): {
    type: string;
    payload: RouteState<P>[];
};
export declare const routeMiddleware: IStoreMiddleware;
export declare type RouteModule = CommonModule & {
    locationTransform: LocationTransform;
};
export declare function createRouteModule<G extends PagenameMap>(pagenameMap: G, nativeLocationMap?: NativeLocationMap, notfoundPagename?: string, paramsKey?: string): {
    locationTransform: LocationTransform;
    moduleName: "route";
    model: (store: IStore<{}>) => void | Promise<void>;
    state: RouteState<any>;
    params: {};
    actions: {};
    components: { [k in keyof G]: any; };
};
