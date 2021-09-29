import { IStore, ICoreRouter, IModuleHandlers, MultipleDispatcher, Action } from '@elux/core';
import { RootParams, DeepPartial, EluxLocation, NativeLocation, StateLocation, RouteState } from './basic';
import { RootStack, HistoryRecord } from './history';
import { ILocationTransform } from './transform';
export { setRouteConfig, routeConfig, routeMeta, safeJsonParse } from './basic';
export { location, createRouteModule } from './transform';
export type { ILocationTransform } from './transform';
export type { RootParams, EluxLocation, NativeLocation, StateLocation, LocationState, RouteState, HistoryAction, PagenameMap, DeepPartial, NativeLocationMap, } from './basic';
export declare abstract class BaseNativeRouter {
    protected curTask?: () => void;
    protected eluxRouter: IEluxRouter;
    protected abstract push(location: ILocationTransform, key: string): void | true | Promise<true>;
    protected abstract replace(location: ILocationTransform, key: string): void | true | Promise<true>;
    protected abstract relaunch(location: ILocationTransform, key: string): void | true | Promise<true>;
    protected abstract back(location: ILocationTransform, n: number, key: string): void | true | Promise<true>;
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
    findRecordByKey(key: string): HistoryRecord | undefined;
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: HistoryRecord;
        overflow: boolean;
        steps: [number, number];
    };
    extendCurrent(params: DeepPartial<P>, pagename?: N): StateLocation<P, N>;
    relaunch(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _relaunch;
    push(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _push;
    replace(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _replace;
    back(n?: number, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _back;
    private _taskComplete;
    private executeTask;
    private addTask;
    destroy(): void;
}
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
    findRecordByKey(key: string): HistoryRecord | undefined;
    extendCurrent(params: DeepPartial<P>, pagename?: N): StateLocation<P, N>;
    relaunch(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    push(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    replace(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    back(n?: number, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }, nonblocking?: boolean): void | Promise<void>;
    getHistoryLength(root?: boolean): number;
    destroy(): void;
}
export declare const RouteActionTypes: {
    TestRouteChange: string;
    BeforeRouteChange: string;
};
export declare function beforeRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
export declare function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
