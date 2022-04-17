import { CoreRouter, IRouteRecord, Location, NativeRequest, RouteTarget, RouteAction, Store, StoreState } from '@elux/core';
export { ErrorCodes, locationToNativeLocation, locationToUrl, nativeLocationToLocation, nativeUrlToUrl, routeConfig, setRouteConfig, urlToLocation, urlToNativeUrl, } from './basic';
export declare abstract class BaseNativeRouter {
    router: Router;
    routeKey: string;
    protected curTask?: {
        resolve: () => void;
        timeout: number;
    };
    constructor(nativeRequest: NativeRequest);
    protected abstract push(nativeLocation: Location, key: string): boolean;
    protected abstract replace(nativeLocation: Location, key: string): boolean;
    protected abstract relaunch(nativeLocation: Location, key: string): boolean;
    protected abstract back(nativeLocation: Location, key: string, index: [number, number]): boolean;
    protected onSuccess(): void;
    testExecute(method: RouteAction, location: Location, backIndex?: number[]): void;
    execute(method: RouteAction, location: Location, key: string, backIndex?: number[]): void | Promise<void>;
}
export declare class Router extends CoreRouter {
    private nativeRouter;
    private curTask?;
    private taskList;
    private readonly windowStack;
    private onTaskComplete;
    constructor(nativeRouter: BaseNativeRouter, nativeRequest: NativeRequest);
    private addTask;
    nativeInitiated(): boolean;
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
    private redirectOnServer;
    init(prevState: StoreState): Promise<void>;
    private _init;
    relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any, _nativeCaller?: boolean): Promise<void>;
    private _relaunch;
    replace(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any, _nativeCaller?: boolean): Promise<void>;
    private _replace;
    push(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any, _nativeCaller?: boolean): Promise<void>;
    private _push;
    back(stepOrKey?: number | string, target?: RouteTarget, payload?: any, overflowRedirect?: string, _nativeCaller?: boolean): Promise<void>;
    private _back;
}
//# sourceMappingURL=index.d.ts.map