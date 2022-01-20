import { BStore, StoreBuilder, StoreOptions, State } from '@elux/core';
import { Store as Redux, Unsubscribe } from 'redux';
export declare class Store<S extends State> implements BStore<S> {
    protected readonly _redux: Redux;
    readonly builder: StoreBuilder<StoreOptions, BStore<any>>;
    subscribe: (listener: () => void) => Unsubscribe;
    getState: () => S;
    update: (actionName: string, state: Partial<S>) => void;
    constructor(_redux: Redux, builder: StoreBuilder<StoreOptions, BStore<any>>);
    destroy(): void;
}
//# sourceMappingURL=store.d.ts.map