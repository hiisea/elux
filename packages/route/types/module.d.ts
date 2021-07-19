import { CoreModuleHandlers, IStoreMiddleware, IStore, Action, CommonModule } from '@elux/core';
import { LocationTransform } from './transform';
import type { RootParams, RouteState, HistoryAction } from './basic';
import type { PagenameMap, NativeLocationMap } from './transform';
export declare class ModuleWithRouteHandlers<S extends Record<string, any>, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
    Init(initState: S): S;
    RouteParams(payload: Partial<S>): S;
}
export declare const RouteActionTypes: {
    MRouteParams: string;
    RouteChange: string;
    TestRouteChange: string;
};
export declare function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction): Action;
export declare function routeChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
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
