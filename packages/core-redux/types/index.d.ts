/// <reference path="../runtime/runtime.d.ts" />
import { Unsubscribe, StoreEnhancer, Middleware } from 'redux';
import { BStore, StoreBuilder, StoreOptions } from '@elux/core';
/**
 * @internal
 */
export interface ReduxOptions extends StoreOptions {
    enhancers?: StoreEnhancer[];
    middlewares?: Middleware[];
}
/**
 * @internal
 */
export interface ReduxStore<S extends Record<string, any> = {}> extends BStore<S> {
    subscribe(listener: () => void): Unsubscribe;
}
/**
 * @internal
 */
export declare function storeCreator(storeOptions: ReduxOptions, id?: number): ReduxStore;
/**
 * @internal
 */
export declare function createRedux(storeOptions?: ReduxOptions): StoreBuilder<ReduxOptions, ReduxStore>;
//# sourceMappingURL=index.d.ts.map