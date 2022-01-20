import { IStore } from '@elux/core';
import { ILocationTransform } from './transform';
declare class RouteStack<T extends {
    destroy?: () => void;
    store?: IStore;
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
/*** @internal */
export interface IHistoryRecord {
    key: string;
    location: ILocationTransform;
}
export declare class HistoryRecord implements IHistoryRecord {
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
    findRecordByKey(recordKey: string): [HistoryRecord, number] | undefined;
    destroy(): void;
}
/*** @internal */
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