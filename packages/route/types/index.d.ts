import { CoreRouter, IRouteRecord, Location, NativeRequest, RouteTarget, Store, StoreState } from '@elux/core';
export { ErrorCodes, locationToNativeLocation, locationToUrl, nativeLocationToLocation, nativeUrlToUrl, routeConfig, setRouteConfig, urlToLocation, urlToNativeUrl, } from './basic';
export declare abstract class BaseNativeRouter {
    router: Router;
    protected curTask?: {
        resolve: () => void;
        timeout: number;
    };
    constructor(nativeRequest: NativeRequest);
    protected abstract push(nativeLocation: Location, key: string): void | Promise<void>;
    protected abstract replace(nativeLocation: Location, key: string): void | Promise<void>;
    protected abstract relaunch(nativeLocation: Location, key: string): void | Promise<void>;
    protected abstract back(nativeLocation: Location, key: string, index: [number, number]): void | Promise<void>;
    testExecute(method: 'relaunch' | 'push' | 'replace' | 'back', location: Location, backIndex?: number[]): void;
    execute(method: 'relaunch' | 'push' | 'replace' | 'back', location: Location, key: string, backIndex?: number[]): void | Promise<void>;
}
export declare class Router extends CoreRouter {
    private nativeRouter;
    private curTask?;
    private taskList;
    private readonly windowStack;
    private onTaskComplete;
    constructor(nativeRouter: BaseNativeRouter, nativeRequest: NativeRequest);
    private addTask;
    getHistoryLength(target?: RouteTarget): number;
    findRecordByKey(recordKey: string): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly?: boolean): {
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
    private mountStore;
    init(prevState: StoreState): Promise<void>;
    private _init;
    private redirectOnServer;
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