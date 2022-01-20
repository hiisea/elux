import { ComputedRef, Ref } from 'vue';
import { BStore, StoreOptions, StoreBuilder } from '@elux/core';
export declare function storeCreator(storeOptions: StoreOptions): BStore;
export declare function createStore(storeOptions?: StoreOptions): StoreBuilder<StoreOptions, BStore>;
export declare function refStore<S extends Record<string, any>, M extends Record<string, (state: S) => any>>(store: BStore<S>, maps: M): {
    [K in keyof M]: ComputedRef<ReturnType<M[K]>>;
};
export declare function getRefsValue<T extends Record<string, Ref<any>>>(refs: T, keys?: Array<keyof T>): {
    [K in keyof T]: T[K]['value'];
};
export declare function mapState<S extends Record<string, any>, M extends Record<string, (state: S) => any>>(storeProperty: string, maps: M): {
    [K in keyof M]: () => ReturnType<M[K]>;
};
//# sourceMappingURL=index.d.ts.map