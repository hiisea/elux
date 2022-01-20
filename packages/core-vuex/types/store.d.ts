import { BStore, StoreBuilder, StoreOptions, State } from '@elux/core';
export declare class Store<S extends State> implements BStore<S> {
    protected readonly _state: S;
    readonly builder: StoreBuilder<StoreOptions, BStore<any>>;
    subscribe: (listener: () => void) => () => void;
    getState: () => S;
    update: (actionName: string, state: Partial<S>) => void;
    constructor(_state: S, builder: StoreBuilder<StoreOptions, BStore<any>>);
    destroy(): void;
}
//# sourceMappingURL=store.d.ts.map