import { Location, RouteTarget, IRouteRecord, CoreRouter, Store, StoreState } from '@elux/core';
export { setRouteConfig, routeConfig, locationToUrl, urlToLocation, toNativeLocation, toEluxLocation } from './basic';
export declare abstract class BaseNativeRouter {
    readonly nativeLocation: Partial<Location>;
    readonly nativeData: unknown;
    protected curTask?: {
        resolve: () => void;
        reject: () => void;
    };
    constructor(nativeLocation: Partial<Location>, nativeData: unknown);
    protected abstract push(nativeLocation: Location, key: string): boolean;
    protected abstract replace(nativeLocation: Location, key: string): boolean;
    protected abstract relaunch(nativeLocation: Location, key: string): boolean;
    protected abstract back(nativeLocation: Location, key: string, index: [number, number]): boolean;
    protected onSuccess(key: string): void;
    protected onError(key: string): void;
    execute(method: 'relaunch' | 'push' | 'replace' | 'back', location: Location, key: string, backIndex?: number[]): void | Promise<void>;
}
export declare class Router extends CoreRouter {
    private nativeRouter;
    private curTask?;
    private taskList;
    private readonly windowStack;
    private onTaskComplete;
    constructor(nativeRouter: BaseNativeRouter);
    private addTask;
    getHistoryLength(target?: RouteTarget): number;
    findRecordByKey(recordKey: string): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    getCurrentPage(): {
        url: string;
        store: Store;
    };
    getWindowPages(): {
        url: string;
        store: Store;
    }[];
    init(prevState: StoreState): Promise<void>;
    private mountStore;
    relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any, _nativeCaller?: boolean): void | Promise<void>;
    private _relaunch;
    replace(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any, _nativeCaller?: boolean): void | Promise<void>;
    private _replace;
    push(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any, _nativeCaller?: boolean): void | Promise<void>;
    private _push;
    back(stepOrKey?: number | string, target?: RouteTarget, payload?: any, overflowRedirect?: string, _nativeCaller?: boolean): void | Promise<void>;
    private _back;
}
//# sourceMappingURL=index.d.ts.map