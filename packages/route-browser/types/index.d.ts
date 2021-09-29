import { BaseEluxRouter, BaseNativeRouter, RootParams, ILocationTransform } from '@elux/route';
declare type UnregisterCallback = () => void;
export declare type Action = 'PUSH' | 'POP' | 'REPLACE';
export declare type LocationData = {
    pathname: string;
    search: string;
    hash: string;
    state?: string;
};
export interface IHistory {
    push(url: string, key: string): void;
    replace(url: string, key: string): void;
    go(n: number): void;
    block(callback: (locationData: LocationData, action: Action) => string | false | void): UnregisterCallback;
}
export declare class BrowserNativeRouter extends BaseNativeRouter {
    private _unlistenHistory;
    private _history;
    constructor();
    private getKey;
    protected push(location: ILocationTransform, key: string): void | true | Promise<true>;
    protected replace(location: ILocationTransform, key: string): void | true | Promise<true>;
    protected relaunch(location: ILocationTransform, key: string): void | true | Promise<true>;
    protected back(location: ILocationTransform, n: number, key: string): void | true | Promise<true>;
    destroy(): void;
}
export declare class EluxRouter<P extends RootParams, N extends string, NT = unknown> extends BaseEluxRouter<P, N, NT> {
    nativeRouter: BrowserNativeRouter;
    constructor(nativeUrl: string, browserNativeRouter: BrowserNativeRouter, nativeData: NT);
}
export declare function createRouter<P extends RootParams, N extends string, NT = unknown>(nativeUrl: string, nativeData: NT): EluxRouter<P, N, NT>;
export {};
