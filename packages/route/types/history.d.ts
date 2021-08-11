import { IStore } from '@elux/core';
import { Location } from './basic';
export declare class HistoryRecord {
    readonly key: string;
    readonly history: History;
    readonly store: IStore;
    readonly pagename: string;
    readonly params: Record<string, any>;
    readonly sub: History;
    constructor(location: Location, key: string, history: History, store: IStore);
}
export declare class History {
    private parent;
    private records;
    constructor(parent: History | null);
    startup(record: HistoryRecord): void;
    getRecords(): HistoryRecord[];
    getLength(): number;
    getPages(): {
        pagename: string;
        store: IStore;
        page?: any;
    }[];
    findRecord(keyOrIndex: number | string): HistoryRecord | undefined;
    findIndex(key: string): number;
    getCurrentRecord(): HistoryRecord;
    getCurrentSubHistory(): History;
    push(location: Location, key: string): void;
    replace(location: Location, key: string): void;
    relaunch(location: Location, key: string): void;
    preBack(delta: number, overflowRedirect?: boolean): HistoryRecord | undefined;
    back(delta: number, overflowRedirect?: boolean): void;
}
