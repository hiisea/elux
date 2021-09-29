import { IStore } from '@elux/core';
import { ILocationTransform } from './transform';
declare class RouteStack<T extends {
    destroy?: () => void;
}> {
    protected limit: number;
    protected records: T[];
    constructor(limit: number);
    startup(record: T): void;
    getCurrentItem(): T;
    getItems(): T[];
    getLength(): number;
    getRecordAt(n: number): T | undefined;
    protected _push(item: T): void;
    protected _replace(item: T): void;
    protected _relaunch(item: T): void;
    back(delta: number): void;
}
export declare class HistoryRecord {
    readonly location: ILocationTransform;
    readonly historyStack: HistoryStack;
    static id: number;
    readonly destroy: undefined;
    readonly key: string;
    readonly recordKey: string;
    constructor(location: ILocationTransform, historyStack: HistoryStack);
}
export declare class HistoryStack extends RouteStack<HistoryRecord> {
    readonly rootStack: RootStack;
    readonly store: IStore;
    static id: number;
    readonly stackkey: string;
    constructor(rootStack: RootStack, store: IStore);
    push(location: ILocationTransform): HistoryRecord;
    replace(location: ILocationTransform): HistoryRecord;
    relaunch(location: ILocationTransform): HistoryRecord;
    findRecordByKey(recordKey: string): HistoryRecord | undefined;
    destroy(): void;
}
export declare class RootStack extends RouteStack<HistoryStack> {
    constructor();
    getCurrentPages(): {
        pagename: string;
        store: IStore;
        page?: any;
    }[];
    push(location: ILocationTransform): HistoryRecord;
    replace(location: ILocationTransform): HistoryRecord;
    relaunch(location: ILocationTransform): HistoryRecord;
    private countBack;
    testBack(delta: number, rootOnly: boolean): {
        record: HistoryRecord;
        overflow: boolean;
        steps: [number, number];
    };
    findRecordByKey(key: string): HistoryRecord | undefined;
}
export {};
