import { UNListener } from './utils';
import { ANativeRouter, ARouter, AStore, IPageStack, IRecord, IRouteRecord, IWindowStack, Location, RouteAction, RouteEvent, RouteRecord, RouteTarget, StoreState } from './basic';
import { Store } from './store';
export declare class HistoryStack<T extends IRecord> {
    protected limit: number;
    protected currentRecord: T;
    protected records: T[];
    constructor(limit?: number);
    protected init(record: T): void;
    protected onChanged(): void;
    getCurrentItem(): T;
    getEarliestItem(): T;
    getItemAt(n: number): T | undefined;
    getItems(): T[];
    getLength(): number;
    push(item: T): void;
    replace(item: T): void;
    relaunch(item: T): void;
    back(delta: number): void;
}
export declare class PageStack extends HistoryStack<RouteRecord> implements IRecord, IPageStack {
    readonly windowStack: IWindowStack;
    num: number;
    readonly key: string;
    constructor(windowStack: IWindowStack, location: Location, store: AStore);
    findRecordByKey(key: string): [RouteRecord, number] | undefined;
    active(): void;
    inactive(): void;
    destroy(): void;
}
export declare class WindowStack extends HistoryStack<PageStack> implements IWindowStack {
    num: number;
    constructor(location: Location, store: AStore);
    getRecords(): RouteRecord[];
    protected countBack(delta: number): [number, number];
    backTest(stepOrKey: number | string, rootOnly: boolean): {
        record: RouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByKey(key: string): {
        record: RouteRecord;
        overflow: boolean;
        index: [number, number];
    };
}
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
export declare function urlToLocation(url: string, state?: any): Location;
/**
 * Location转换为Url
 *
 * @public
 */
export declare function locationToUrl({ url, pathname, search, hash, classname, searchQuery, hashQuery }: Partial<Location>, defClassname?: string): string;
export declare abstract class BaseNativeRouter implements ANativeRouter {
    router: Router;
    routeKey: string;
    protected curTask?: {
        resolve: () => void;
        timeout: number;
    };
    abstract getInitData(): Promise<{
        url: string;
        state: StoreState;
        context: any;
    }>;
    abstract exit(): void;
    abstract setPageTitle(title: string): void;
    protected abstract push(nativeLocation: Location, key: string): boolean;
    protected abstract replace(nativeLocation: Location, key: string): boolean;
    protected abstract relaunch(nativeLocation: Location, key: string): boolean;
    protected abstract back(nativeLocation: Location, key: string, index: [number, number]): boolean;
    protected onSuccess(): void;
    testExecute(method: RouteAction, location: Location, backIndex?: number[]): string | void;
    execute(method: RouteAction, location: Location, key: string, backIndex?: number[]): void | Promise<void>;
}
export declare class Router extends ARouter {
    protected WindowStackClass: typeof WindowStack;
    protected PageStackClass: typeof PageStack;
    protected StoreClass: typeof Store;
    protected listenerId: number;
    protected readonly listenerMap: {
        [id: string]: (data: RouteEvent) => void | Promise<void>;
    };
    protected dispatch(data: RouteEvent): void | Promise<void>;
    protected nativeUrlToUrl(nativeUrl: string): string;
    protected urlToLocation(url: string, state: any): Location;
    protected locationToUrl(location: Partial<Location>, defClassname?: string): string;
    protected needToNotifyNativeRouter(action: RouteAction, target: RouteTarget): boolean;
    addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
    relaunch(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean, _nativeCaller?: boolean): Promise<void>;
    protected _relaunch(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, nativeCaller: boolean): Promise<void>;
    replace(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean, _nativeCaller?: boolean): Promise<void>;
    protected _replace(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, nativeCaller: boolean): Promise<void>;
    push(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean, _nativeCaller?: boolean): Promise<void>;
    protected _push(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, nativeCaller: boolean): Promise<void>;
    back(stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean), target?: RouteTarget, overflowRedirect?: string, _nativeCaller?: boolean): Promise<void>;
    protected _back(stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean), target: RouteTarget, overflowRedirect: string, nativeCaller: boolean): Promise<void>;
    protected backError(stepOrKey: number | string, redirect: string): void | Promise<void>;
}
export declare const routerConfig: {
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
    NeedToNotifyNativeRouter(action: RouteAction, target: RouteTarget): boolean;
};
//# sourceMappingURL=router.d.ts.map