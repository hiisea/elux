import { EStore } from '@elux/core';
import { ULocationTransform } from './transform';
declare class RouteStack<T extends {
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
/*** @public */
export interface UHistoryRecord {
    key: string;
    location: ULocationTransform;
}
export declare class HistoryRecord implements UHistoryRecord {
    readonly location: ULocationTransform;
    readonly historyStack: HistoryStack;
    static id: number;
    readonly destroy: undefined;
    readonly key: string;
    readonly recordKey: string;
    constructor(location: ULocationTransform, historyStack: HistoryStack);
}
export declare class HistoryStack extends RouteStack<HistoryRecord> {
    readonly rootStack: RootStack;
    readonly store: EStore;
    static id: number;
    readonly stackkey: string;
    constructor(rootStack: RootStack, store: EStore);
    push(location: ULocationTransform): HistoryRecord;
    replace(location: ULocationTransform): HistoryRecord;
    relaunch(location: ULocationTransform): HistoryRecord;
    findRecordByKey(recordKey: string): [HistoryRecord, number] | undefined;
    destroy(): void;
}
export declare class RootStack extends RouteStack<HistoryStack> {
    constructor();
    getCurrentPages(): {
        pagename: string;
        store: EStore;
        pageData?: any;
    }[];
    push(location: ULocationTransform): HistoryRecord;
    replace(location: ULocationTransform): HistoryRecord;
    relaunch(location: ULocationTransform): HistoryRecord;
    private countBack;
    testBack(stepOrKey: number | string, rootOnly: boolean): {
        record: HistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByKey(key: string): {
        record: HistoryRecord;
        overflow: boolean;
        index: [number, number];
    };
}
export {};
//# sourceMappingURL=history.d.ts.map