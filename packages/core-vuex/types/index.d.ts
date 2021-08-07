import { Plugin, MutationPayload, SubscribeOptions } from 'vuex';
import { WatchOptions } from 'vue';
import { BStore, ICoreRouter, StoreBuilder, BStoreOptions } from '@elux/core';
export interface VuexOptions extends BStoreOptions {
    plugins?: Plugin<any>[];
    devtools?: boolean;
}
export interface VuexStore<S extends Record<string, any> = {}> extends BStore<S> {
    state: S;
    subscribe<P extends MutationPayload>(fn: (mutation: P, state: S) => any, options?: SubscribeOptions): () => void;
    watch<T>(getter: (state: S, getters: any) => T, cb: (value: T, oldValue: T) => void, options?: WatchOptions): () => void;
}
export declare function storeCreator(storeOptions: VuexOptions, router: ICoreRouter, id?: number): VuexStore;
export declare function createVuex(storeOptions?: VuexOptions): StoreBuilder<VuexOptions, VuexStore>;
