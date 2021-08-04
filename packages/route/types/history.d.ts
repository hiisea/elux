import { IStore } from '@elux/core';
import { Location } from './basic';
export declare class HistoryRecord {
    readonly key: string;
    readonly history: History;
    private store;
    pagename: string;
    query: string;
    sub: History;
    private frozenState;
    constructor(location: Location, key: string, history: History, store: IStore);
    getParams(): any;
    freeze(): void;
    getSnapshotState(): Record<string, any> | undefined;
    getStore(): IStore<any>;
}
export declare class History {
    private parent?;
    private records;
    constructor(parent?: History | undefined, record?: HistoryRecord);
    init(record: HistoryRecord): void;
    getLength(): number;
    getPages(): {
        pagename: string;
        key: string;
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
