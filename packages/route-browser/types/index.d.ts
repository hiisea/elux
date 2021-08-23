import { BaseRouter, BaseNativeRouter, NativeData, RootParams, LocationTransform } from '@elux/route';
import { History } from 'history';
export declare class BrowserNativeRouter extends BaseNativeRouter {
    private _unlistenHistory;
    history: History<never>;
    constructor(createHistory: 'Browser' | 'Hash' | 'Memory' | string);
    getUrl(): string;
    private getKey;
    protected passive(url: string, key: string, action: string): boolean;
    refresh(): void;
    protected push(getNativeData: () => NativeData, key: string): NativeData | undefined;
    protected replace(getNativeData: () => NativeData, key: string): NativeData | undefined;
    protected relaunch(getNativeData: () => NativeData, key: string): NativeData | undefined;
    protected back(getNativeData: () => NativeData, n: number, key: string): NativeData | undefined;
    toOutside(url: string): void;
    destroy(): void;
}
export declare class Router<P extends RootParams, N extends string, Req = unknown, Res = unknown> extends BaseRouter<P, N, Req, Res> {
    nativeRouter: BrowserNativeRouter;
    constructor(browserNativeRouter: BrowserNativeRouter, locationTransform: LocationTransform);
}
export declare function createRouter<P extends RootParams, N extends string>(createHistory: 'Browser' | 'Hash' | 'Memory' | string, locationTransform: LocationTransform): Router<P, N>;
