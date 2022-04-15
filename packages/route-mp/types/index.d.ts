import { Location, IRouter, NativeRequest } from '@elux/core';
import { BaseNativeRouter } from '@elux/route';
interface RouteOption {
    url: string;
}
interface NavigateBackOption {
    delta?: number;
}
export interface IHistory {
    onRouteChange(callback: (pathname: string, search: string, action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH') => void): () => void;
    reLaunch(option: RouteOption): Promise<void>;
    redirectTo(option: RouteOption): Promise<void>;
    navigateTo(option: RouteOption): Promise<void>;
    navigateBack(option: NavigateBackOption): Promise<void>;
    switchTab(option: RouteOption): Promise<void>;
    getLocation(): {
        pathname: string;
        search: string;
    };
    isTabPage(pathname: string): boolean;
}
export declare class MPNativeRouter extends BaseNativeRouter {
    private history;
    private unlistenHistory;
    constructor(history: IHistory, nativeRequest: NativeRequest);
    protected addKey(url: string, key: string): string;
    protected _push(location: Location): void;
    protected push(location: Location, key: string): Promise<void>;
    protected _replace(location: Location): void;
    protected replace(location: Location, key: string): Promise<void>;
    protected relaunch(location: Location, key: string): Promise<void>;
    protected back(location: Location, key: string, index: [number, number]): Promise<void>;
    destroy(): void;
}
export declare function createRouter(history: IHistory): IRouter;
export {};
//# sourceMappingURL=index.d.ts.map