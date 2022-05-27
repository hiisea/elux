import { CoreRouter, IRouteRecord, Location, RouteAction, RouterInitOptions, RouteTarget, Store, StoreState } from '@elux/core';
export { ErrorCodes, locationToNativeLocation, locationToUrl, nativeLocationToLocation, nativeUrlToUrl, routeConfig, setRouteConfig, urlToLocation, urlToNativeUrl, } from './basic';
export declare abstract class BaseNativeRouter {
    router: Router;
    routeKey: string;
    protected curTask?: {
        resolve: () => void;
        timeout: number;
    };
    constructor();
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
    private windowStack;
    private documentHead;
    private onTaskComplete;
    constructor(nativeRouter: BaseNativeRouter);
    private addTask;
    getDocumentHead(): string;
    setDocumentHead(html: string): void;
    private savePageTitle;
    nativeInitiated(): boolean;
    getHistoryLength(target?: RouteTarget): number;
    getHistory(target?: RouteTarget): IRouteRecord[];
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
    getActivePage(): {
        location: Location;
        store: Store;
    };
    getCurrentPages(): {
        location: Location;
        store: Store;
    }[];
    private mountStore;
    private redirectOnServer;
    init(routerInitOptions: RouterInitOptions, prevState: StoreState): Promise<void>;
    private _init;
    relaunch(partialLocation: Partial<Location>, target?: RouteTarget, payload?: any, _nativeCaller?: boolean): Promise<void>;
    private _relaunch;
    replace(partialLocation: Partial<Location>, target?: RouteTarget, payload?: any, _nativeCaller?: boolean): Promise<void>;
    private _replace;
    push(partialLocation: Partial<Location>, target?: RouteTarget, payload?: any, _nativeCaller?: boolean): Promise<void>;
    private _push;
    back(stepOrKey?: number | string, target?: RouteTarget, payload?: any, overflowRedirect?: string, _nativeCaller?: boolean): Promise<void>;
    private _back;
}
//# sourceMappingURL=index.d.ts.map