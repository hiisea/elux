import { IStoreMiddleware, Action, CommonModule, IStore } from '@elux/core';
import { LocationTransform, PagenameMap, NativeLocationMap } from './transform';
import { RootParams, RouteState, HistoryAction } from './basic';
export declare const RouteActionTypes: {
    MRouteParams: string;
    RouteChange: string;
    TestRouteChange: string;
    BeforeRouteChange: string;
};
export declare function beforeRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
export declare function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
export declare function routeParamsAction(moduleName: string, params: any, action: HistoryAction, prevRootState?: Record<string, any>): Action;
export declare function routeChangeAction<P extends RootParams>(routeState: RouteState<P>, prevRootState?: Record<string, any>): Action;
export declare const routeMiddleware: IStoreMiddleware;
export declare type RouteModule = CommonModule & {
    locationTransform: LocationTransform;
};
export declare function createRouteModule<G extends PagenameMap>(pagenameMap: G, nativeLocationMap?: NativeLocationMap, notfoundPagename?: string, paramsKey?: string): {
    locationTransform: LocationTransform;
    moduleName: "route";
    model: (store: IStore<any>) => void | Promise<void>;
    state: RouteState<any>;
    params: {};
    actions: {
        destroy: () => {
            type: string;
        };
    };
    components: { [k in keyof G]: any; };
};
