import { Store } from 'vuex';
import { mergeState } from '@elux/core';

const updateMutation = (state, {
  newState
}) => {
  mergeState(state, newState);
};

const UpdateMutationName = 'update';
export function storeCreator(storeOptions, router, id = 0) {
  const {
    initState = {},
    plugins,
    devtools = true
  } = storeOptions;
  const store = new Store({
    state: initState,
    mutations: {
      [UpdateMutationName]: updateMutation
    },
    plugins,
    devtools
  });
  const vuexStore = Object.assign(store, {
    id,
    router,
    baseFork: {}
  });

  vuexStore.getState = () => {
    return store.state;
  };

  vuexStore.getPureState = () => {
    const state = vuexStore.getState();
    return JSON.parse(JSON.stringify(state));
  };

  vuexStore.update = (actionName, newState, actionData) => {
    store.commit(UpdateMutationName, {
      actionName,
      newState,
      actionData
    });
  };

  vuexStore.baseFork.creator = storeCreator;
  vuexStore.baseFork.options = storeOptions;
  return vuexStore;
}
export function createVuex(storeOptions = {}) {
  return {
    storeOptions,
    storeCreator
  };
}