import { BaseRouter, BaseNativeRouter, NativeLocation, NativeData, RootParams, LocationTransform, IBaseRouter } from '@elux/route';
interface RouteOption {
    url: string;
}
interface NavigateBackOption {
    delta?: number;
}
export interface RouteENV {
    onRouteChange(callback: (pathname: string, search: string, action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH') => void): () => void;
    getLocation(): {
        pathname: string;
        search: string;
    };
    reLaunch(option: RouteOption): Promise<any>;
    redirectTo(option: RouteOption): Promise<any>;
    navigateTo(option: RouteOption): Promise<any>;
    navigateBack(option: NavigateBackOption): Promise<any>;
    switchTab(option: RouteOption): Promise<any>;
}
export declare class MPNativeRouter extends BaseNativeRouter {
    routeENV: RouteENV;
    protected tabPages: Record<string, boolean>;
    private _unlistenHistory;
    protected router: Router<any, string>;
    constructor(routeENV: RouteENV, tabPages: Record<string, boolean>);
    getLocation(): NativeLocation;
    protected toUrl(url: string, key: string): string;
    protected push(getNativeData: () => NativeData, key: string): Promise<NativeData>;
    protected replace(getNativeData: () => NativeData, key: string): Promise<NativeData>;
    protected relaunch(getNativeData: () => NativeData, key: string): Promise<NativeData>;
    protected back(getNativeData: () => NativeData, n: number, key: string): Promise<NativeData>;
    toOutside(url: string): void;
    destroy(): void;
}
export declare class Router<P extends RootParams, N extends string> extends BaseRouter<P, N> implements IRouter<P, N> {
    nativeRouter: MPNativeRouter;
    constructor(mpNativeRouter: MPNativeRouter, locationTransform: LocationTransform);
}
export declare function createRouter<P extends RootParams, N extends string>(locationTransform: LocationTransform, routeENV: RouteENV, tabPages: Record<string, boolean>): Router<P, N>;
export interface IRouter<P extends RootParams, N extends string> extends IBaseRouter<P, N> {
    nativeRouter: MPNativeRouter;
}
export {};
