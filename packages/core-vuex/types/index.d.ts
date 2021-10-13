import { Plugin, MutationPayload, SubscribeOptions } from 'vuex';
import { WatchOptions, ComputedRef, Ref } from 'vue';
import { BStore, StoreOptions, StoreBuilder } from '@elux/core';
export interface VuexOptions extends StoreOptions {
    plugins?: Plugin<any>[];
}
export interface VuexStore<S extends Record<string, any> = {}> extends BStore<S> {
    state: S;
    subscribe<P extends MutationPayload>(fn: (mutation: P, state: S) => any, options?: SubscribeOptions): () => void;
    watch<T>(getter: (state: S, getters: any) => T, cb: (value: T, oldValue: T) => void, options?: WatchOptions): () => void;
}
export declare function storeCreator(storeOptions: VuexOptions, id?: number): VuexStore;
export declare function createVuex(storeOptions?: VuexOptions): StoreBuilder<VuexOptions, VuexStore>;
export declare function refStore<S extends Record<string, any>, M extends Record<string, (state: S) => any>>(store: BStore<S>, maps: M): {
    [K in keyof M]: ComputedRef<ReturnType<M[K]>>;
};
export declare function getRefsValue<T extends Record<string, Ref<any>>>(refs: T, keys?: Array<keyof T>): {
    [K in keyof T]: T[K]['value'];
};
export declare function mapState<S extends Record<string, any>, M extends Record<string, (state: S) => any>>(storeProperty: string, maps: M): {
    [K in keyof M]: () => ReturnType<M[K]>;
};
