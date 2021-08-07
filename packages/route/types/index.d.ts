import { IStore, ICoreRouter, MultipleDispatcher, IModuleHandlers } from '@elux/core';
import { PartialLocation, NativeLocation, RootParams, Location, RouteState, PayloadLocation } from './basic';
import { History } from './history';
import { LocationTransform } from './transform';
export { setRouteConfig, routeConfig, routeMeta } from './basic';
export { createLocationTransform, nativeUrlToNativeLocation, nativeLocationToNativeUrl } from './transform';
export { routeMiddleware, createRouteModule, RouteActionTypes } from './module';
export type { RouteModule } from './module';
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
    test: {
        routeState: RouteState<P>;
        root: boolean;
    };
    change: {
        routeState: RouteState<P>;
        root: boolean;
    };
}> implements IBaseRouter<P, N> {
    nativeRouter: BaseNativeRouter;
    protected locationTransform: LocationTransform;
    private _tid;
    private curTask?;
    private taskList;
    private _nativeData;
    private routeState;
    private internalUrl;
    protected history: History;
    initRouteState: RouteState<P> | Promise<RouteState<P>>;
    readonly injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    constructor(url: string, nativeRouter: BaseNativeRouter, locationTransform: LocationTransform);
    getRouteState(): RouteState<P>;
    getPagename(): string;
    getParams(): Partial<P>;
    getInternalUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    init(store: IStore): void;
    getCurrentStore(): IStore;
    getCurKey(): string;
    getHistory(root?: boolean): History;
    getHistoryLength(root?: boolean): number;
    locationToNativeData(location: PartialLocation): {
        nativeUrl: string;
        nativeLocation: NativeLocation;
    };
    urlToLocation(url: string): Location<P> | Promise<Location<P>>;
    payloadLocationToEluxUrl(data: PayloadLocation<P, N>): string;
    payloadLocationToNativeUrl(data: PayloadLocation<P, N>): string;
    nativeLocationToNativeUrl(nativeLocation: NativeLocation): string;
    private _createKey;
    private payloadToEluxLocation;
    private preAdditions;
    relaunch(data: PayloadLocation<P, N> | string, root?: boolean, nativeCaller?: boolean): void;
    private _relaunch;
    push(data: PayloadLocation<P, N> | string, root?: boolean, nativeCaller?: boolean): void;
    private _push;
    replace(data: PayloadLocation<P, N> | string, root?: boolean, nativeCaller?: boolean): void;
    private _replace;
    back(n?: number, root?: boolean, options?: {
        overflowRedirect?: boolean | string;
        payload?: any;
    }, nativeCaller?: boolean): void;
    private _back;
    private taskComplete;
    private executeTask;
    private addTask;
    destroy(): void;
}
export interface IBaseRouter<P extends RootParams, N extends string> extends ICoreRouter {
    initRouteState: RouteState<P> | Promise<RouteState<P>>;
    getHistory(root?: boolean): History;
    nativeRouter: any;
    addListener(name: 'test' | 'change', callback: (data: {
        routeState: RouteState<P>;
        root: boolean;
    }) => void): void;
    getRouteState(): RouteState<P>;
    getPagename(): string;
    getParams(): Partial<P>;
    getInternalUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    nativeLocationToNativeUrl(nativeLocation: NativeLocation): string;
    locationToNativeData(location: PartialLocation): {
        nativeUrl: string;
        nativeLocation: NativeLocation;
    };
    getCurrentStore(): IStore;
    getCurKey(): string;
    relaunch(data: PayloadLocation<P, N> | string, root?: boolean): void;
    push(data: PayloadLocation<P, N> | string, root?: boolean): void;
    replace(data: PayloadLocation<P, N> | string, root?: boolean): void;
    back(n?: number, root?: boolean, options?: {
        overflowRedirect?: boolean | string;
        payload?: any;
    }): void;
    destroy(): void;
    urlToLocation(url: string): Location<P> | Promise<Location<P>>;
    payloadLocationToEluxUrl(data: PayloadLocation<P, N>): string;
    payloadLocationToNativeUrl(data: PayloadLocation<P, N>): string;
    getHistoryLength(root?: boolean): number;
}
