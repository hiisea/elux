import { EStore } from '@elux/core';
import { ULocationTransform } from './transform';
declare class HistoryStack<T extends {
    destroy?: () => void;
    store?: EStore;
}> {
    protected limit: number;
    records: T[];
    constructor(limit: number);
    startup(record: T): void;
    getCurrentItem(): T;
    getEarliestItem(): T;
    getItemAt(n: number): T | undefined;
    getItems(): T[];
    getLength(): number;
    protected _push(item: T): void;
    protected _replace(item: T): void;
    protected _relaunch(item: T): void;
    back(delta: number): void;
    protected setActive(oItem: T | undefined): void;
}
/**
 * 路由历史记录
 *
 * @remarks
 * 可以通过 {@link URouter.findRecordByKey}、{@link URouter.findRecordByStep} 获得
 *
 * @public
 */
export interface URouteRecord {
    /**
     * 每条路由记录都有一个唯一的key
     */
    key: string;
    /**
     * 路由转换器，参见 {@link ULocationTransform}
     */
    location: ULocationTransform;
}
export declare class RouteRecord implements URouteRecord {
    readonly location: ULocationTransform;
    readonly pageStack: PageStack;
    static id: number;
    readonly destroy: undefined;
    readonly key: string;
    readonly recordKey: string;
    constructor(location: ULocationTransform, pageStack: PageStack);
}
export declare class PageStack extends HistoryStack<RouteRecord> {
    readonly windowStack: WindowStack;
    readonly store: EStore;
    static id: number;
    readonly stackkey: string;
    constructor(windowStack: WindowStack, store: EStore);
    push(location: ULocationTransform): RouteRecord;
    replace(location: ULocationTransform): RouteRecord;
    relaunch(location: ULocationTransform): RouteRecord;
    findRecordByKey(recordKey: string): [RouteRecord, number] | undefined;
    destroy(): void;
}
export declare class WindowStack extends HistoryStack<PageStack> {
    constructor();
    getCurrentPages(): {
        pagename: string;
        store: EStore;
        pageComponent?: any;
    }[];
    push(location: ULocationTransform): RouteRecord;
    replace(location: ULocationTransform): RouteRecord;
    relaunch(location: ULocationTransform): RouteRecord;
    private countBack;
    testBack(stepOrKey: number | string, rootOnly: boolean): {
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
export {};
//# sourceMappingURL=history.d.ts.map