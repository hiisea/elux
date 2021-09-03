import { BaseEluxRouter, BaseNativeRouter, NativeData, RootParams, LocationTransform } from '@elux/route';
declare type UnregisterCallback = () => void;
declare type Action = 'PUSH' | 'POP' | 'REPLACE';
declare type Location = {
    pathname: string;
    search: string;
    hash: string;
    state?: string;
};
export interface IHistory {
    push(url: string, key: string): void;
    replace(url: string, key: string): void;
    go(n: number): void;
    block(callback: (location: Location, action: Action) => string | false | void): UnregisterCallback;
}
export declare class BrowserNativeRouter extends BaseNativeRouter {
    private _unlistenHistory;
    private _history;
    constructor(url: string);
    private getKey;
    protected push(getNativeData: () => NativeData, key: string): NativeData | undefined;
    protected replace(getNativeData: () => NativeData, key: string): NativeData | undefined;
    protected relaunch(getNativeData: () => NativeData, key: string): NativeData | undefined;
    protected back(getNativeData: () => NativeData, n: number, key: string): NativeData | undefined;
    destroy(): void;
}
export declare class EluxRouter<P extends RootParams, N extends string, NT = unknown> extends BaseEluxRouter<P, N, NT> {
    nativeRouter: BrowserNativeRouter;
    constructor(url: string, browserNativeRouter: BrowserNativeRouter, locationTransform: LocationTransform, nativeData: NT);
}
export declare function createRouter<P extends RootParams, N extends string, NT = unknown>(url: string, locationTransform: LocationTransform, nativeData: NT): EluxRouter<P, N, NT>;
export {};
