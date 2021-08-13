import { IStore } from '@elux/core';
import { Location } from './basic';
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
    readonly historyStack: HistoryStack;
    static id: number;
    readonly destroy: undefined;
    readonly pagename: string;
    readonly params: Record<string, any>;
    readonly recordKey: string;
    constructor(location: Location, historyStack: HistoryStack);
    getKey(): string;
}
export declare class HistoryStack extends RouteStack<HistoryRecord> {
    readonly rootStack: RootStack;
    readonly store: IStore;
    static id: number;
    readonly stackkey: string;
    constructor(rootStack: RootStack, store: IStore);
    push(location: Location): HistoryRecord;
    replace(location: Location): HistoryRecord;
    relaunch(location: Location): HistoryRecord;
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
    push(location: Location): HistoryRecord;
    replace(location: Location): HistoryRecord;
    relaunch(location: Location): HistoryRecord;
    private countBack;
    testBack(delta: number, rootOnly: boolean): {
        record: HistoryRecord;
        overflow: boolean;
        steps: [number, number];
    };
    findRecordByKey(key: string): HistoryRecord | undefined;
}
export {};
