import { Location } from './basic';
export declare class HistoryRecord {
    key: string;
    pagename: string;
    query: string;
    sub: History;
    constructor(location: Location, key: string, history: History);
    getParams(): any;
}
export declare class History {
    private parent?;
    records: HistoryRecord[];
    constructor(parent?: History | undefined, record?: HistoryRecord);
    getCurRecord(): HistoryRecord;
    getLength(): Number;
    findRecord(keyOrIndex: number | string): HistoryRecord | undefined;
    findIndex(key: string): number;
    getCurrentSubHistory(): History;
    getStack(): HistoryRecord[];
    push(location: Location, key: string): void;
    replace(location: Location, key: string): void;
    relaunch(location: Location, key: string): void;
    back(delta: number, overflowRedirect?: boolean): HistoryRecord | undefined;
}
