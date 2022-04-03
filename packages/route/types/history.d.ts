import { Store, Location, IRouteRecord } from '@elux/core';
export declare class HistoryStack<T extends {
    destroy: () => void;
    setActive: () => void;
    setInactive: () => void;
}> {
    protected limit: number;
    private currentRecord;
    protected records: T[];
    constructor(limit: number);
    protected init(record: T): void;
    protected onChanged(): void;
    getCurrentItem(): T;
    getEarliestItem(): T;
    getItemAt(n: number): T | undefined;
    getLength(): number;
    push(item: T): void;
    replace(item: T): void;
    relaunch(item: T): void;
    back(delta: number): void;
}
export declare class RouteRecord implements IRouteRecord {
    readonly location: Location;
    readonly pageStack: PageStack;
    readonly key: string;
    constructor(location: Location, pageStack: PageStack);
    setActive(): void;
    setInactive(): void;
    destroy(): void;
}
export declare class PageStack extends HistoryStack<RouteRecord> {
    readonly windowStack: WindowStack;
    id: number;
    readonly key: string;
    private _store;
    constructor(windowStack: WindowStack, location: Location, store: Store);
    get store(): Store;
    replaceStore(store: Store): void;
    findRecordByKey(key: string): [RouteRecord, number] | undefined;
    setActive(): void;
    setInactive(): void;
    destroy(): void;
}
export declare class WindowStack extends HistoryStack<PageStack> {
    id: number;
    constructor(location: Location, store: Store);
    getCurrentWindowPage(): {
        url: string;
        store: Store;
    };
    getWindowPages(): {
        url: string;
        store: Store;
    }[];
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
//# sourceMappingURL=history.d.ts.map