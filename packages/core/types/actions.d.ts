import { Action, IStore } from './basic';
import { LoadingState } from './sprite';
/**
 * @internal
 */
export declare const ActionTypes: {
    /**
     * 为模块注入加载状态时使用ActionType：moduleName.MLoading
     */
    MLoading: string;
    /**
     * 模块初始化时使用ActionType：moduleName.MInit
     */
    MInit: string;
    /**
     * 模块初始化时使用ActionType：moduleName.MReInit
     */
    MReInit: string;
    MRouteChange: string;
    Error: string;
};
/**
 * @internal
 */
export declare function errorAction(error: Object): Action;
export declare function routeChangeAction(routeState: Record<string, any>): Action;
export declare function moduleInitAction(moduleName: string, initState: Record<string, any>): Action;
export declare function moduleLoadingAction(moduleName: string, loadingState: {
    [group: string]: LoadingState;
}): Action;
export declare function moduleRouteChangeAction(moduleName: string, params: Record<string, any>, action: string): Action;
/**
 * @internal
 */
export declare function setLoading<T extends Promise<any>>(store: IStore, item: T, moduleName: string, groupName: string): T;
/**
 * @internal
 */
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
/**
 * @internal
 */
export declare function effect(loadingKey?: string | null): Function;
/**
 * @internal
 */
export declare const mutation: typeof reducer;
/**
 * @internal
 */
export declare const action: typeof effect;
/**
 * @internal
 */
export declare function logger(before: (action: Action, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=actions.d.ts.map