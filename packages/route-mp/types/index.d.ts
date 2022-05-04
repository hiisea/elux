import { IRouter, Location } from '@elux/core';
import { BaseNativeRouter } from '@elux/route';
interface RouteOption {
    url: string;
}
interface NavigateBackOption {
    delta?: number;
}
export declare type MPLocation = {
    pathname: string;
    search: string;
    action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
};
export interface IHistory {
    onRouteChange(callback: (data: MPLocation) => void): () => void;
    reLaunch(option: RouteOption): Promise<void>;
    redirectTo(option: RouteOption): Promise<void>;
    navigateTo(option: RouteOption): Promise<void>;
    navigateBack(option: NavigateBackOption): Promise<void>;
    switchTab(option: RouteOption): Promise<void>;
    getLocation(): MPLocation;
    isTabPage(pathname: string): boolean;
}
export declare class MPNativeRouter extends BaseNativeRouter {
    private history;
    private unlistenHistory;
    constructor(history: IHistory);
    protected addKey(url: string, key: string): string;
    protected init(location: Location, key: string): boolean;
    protected _push(location: Location): void;
    protected push(location: Location, key: string): boolean;
    protected _replace(location: Location): void;
    protected replace(location: Location, key: string): boolean;
    protected relaunch(location: Location, key: string): boolean;
    protected back(location: Location, key: string, index: [number, number]): boolean;
    destroy(): void;
}
export declare function createRouter(history: IHistory): IRouter;
export {};
//# sourceMappingURL=index.d.ts.map