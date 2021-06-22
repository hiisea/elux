import { Location, RootParams } from './basic';
export declare function locationToUri(location: Location, key: string): {
    uri: string;
    pagename: string;
    query: string;
    key: string;
};
export declare function uriToLocation<P extends RootParams>(uri: string): {
    key: string;
    location: Location<P>;
};
interface HistoryRecord {
    uri: string;
    pagename: string;
    query: string;
    key: string;
    sub?: History;
}
export declare class History {
    private parent?;
    private curRecord;
    private pages;
    private actions;
    constructor(data: HistoryRecord | {
        location: Location;
        key: string;
    }, parent?: History | undefined);
    getLength(): number;
    getRecord(keyOrIndex: number | string): HistoryRecord | undefined;
    findIndex(key: string): number;
    getCurrentInternalHistory(): History | undefined;
    getStack(): HistoryRecord[];
    getUriStack(): string[];
    getPageStack(): HistoryRecord[];
    push(location: Location, key: string): void;
    replace(location: Location, key: string): void;
    relaunch(location: Location, key: string): void;
    back(delta: number): boolean;
}
export {};
