import { UStore, EStore, CoreRouter, RootState, RouteState, UNListener, DeepPartial, MultipleDispatcher } from '@elux/core';
import { EluxLocation, NativeLocation, StateLocation } from './basic';
import { WindowStack, URouteRecord } from './history';
import { ULocationTransform } from './transform';
export { setRouteConfig, routeConfig, routeJsonParse } from './basic';
export { location, createRouteModule, urlParser } from './transform';
export type { URouteRecord } from './history';
export type { ULocationTransform } from './transform';
export type { EluxLocation, NativeLocation, StateLocation, PagenameMap, NativeLocationMap } from './basic';
export declare abstract class BaseNativeRouter {
    protected curTask?: () => void;
    protected eluxRouter: URouter;
    protected abstract push(location: ULocationTransform, key: string): void | true | Promise<void>;
    protected abstract replace(location: ULocationTransform, key: string): void | true | Promise<void>;
    protected abstract relaunch(location: ULocationTransform, key: string): void | true | Promise<void>;
    protected abstract back(location: ULocationTransform, index: [number, number], key: string): void | true | Promise<void>;
    abstract destroy(): void;
    protected onChange(key: string): boolean;
    startup(router: URouter): void;
    execute(method: 'relaunch' | 'push' | 'replace' | 'back', location: ULocationTransform, ...args: any[]): Promise<void>;
}
export declare class BaseEluxRouter extends MultipleDispatcher<{
    change: {
        routeState: RouteState;
        root: boolean;
    };
}> implements CoreRouter, URouter {
    protected nativeRouter: BaseNativeRouter;
    nativeData: unknown;
    private _curTask?;
    private _taskList;
    location: ULocationTransform;
    routeState: RouteState;
    readonly name: string;
    initialize: Promise<RouteState>;
    readonly windowStack: WindowStack;
    latestState: Record<string, any>;
    constructor(nativeUrl: string, nativeRouter: BaseNativeRouter, nativeData: unknown);
    startup(store: EStore): void;
    getCurrentPages(): {
        pagename: string;
        store: UStore;
        pageComponent?: any;
    }[];
    getCurrentStore(): EStore;
    getStoreList(): EStore[];
    getHistoryLength(root?: boolean): number;
    findRecordByKey(recordKey: string): {
        record: URouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: URouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    extendCurrent(params: DeepPartial<RootState>, pagename?: string): StateLocation;
    relaunch(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _relaunch;
    push(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _push;
    replace(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation, root?: boolean, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _replace;
    back(stepOrKey?: number | string, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }, nonblocking?: boolean, nativeCaller?: boolean): void | Promise<void>;
    private _back;
    private _taskComplete;
    private executeTask;
    private addTask;
    destroy(): void;
}
/**
 * 路由实例
 *
 * @remarks
 * 可以通过 {@link getApi | GetRouter() 或 useRouter()} 获得，在 model 中也可通过 {@link BaseModel.router} 获得
 *
 * 在CSR（`客户端渲染`）中，只存在一个唯一的 Router 实例，在SSR（`服务端渲染`）中，每个 request 请求都会生成一个 Router 实例
 *
 * @public
 */
export interface URouter<S extends RouteState = RouteState, T = unknown> {
    /**
     * 用于SSR中，注入请求的原始数据
     *
     * @example
     * 如：createSSR(moduleGetter, request.url, `{request, response}`).render();
     */
    nativeData: T;
    /**
     * 当前的 {@link ULocationTransform | location}
     */
    location: ULocationTransform;
    /**
     * 当前的 {@link RouteState}
     */
    routeState: S;
    /**
     * 初始的 {@link RouteState}
     */
    initialize: Promise<RouteState>;
    /**
     * 单独监听路由的 `change` 事件，通常无需这么做，推荐直接在 model 中利用 {@link effect} 监听
     */
    addListener(name: 'change', callback: (data: {
        routeState: RouteState;
        root: boolean;
    }) => void | Promise<void>): UNListener;
    /**
     * 获取所有`EWindow窗口`中的当前页面，多页模式下可以存在多个`EWindow`
     */
    getCurrentPages(): {
        pagename: string;
        store: UStore;
        pageComponent?: any;
    }[];
    /**
     * 用`唯一key`来查找某条路由历史记录，如果没找到则返回 `{overflow: true}`
     */
    findRecordByKey(key: string): {
        record: URouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    /**
     * 用`回退步数`来查找某条路由历史记录，如果步数溢出则返回 `{overflow: true}`
     */
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: URouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    /**
     * 基于当前路由的状态来创建一个新的 {@link StateLocation}
     */
    extendCurrent(params: DeepPartial<S['params']>, pagename?: S['pagename']): StateLocation<S['params'], S['pagename']>;
    /**
     * 跳转一条路由，并清空所有历史记录，对应 {@link RouteHistoryAction.RELAUNCH}
     *
     * @param dataOrUrl - 3种路由描述或3种路由协议的url，参见 {@link location}
     * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈；`false`表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
     * @param nonblocking - `ture`表示如果一条路由切换过程中（未执行完成）又触发另一条新的路由切换，新的路由切换将随后继续执行；`false`表示忽略新的路由切换，默认为`false`
     */
    relaunch(dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    /**
     * 新增一条路由，对应 {@link RouteHistoryAction.PUSH}
     *
     * @param dataOrUrl - 3种路由描述或3种路由协议的url，参见 {@link location}
     * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈；`false`表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
     * @param nonblocking - `ture`表示如果一条路由切换过程中（未执行完成）又触发另一条新的路由切换，新的路由切换将随后继续执行；`false`表示忽略新的路由切换，默认为`false`
     */
    push(dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    /**
     * 替换当前路由，对应 {@link RouteHistoryAction.REPLACE}
     *
     * @param dataOrUrl - 3种路由描述或3种路由协议的url，参见 {@link location}
     * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈；`false`表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
     * @param nonblocking - `ture`表示如果一条路由切换过程中（未执行完成）又触发另一条新的路由切换，新的路由切换将随后继续执行；`false`表示忽略新的路由切换，默认为`false`
     */
    replace(dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
    /**
     * 回退历史记录，对应 {@link RouteHistoryAction.BACK}
     *
     * @param stepOrKey - 需要回退的步数或者历史记录的唯一id
     * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈；`false`表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
     * @param options - `-overflowRedirect`：如果回退步数溢出，将跳往该 `url `或 {@link UserConfig.indexUrl | 首页}； `-payload`：此参数将合并到回退后的路由参数中
     * @param nonblocking - `ture`表示如果一条路由切换过程中（未执行完成）又触发另一条新的路由切换，新的路由切换将随后继续执行；`false`表示忽略新的路由切换，默认为`false`
     */
    back(stepOrKey?: number | string, root?: boolean, options?: {
        overflowRedirect?: string;
        payload?: any;
    }, nonblocking?: boolean): void | Promise<void>;
    /**
     * 获取历史记录数
     *
     * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈，否则表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
     */
    getHistoryLength(root?: boolean): number;
}
export declare function toURouter(router: BaseEluxRouter): URouter;
//# sourceMappingURL=index.d.ts.map