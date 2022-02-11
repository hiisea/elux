import { BaseEluxRouter, BaseNativeRouter, ULocationTransform } from '@elux/route';
import { UNListener } from '@elux/core';
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
    block(callback: (locationData: LocationData, action: Action) => string | false | void): UNListener;
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
    protected push(location: ULocationTransform, key: string): void | true | Promise<void>;
    protected replace(location: ULocationTransform, key: string): void | true | Promise<void>;
    protected relaunch(location: ULocationTransform, key: string): void | true | Promise<void>;
    protected back(location: ULocationTransform, index: [number, number], key: string): void | true | Promise<void>;
    destroy(): void;
}
export declare function createRouter(browserHistory: IHistory, nativeData: unknown): BaseEluxRouter;
//# sourceMappingURL=index.d.ts.map