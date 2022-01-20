/// <reference path="../runtime/runtime.d.ts" />
import {createStore as createRedux, Reducer} from 'redux';
import {BStore, StoreBuilder, StoreOptions} from '@elux/core';
import {Store} from './store';

const reduxReducer: Reducer = (state, action) => {
  return {...state, ...action.state};
};

/**
 * @internal
 */
export function storeCreator(storeOptions: StoreOptions): BStore {
  const {initState = {}} = storeOptions;
  const baseStore = createRedux(reduxReducer, initState);
  return new Store(baseStore, {storeCreator, storeOptions});
}

/**
 * @internal
 */
export function createStore(storeOptions: StoreOptions = {}): StoreBuilder<StoreOptions, BStore> {
  return {storeOptions, storeCreator};
}
