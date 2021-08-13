import { IStore, ICoreRouter, IModuleHandlers, CommonModule, MultipleDispatcher, Action } from '@elux/core';
import { PartialLocation, NativeLocation, RootParams, Location, RouteState, PayloadLocation } from './basic';
import { RootStack, HistoryRecord } from './history';
import { LocationTransform, NativeLocationMap, PagenameMap } from './transform';
export { setRouteConfig, routeConfig, routeMeta } from './basic';
export { createLocationTransform, nativeUrlToNativeLocation, nativeLocationToNativeUrl } from './transform';
export type { PagenameMap, LocationTransform } from './transform';
export type { RootParams, Location, RouteState, HistoryAction, DeepPartial, PayloadLocation, NativeLocation } from './basic';
export declare type NativeData = {
    nativeLocation: NativeLocation;
    nativeUrl: string;
};
interface RouterTask {
    method: string;
}
interface NativeRouterTask {
    resolve: (nativeData: NativeData | undefined) => void;
    reject: () => void;
    nativeData: undefined | NativeData;
}
export declare abstract class BaseNativeRouter {
    protected curTask?: NativeRouterTask;
    protected taskList: RouterTask[];
    protected router: BaseRouter<any, string>;
    protected abstract push(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;
    protected abstract replace(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;
    protected abstract relaunch(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;
    protected abstract back(getNativeData: () => NativeData, n: number, key: string): void | NativeData | Promise<NativeData>;
    abstract toOutside(url: string): void;
    abstract destroy(): void;
    protected onChange(key: string): boolean;
    setRouter(router: BaseRouter<any, string>): void;
    execute(method: 'relaunch' | 'push' | 'replace' | 'back', getNativeData: () => NativeData, ...args: any[]): Promise<NativeData | undefined>;
}
export declare abstract class BaseRouter<P extends RootParams, N extends string> extends MultipleDispatcher<{
    change: {
        routeState: RouteState<P>;
        root: boolean;
    };
}> implements IBaseRouter<P, N> {
    nativeRouter: BaseNativeRouter;
    protected locationTransform: LocationTransform;
    private curTask?;
    private taskList;
    private _nativeData;
    private internalUrl;
    routeState: RouteState<P>;
    readonly name: string;
    initialize: Promise<RouteState<P>>;
    readonly injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    readonly rootStack: RootStack;
    latestState: Record<string, any>;
    constructor(url: string, nativeRouter: BaseNativeRouter, locationTransform: LocationTransform);
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
    locationToNativeData(location: PartialLocation): {
        nativeUrl: string;
        nativeLocation: NativeLocation;
    };
    urlToLocation(url: string): Location<P> | Promise<Location<P>>;
    payloadLocationToEluxUrl(data: PayloadLocation<P, N>): string;
    payloadLocationToNativeUrl(data: PayloadLocation<P, N>): string;
    nativeLocationToNativeUrl(nativeLocation: NativeLocation): string;
    findRecordByKey(key: string): HistoryRecord | undefined;
    private payloadToEluxLocation;
    private preAdditions;
    relaunch(data: PayloadLocation<P, N> | string, root?: boolean, nativeCaller?: boolean): void;
    private _relaunch;
    push(data: PayloadLocation<P, N> | string, root?: boolean, nativeCaller?: boolean): void;
    private _push;
    replace(data: PayloadLocation<P, N> | string, root?: boolean, nativeCaller?: boolean): void;
    private _replace;
    back(n?: number, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }, nativeCaller?: boolean): void;
    private _back;
    private taskComplete;
    private executeTask;
    private addTask;
    destroy(): void;
}
export interface IBaseRouter<P extends RootParams, N extends string> extends ICoreRouter {
    routeState: RouteState<P>;
    initialize: Promise<RouteState<P>>;
    nativeRouter: any;
    addListener(name: 'change', callback: (data: {
        routeState: RouteState<P>;
        root: boolean;
    }) => void): void;
    getInternalUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    nativeLocationToNativeUrl(nativeLocation: NativeLocation): string;
    locationToNativeData(location: PartialLocation): {
        nativeUrl: string;
        nativeLocation: NativeLocation;
    };
    getCurrentStore(): IStore;
    getCurrentPages(): {
        pagename: string;
        store: IStore;
        page?: any;
    }[];
    findRecordByKey(key: string): HistoryRecord | undefined;
    relaunch(data: PayloadLocation<P, N> | string, root?: boolean): void;
    push(data: PayloadLocation<P, N> | string, root?: boolean): void;
    replace(data: PayloadLocation<P, N> | string, root?: boolean): void;
    back(n?: number, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }): void;
    destroy(): void;
    urlToLocation(url: string): Location<P> | Promise<Location<P>>;
    payloadLocationToEluxUrl(data: PayloadLocation<P, N>): string;
    payloadLocationToNativeUrl(data: PayloadLocation<P, N>): string;
    getHistoryLength(root?: boolean): number;
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
