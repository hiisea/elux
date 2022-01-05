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
    push(url: string): void;
    replace(url: string): void;
    block(callback: (locationData: LocationData, action: Action) => string | false | void): UnregisterCallback;
    location: {
        pathname: string;
        search: string;
    };
}
export declare function createServerHistory(url: string): IHistory;
export declare function createBrowserHistory(): IHistory;
export declare class BrowserNativeRouter extends BaseNativeRouter {
    _history: IHistory;
    private _unlistenHistory;
    constructor(_history: IHistory);
    protected push(location: ILocationTransform, key: string): void | true | Promise<void>;
    protected replace(location: ILocationTransform, key: string): void | true | Promise<void>;
    protected relaunch(location: ILocationTransform, key: string): void | true | Promise<void>;
    protected back(location: ILocationTransform, index: [number, number], key: string): void | true | Promise<void>;
    destroy(): void;
}
export declare class EluxRouter<P extends RootParams, N extends string, NT = unknown> extends BaseEluxRouter<P, N, NT> {
    nativeRouter: BrowserNativeRouter;
    constructor(nativeUrl: string, browserNativeRouter: BrowserNativeRouter, nativeData: NT);
}
export declare function createRouter<P extends RootParams, N extends string, NT = unknown>(browserHistory: IHistory, nativeData: NT): EluxRouter<P, N, NT>;
export {};
//# sourceMappingURL=index.d.ts.map