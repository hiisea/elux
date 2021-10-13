import {Plugin, MutationPayload, SubscribeOptions, Mutation, createStore} from 'vuex';
import {WatchOptions, computed, ComputedRef, Ref} from 'vue';
import {mergeState, BStore, StoreOptions, StoreBuilder} from '@elux/core';

export interface VuexOptions extends StoreOptions {
  plugins?: Plugin<any>[];
}

export interface VuexStore<S extends Record<string, any> = {}> extends BStore<S> {
  state: S;
  subscribe<P extends MutationPayload>(fn: (mutation: P, state: S) => any, options?: SubscribeOptions): () => void;
  watch<T>(getter: (state: S, getters: any) => T, cb: (value: T, oldValue: T) => void, options?: WatchOptions): () => void;
}

const updateMutation: Mutation<any> = (state, {newState}) => {
  mergeState(state, newState);
};

const UpdateMutationName = 'update';

export function storeCreator(storeOptions: VuexOptions, id = 0): VuexStore {
  const {initState = {}, plugins} = storeOptions;
  const devtools = id === 0 && process.env.NODE_ENV === 'development';
  const store = createStore({state: initState, mutations: {[UpdateMutationName]: updateMutation}, plugins, devtools});
  const vuexStore: VuexStore = store as any;
  vuexStore.id = id;
  vuexStore.builder = {storeCreator, storeOptions};
  vuexStore.getState = () => {
    return store.state;
  };
  vuexStore.update = (actionName: string, newState: any, actionData: any[]) => {
    store.commit(UpdateMutationName, {actionName, newState, actionData});
  };
  vuexStore.destroy = () => {
    return;
  };
  return vuexStore;
}

export function createVuex(storeOptions: VuexOptions = {}): StoreBuilder<VuexOptions, VuexStore> {
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
