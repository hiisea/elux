import { LoadingState, Action, UStore, RouteState, ModuleState, RootState } from './basic';
export declare const ActionTypes: {
    /**
     * 为模块注入加载状态时使用ActionType：moduleName.MLoading
     */
    MLoading: string;
    /**
     * 模块初始化时使用ActionType：moduleName.MInit
     */
    MInit: string;
    MRouteTestChange: string;
    MRouteBeforeChange: string;
    MRouteChange: string;
    Error: string;
};
/*** @public */
export declare function errorAction(error: Object): Action;
export declare function routeChangeAction(routeState: RouteState): Action;
export declare function routeBeforeChangeAction(routeState: RouteState): Action;
export declare function routeTestChangeAction(routeState: RouteState): Action;
export declare function moduleInitAction(moduleName: string, initState: ModuleState): Action;
export declare function moduleLoadingAction(moduleName: string, loadingState: {
    [group: string]: LoadingState;
}): Action;
export declare function moduleRouteChangeAction(moduleName: string, params: RootState, action: string): Action;
/*** @public */
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
/*** @public */
export declare function effect(loadingKey?: string | null): Function;
/*** @public */
export declare function effectLogger(before: (action: Action, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
/*** @public */
export declare function setLoading<T extends Promise<any>>(store: UStore, item: T, moduleName: string, groupName: string): T;
//# sourceMappingURL=actions.d.ts.map