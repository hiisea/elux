import { IStore, ICoreRouter, IModuleHandlers, CommonModule, MultipleDispatcher, Action } from '@elux/core';
import { NativeLocation, RootParams, RouteState, PayloadData } from './basic';
import { RootStack, HistoryRecord } from './history';
import { LocationTransform, NativeLocationMap, PagenameMap } from './transform';
export { setRouteConfig, routeConfig, routeMeta } from './basic';
export { createLocationTransform, nativeUrlToNativeLocation, nativeLocationToNativeUrl } from './transform';
export type { PagenameMap, LocationTransform } from './transform';
export type { RootParams, LocationState, RouteState, HistoryAction, DeepPartial, PayloadData, NativeLocation } from './basic';
export declare type NativeData = {
    nativeLocation: NativeLocation;
    nativeUrl: string;
};
interface NativeRouterTask {
    resolve: (nativeData: NativeData | undefined) => void;
    reject: () => void;
    nativeData: undefined | NativeData;
}
export declare abstract class BaseNativeRouter {
    protected curTask?: NativeRouterTask;
    protected eluxRouter: IEluxRouter;
    protected abstract push(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;
    protected abstract replace(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;
    protected abstract relaunch(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;
    protected abstract back(getNativeData: () => NativeData, n: number, key: string): void | NativeData | Promise<NativeData>;
    abstract destroy(): void;
    protected onChange(key: string): boolean;
    startup(router: IEluxRouter): void;
    execute(method: 'relaunch' | 'push' | 'replace' | 'back', getNativeData: () => NativeData, ...args: any[]): Promise<NativeData | undefined>;
}
export declare abstract class BaseEluxRouter<P extends RootParams = {}, N extends string = string, NT = unknown> extends MultipleDispatcher<{
    change: {
        routeState: RouteState<P>;
        root: boolean;
    };
}> implements IEluxRouter<P, N, NT> {
    protected nativeRouter: BaseNativeRouter;
    locationTransform: LocationTransform;
    nativeData: NT;
    private _curTask?;
    private _taskList;
    private _nativeData;
    private _internalUrl;
    routeState: RouteState<P>;
    readonly name: string;
    initialize: Promise<RouteState<P>>;
    readonly injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    readonly rootStack: RootStack;
    latestState: Record<string, any>;
    constructor(nativeUrl: string, nativeRouter: BaseNativeRouter, locationTransform: LocationTransform, nativeData: NT);
    startup(store: IStore): void;
    getCurrentPages(): {
        pagename: string;
        store: IStore;
        page?: any;
    }[];
    getCurrentStore(): IStore;
    getStoreList(): IStore[];
    getInternalUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    getHistoryLength(root?: boolean): number;
    findRecordByKey(key: string): HistoryRecord | undefined;
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: HistoryRecord;
        overflow: boolean;
        steps: [number, number];
    };
    private partialLocationStateToNativeData;
    private preAdditions;
    relaunch(eluxUrlOrPayload: PayloadData<P, N> | string, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _relaunch;
    push(eluxUrlOrPayload: PayloadData<P, N> | string, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _push;
    replace(eluxUrlOrPayload: PayloadData<P, N> | string, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
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
    addListener(name: 'change', callback: (data: {
        routeState: RouteState<P>;
        root: boolean;
    }) => void | Promise<void>): () => void;
    getInternalUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    getCurrentPages(): {
        pagename: string;
        store: IStore;
        page?: any;
    }[];
    findRecordByKey(key: string): HistoryRecord | undefined;
    relaunch(eluxUrlOrPayload: PayloadData<P, N> | string, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    push(eluxUrlOrPayload: PayloadData<P, N> | string, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    replace(eluxUrlOrPayload: PayloadData<P, N> | string, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    back(n?: number, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }, nonblocking?: boolean): void | Promise<void>;
    getHistoryLength(root?: boolean): number;
    destroy(): void;
    locationTransform: LocationTransform;
}
export declare const RouteActionTypes: {
    TestRouteChange: string;
    BeforeRouteChange: string;
};
export declare function beforeRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
export declare function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action;
export declare type RouteModule = CommonModule & {
    locationTransform: LocationTransform;
};
export declare function createRouteModule<N extends string, G extends PagenameMap>(moduleName: N, pagenameMap: G, nativeLocationMap?: NativeLocationMap, notfoundPagename?: string, paramsKey?: string): {
    locationTransform: LocationTransform;
    moduleName: N;
    model: (store: IStore<any>) => void | Promise<void>;
    state: RouteState<any>;
    params: {};
    actions: {
        destroy: () => {
            type: string;
        };
    };
    components: { [k in keyof G]: any; };
};
