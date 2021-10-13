/// <reference path="../runtime/runtime.d.ts" />
import { Unsubscribe, StoreEnhancer, Middleware } from 'redux';
import { BStore, StoreBuilder, StoreOptions } from '@elux/core';
export interface ReduxOptions extends StoreOptions {
    enhancers?: StoreEnhancer[];
    middlewares?: Middleware[];
}
export interface ReduxStore<S extends Record<string, any> = {}> extends BStore<S> {
    subscribe(listener: () => void): Unsubscribe;
}
export declare function storeCreator(storeOptions: ReduxOptions, id?: number): ReduxStore;
export declare function createRedux(storeOptions?: ReduxOptions): StoreBuilder<ReduxOptions, ReduxStore>;
