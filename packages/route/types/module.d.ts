import { CoreModuleHandlers, IStoreMiddleware, Action, CommonModule } from '@elux/core';
import { LocationTransform, PagenameMap, NativeLocationMap } from './transform';
import { RootParams, RouteState, HistoryAction } from './basic';
export declare class ModuleWithRouteHandlers<S extends Record<string, any>, R extends Record<string, any>> extends CoreModuleHandlers<S, R> {
    Init(initState: S): S;
    RouteParams(payload: Partial<S>): S;
}
export declare const RouteActionTypes: {
    MRouteParams: string;
    RouteChange: string;
    BeforeRouteChange: string;
};
export declare function beforeRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction, prevRootState?: Record<string, any>): Action;
export declare function routeChangeAction<P extends RootParams>(routeState: RouteState<P>, prevRootState?: Record<string, any>): Action;
export declare const routeMiddleware: IStoreMiddleware;
export declare type RouteModule = CommonModule & {
    locationTransform: LocationTransform;
};
export declare function createRouteModule<G extends PagenameMap>(pagenameMap: G, nativeLocationMap?: NativeLocationMap, notfoundPagename?: string, paramsKey?: string): {
    locationTransform: LocationTransform;
    moduleName: "route";
    model: (store: import("@elux/core").IStore<any>) => void | Promise<void>;
    state: RouteState<any>;
    params: {};
    actions: {};
    components: { [k in keyof G]: any; };
};
