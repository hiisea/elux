import {reactive, computed, ComputedRef, Ref} from 'vue';
import {BStore, StoreOptions, StoreBuilder} from '@elux/core';
import {Store} from './store';

export function storeCreator(storeOptions: StoreOptions): BStore {
  const {initState = {}} = storeOptions;
  const state = reactive(initState);

  return new Store(state, {storeCreator, storeOptions});
}

export function createStore(storeOptions: StoreOptions = {}): StoreBuilder<StoreOptions, BStore> {
  return {storeOptions, storeCreator};
}

export function refStore<S extends Record<string, any>, M extends Record<string, (state: S) => any>>(
  store: BStore<S>,
  maps: M
): {[K in keyof M]: ComputedRef<ReturnType<M[K]>>} {
  const state = store.getState();
  return Object.keys(maps).reduce((data, prop) => {
    data[prop] = computed(() => maps[prop](state));
    return data;
  }, {} as any);
}
export function getRefsValue<T extends Record<string, Ref<any>>>(refs: T, keys?: Array<keyof T>): {[K in keyof T]: T[K]['value']} {
  return (keys || Object.keys(refs)).reduce((data, key) => {
    data[key] = refs[key].value;
    return data;
  }, {} as any);
}
export function mapState<S extends Record<string, any>, M extends Record<string, (state: S) => any>>(
  storeProperty: string,
  maps: M
): {[K in keyof M]: () => ReturnType<M[K]>} {
  return Object.keys(maps).reduce((data, prop) => {
    data[prop] = function () {
      const store: BStore = this[storeProperty];
      const state = store.getState();
      return maps[prop].call(this, state);
    };
    return data;
  }, {} as any);
}
