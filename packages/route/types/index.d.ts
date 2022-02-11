import { UStore, EStore, CoreRouter, RootState, RouteState, UNListener, DeepPartial, MultipleDispatcher } from '@elux/core';
import { EluxLocation, NativeLocation, StateLocation } from './basic';
import { RootStack, UHistoryRecord } from './history';
import { ULocationTransform } from './transform';
export { setRouteConfig, routeConfig, safeJsonParse } from './basic';
export { location, createRouteModule, urlParser } from './transform';
export type { UHistoryRecord } from './history';
export type { ULocationTransform } from './transform';
export type { EluxLocation, NativeLocation, StateLocation, PagenameMap, NativeLocationMap } from './basic';
export declare abstract class BaseNativeRouter {
    protected curTask?: () => void;
    protected eluxRouter: URouter;
    protected abstract push(location: ULocationTransform, key: string): void | true | Promise<void>;
    protected abstract replace(location: ULocationTransform, key: string): void | true | Promise<void>;
    protected abstract relaunch(location: ULocationTransform, key: string): void | true | Promise<void>;
    protected abstract back(location: ULocationTransform, index: [number, number], key: string): void | true | Promise<void>;
    abstract destroy(): void;
    protected onChange(key: string): boolean;
    startup(router: URouter): void;
    execute(method: 'relaunch' | 'push' | 'replace' | 'back', location: ULocationTransform, ...args: any[]): Promise<void>;
}
export declare class BaseEluxRouter extends MultipleDispatcher<{
    change: {
        routeState: RouteState;
        root: boolean;
    };
}> implements CoreRouter, URouter {
    protected nativeRouter: BaseNativeRouter;
    nativeData: unknown;
    private _curTask?;
    private _taskList;
    location: ULocationTransform;
    routeState: RouteState;
    readonly name: string;
    initialize: Promise<RouteState>;
    readonly rootStack: RootStack;
    latestState: Record<string, any>;
    constructor(nativeUrl: string, nativeRouter: BaseNativeRouter, nativeData: unknown);
    startup(store: EStore): void;
    getCurrentPages(): {
        pagename: string;
        store: UStore;
        pageData?: any;
    }[];
    getCurrentStore(): EStore;
    getStoreList(): EStore[];
    getHistoryLength(root?: boolean): number;
    findRecordByKey(recordKey: string): {
        record: UHistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: UHistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
    extendCurrent(params: DeepPartial<RootState>, pagename?: string): StateLocation;
    relaunch(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _relaunch;
    push(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _push;
    replace(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _replace;
    back(stepOrKey?: number | string, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _back;
    private _taskComplete;
    private executeTask;
    private addTask;
    destroy(): void;
}
/*** @public */
export interface URouter<S extends RouteState = RouteState, T = unknown> {
    nativeData: T;
    location: ULocationTransform;
    routeState: S;
    initialize: Promise<RouteState>;
    addListener(name: 'change', callback: (data: {
        routeState: RouteState;
        root: boolean;
    }) => void | Promise<void>): UNListener;
    getCurrentPages(): {
        pagename: string;
        store: UStore;
        pageData?: any;
    }[];
    findRecordByKey(key: string): {
        record: UHistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: UHistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
    extendCurrent(params: DeepPartial<S['params']>, pagename?: S['pagename']): StateLocation<S['params'], S['pagename']>;
    relaunch(dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    push(dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    replace(dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    back(stepOrKey?: number | string, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }, nonblocking?: boolean): void | Promise<void>;
    getHistoryLength(root?: boolean): number;
}
export declare function toURouter(router: BaseEluxRouter): URouter;
//# sourceMappingURL=index.d.ts.map