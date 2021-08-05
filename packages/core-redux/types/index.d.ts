/// <reference path="../runtime/runtime.d.ts" />
import { Unsubscribe, StoreEnhancer, Middleware } from 'redux';
import { BStore, ICoreRouter, StoreBuilder } from '@elux/core';
export interface ReduxOptions {
    initState?: any;
    enhancers?: StoreEnhancer[];
    middlewares?: Middleware[];
}
export interface ReduxStore<S extends Record<string, any> = {}> extends BStore<S> {
    subscribe(listener: () => void): Unsubscribe;
}
export declare function storeCreator(storeOptions: ReduxOptions, router: ICoreRouter, id?: number): ReduxStore;
export declare function createRedux(storeOptions?: ReduxOptions): StoreBuilder<ReduxOptions, ReduxStore>;
