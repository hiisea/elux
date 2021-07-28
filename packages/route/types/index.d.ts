import { PartialLocation, NativeLocation, RootParams, Location, RouteState, PayloadLocation } from './basic';
import { History } from './history';
import { LocationTransform } from './transform';
export { setRouteConfig, routeConfig, routeMeta } from './basic';
export { createLocationTransform, nativeUrlToNativeLocation, nativeLocationToNativeUrl } from './transform';
export { routeMiddleware, createRouteModule, RouteActionTypes, ModuleWithRouteHandlers } from './module';
export type { RouteModule } from './module';
export type { PagenameMap, LocationTransform } from './transform';
export type { RootParams, Location, RouteState, HistoryAction, DeepPartial, PayloadLocation, NativeLocation } from './basic';
interface Store {
    dispatch(action: {
        type: string;
    }): any;
}
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
export declare abstract class BaseRouter<P extends RootParams, N extends string> implements IBaseRouter<P, N> {
    nativeRouter: BaseNativeRouter;
    protected locationTransform: LocationTransform;
    private _tid;
    private curTask?;
    private taskList;
    private _nativeData;
    private routeState;
    private internalUrl;
    protected store: Store;
    history: History;
    private _lid;
    protected readonly listenerMap: {
        [id: string]: (data: RouteState<P>) => void | Promise<void>;
    };
    initRouteState: RouteState<P> | Promise<RouteState<P>>;
    constructor(url: string, nativeRouter: BaseNativeRouter, locationTransform: LocationTransform);
    addListener(callback: (data: RouteState<P>) => void | Promise<void>): () => void;
    protected dispatch(data: RouteState<P>): Promise<void[]>;
    getRouteState(): RouteState<P>;
    getPagename(): string;
    getParams(): Partial<P>;
    getInternalUrl(): string;
    getNativeLocation(): NativeLocation;
    getNativeUrl(): string;
    setStore(_store: Store): void;
    getCurKey(): string;
    findHistoryIndexByKey(key: string): number;
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
    back(n?: number, root?: boolean, overflowRedirect?: boolean, nativeCaller?: boolean): void;
    private _back;
    private taskComplete;
    private executeTask;
    private addTask;
    destroy(): void;
}
export interface IBaseRouter<P extends RootParams, N extends string> {
    initRouteState: RouteState<P> | Promise<RouteState<P>>;
    history: History;
    nativeRouter: any;
    addListener(callback: (data: RouteState<P>) => void | Promise<void>): void;
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
    setStore(_store: Store): void;
    getCurKey(): string;
    findHistoryIndexByKey(key: string): number;
    relaunch(data: PayloadLocation<P, N> | string, root?: boolean): void;
    push(data: PayloadLocation<P, N> | string, root?: boolean): void;
    replace(data: PayloadLocation<P, N> | string, root?: boolean): void;
    back(n?: number, root?: boolean, overflowRedirect?: boolean): void;
    destroy(): void;
    urlToLocation(url: string): Location<P> | Promise<Location<P>>;
    payloadLocationToEluxUrl(data: PayloadLocation<P, N>): string;
    payloadLocationToNativeUrl(data: PayloadLocation<P, N>): string;
}
