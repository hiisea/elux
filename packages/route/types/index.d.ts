import { IStore, ICoreRouter, IModuleHandlers, MultipleDispatcher, Action } from '@elux/core';
import { RootParams, DeepPartial, EluxLocation, NativeLocation, StateLocation, RouteState } from './basic';
import { RootStack, IHistoryRecord } from './history';
import { ILocationTransform } from './transform';
export { setRouteConfig, routeConfig, routeMeta, safeJsonParse } from './basic';
export { location, createRouteModule, urlParser } from './transform';
export type { IHistoryRecord } from './history';
export type { ILocationTransform } from './transform';
export type { RootParams, EluxLocation, NativeLocation, StateLocation, LocationState, RouteState, HistoryAction, PagenameMap, DeepPartial, NativeLocationMap, } from './basic';
export declare abstract class BaseNativeRouter {
    protected curTask?: () => void;
    protected eluxRouter: IEluxRouter;
    protected abstract push(location: ILocationTransform, key: string): void | true | Promise<void>;
    protected abstract replace(location: ILocationTransform, key: string): void | true | Promise<void>;
    protected abstract relaunch(location: ILocationTransform, key: string): void | true | Promise<void>;
    protected abstract back(location: ILocationTransform, index: [number, number], key: string): void | true | Promise<void>;
    abstract destroy(): void;
    protected onChange(key: string): boolean;
    startup(router: IEluxRouter): void;
    execute(method: 'relaunch' | 'push' | 'replace' | 'back', location: ILocationTransform, ...args: any[]): Promise<void>;
}
export declare abstract class BaseEluxRouter<P extends RootParams = {}, N extends string = string, NT = unknown> extends MultipleDispatcher<{
    change: {
        routeState: RouteState<P>;
        root: boolean;
    };
}> implements IEluxRouter<P, N, NT> {
    protected nativeRouter: BaseNativeRouter;
    nativeData: NT;
    private _curTask?;
    private _taskList;
    location: ILocationTransform;
    routeState: RouteState<P>;
    readonly name: string;
    initialize: Promise<RouteState<P>>;
    readonly injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    readonly rootStack: RootStack;
    latestState: Record<string, any>;
    constructor(nativeUrl: string, nativeRouter: BaseNativeRouter, nativeData: NT);
    startup(store: IStore): void;
    getCurrentPages(): {
        pagename: string;
        store: IStore;
        page?: any;
    }[];
    getCurrentStore(): IStore;
    getStoreList(): IStore[];
    getHistoryLength(root?: boolean): number;
    findRecordByKey(recordKey: string): {
        record: IHistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: IHistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
    extendCurrent(params: DeepPartial<P>, pagename?: N): StateLocation<P, N>;
    relaunch(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _relaunch;
    push(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _push;
    replace(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
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
export interface IEluxRouter<P extends RootParams = {}, N extends string = string, NT = unknown> extends ICoreRouter<RouteState<P>> {
    initialize: Promise<RouteState<P>>;
    nativeData: NT;
    location: ILocationTransform;
    addListener(name: 'change', callback: (data: {
        routeState: RouteState<P>;
        root: boolean;
    }) => void | Promise<void>): () => void;
    getCurrentPages(): {
        pagename: string;
        store: IStore;
        page?: any;
    }[];
    findRecordByKey(key: string): {
        record: IHistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: IHistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
    extendCurrent(params: DeepPartial<P>, pagename?: N): StateLocation<P, N>;
    relaunch(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    push(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    replace(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    back(stepOrKey?: number | string, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }, nonblocking?: boolean): void | Promise<void>;
    getHistoryLength(root?: boolean): number;
    destroy(): void;
}
/*** @internal */
export declare const RouteActionTypes: {
    TestRouteChange: string;
    BeforeRouteChange: string;
};
export declare function beforeRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
export declare function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
//# sourceMappingURL=index.d.ts.map