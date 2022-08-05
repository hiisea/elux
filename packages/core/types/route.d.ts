import { IRouter, IRouteRecord, Location, RouteAction, RouteEvent, RouterInitOptions, RouteRuntime, RouteTarget, StoreState } from './basic';
import { UNListener } from './utils';
import { Store } from './store';
export interface RouteConfig {
    NotifyNativeRouter: {
        window: boolean;
        page: boolean;
    };
    QueryString: {
        parse(str: string): {
            [key: string]: any;
        };
        stringify(query: {
            [key: string]: any;
        }): string;
    };
    NativePathnameMapping: {
        in(nativePathname: string): string;
        out(internalPathname: string): string;
    };
}
/**
 * 原生路由Url转换为内部路由Url
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export declare function nativeUrlToUrl(nativeUrl: string): string;
/**
 * 内部路由Url转换为原生路由Url
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export declare function urlToNativeUrl(eluxUrl: string): string;
/**
 * Url转换为Location
 *
 * @public
 */
export declare function urlToLocation(url: string, state: any): Location;
/**
 * Location转换为Url
 *
 * @public
 */
export declare function locationToUrl({ url, pathname, search, hash, classname, searchQuery, hashQuery }: Partial<Location>, defClassname?: string): string;
/**
 * 内部路由Location转换为原生路由Location
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export declare function locationToNativeLocation(location: Location): Location;
/**
 * 原生路由Location转换为内部路由Location
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export declare function nativeLocationToLocation(location: Location): Location;
export declare abstract class BaseNativeRouter {
    router: Router;
    routeKey: string;
    protected curTask?: {
        resolve: () => void;
        timeout: number;
    };
    constructor();
    protected abstract push(nativeLocation: Location, key: string): boolean;
    protected abstract replace(nativeLocation: Location, key: string): boolean;
    protected abstract relaunch(nativeLocation: Location, key: string): boolean;
    protected abstract back(nativeLocation: Location, key: string, index: [number, number]): boolean;
    protected onSuccess(): void;
    testExecute(method: RouteAction, location: Location, backIndex?: number[]): void;
    abstract exit(): void;
    execute(method: RouteAction, location: Location, key: string, backIndex?: number[]): void | Promise<void>;
}
export declare class Router implements IRouter {
    private nativeRouter;
    private curTask?;
    private taskList;
    private windowStack;
    private documentHead;
    action: RouteAction;
    routeKey: string;
    runtime: RouteRuntime<StoreState>;
    location: Location;
    initOptions: RouterInitOptions;
    protected listenerId: number;
    protected readonly listenerMap: {
        [id: string]: (data: RouteEvent) => void | Promise<void>;
    };
    private onTaskComplete;
    constructor(nativeRouter: BaseNativeRouter);
    addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
    dispatch(data: RouteEvent): void | Promise<void>;
    private addTask;
    getDocumentHead(): string;
    setDocumentHead(html: string): void;
    private savePageTitle;
    nativeInitiated(): boolean;
    getHistoryLength(target: RouteTarget): number;
    getHistory(target: RouteTarget): IRouteRecord[];
    findRecordByKey(recordKey: string): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly?: boolean): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    getActivePage(): {
        location: Location;
        store: Store;
    };
    getCurrentPages(): {
        location: Location;
        store: Store;
    }[];
    private mountStore;
    private redirectOnServer;
    init(routerInitOptions: RouterInitOptions, prevState: StoreState): Promise<void>;
    private _init;
    computeUrl(partialLocation: Partial<Location>, action: RouteAction, target: RouteTarget): string;
    relaunch(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean, _nativeCaller?: boolean): Promise<void>;
    private _relaunch;
    replace(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean, _nativeCaller?: boolean): Promise<void>;
    private _replace;
    push(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean, _nativeCaller?: boolean): Promise<void>;
    private _push;
    back(stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean), target?: RouteTarget, refresh?: boolean, overflowRedirect?: string, _nativeCaller?: boolean): Promise<void>;
    private _back;
    private backError;
}
//# sourceMappingURL=route.d.ts.map