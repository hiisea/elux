import { ILocationTransform, BaseEluxRouter, BaseNativeRouter, RootParams } from '@elux/route';
interface RouteOption {
    url: string;
}
interface NavigateBackOption {
    delta?: number;
}
export interface IHistory {
    onRouteChange(callback: (pathname: string, search: string, action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH') => void): () => void;
    reLaunch(option: RouteOption): Promise<any>;
    redirectTo(option: RouteOption): Promise<any>;
    navigateTo(option: RouteOption): Promise<any>;
    navigateBack(option: NavigateBackOption): Promise<any>;
    switchTab(option: RouteOption): Promise<any>;
    getLocation(): {
        pathname: string;
        search: string;
    };
}
export declare class MPNativeRouter extends BaseNativeRouter {
    _history: IHistory;
    protected tabPages: Record<string, boolean>;
    private _unlistenHistory?;
    protected router: EluxRouter<any, string>;
    constructor(_history: IHistory, tabPages: Record<string, boolean>);
    protected addKey(url: string, key: string): string;
    protected push(location: ILocationTransform, key: string): void | true | Promise<void>;
    protected replace(location: ILocationTransform, key: string): void | true | Promise<void>;
    protected relaunch(location: ILocationTransform, key: string): void | true | Promise<void>;
    protected back(location: ILocationTransform, index: [number, number], key: string): void | true | Promise<void>;
    destroy(): void;
}
export declare class EluxRouter<P extends RootParams, N extends string> extends BaseEluxRouter<P, N> {
    nativeRouter: MPNativeRouter;
    constructor(nativeUrl: string, mpNativeRouter: MPNativeRouter);
}
export declare function createRouter<P extends RootParams, N extends string>(mpHistory: IHistory, tabPages: Record<string, boolean>): EluxRouter<P, N>;
export {};
//# sourceMappingURL=index.d.ts.map