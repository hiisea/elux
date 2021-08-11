import { Action, IStore } from './basic';
import { LoadingState } from './sprite';
export declare const ActionTypes: {
    MLoading: string;
    MInit: string;
    MReInit: string;
    MRouteChange: string;
    Error: string;
};
export declare function errorAction(error: Object): Action;
export declare function routeChangeAction(routeState: Record<string, any>): Action;
export declare function moduleInitAction(moduleName: string, initState: Record<string, any>): Action;
export declare function moduleLoadingAction(moduleName: string, loadingState: {
    [group: string]: LoadingState;
}): Action;
export declare function moduleRouteChangeAction(moduleName: string, params: Record<string, any>, action: string): Action;
export declare function setLoading<T extends Promise<any>>(store: IStore, item: T, moduleName: string, groupName: string): T;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
export declare function effect(loadingKey?: string | null): Function;
export declare const mutation: typeof reducer;
export declare const action: typeof effect;
export declare function logger(before: (action: Action, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
