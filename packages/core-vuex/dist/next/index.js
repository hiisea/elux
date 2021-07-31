import { Store } from 'vuex';
import { mergeState } from '@elux/core';

const updateMutation = (state, {
  newState
}) => {
  mergeState(state, newState);
};

const UpdateMutationName = 'update';
export function storeCreator(storeOptions) {
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
  const vuexStore = store;

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

  vuexStore.clone = {
    creator: storeCreator,
    options: storeOptions
  };
  return vuexStore;
}
export function createVuex(storeOptions = {}) {
  return {
    storeOptions,
    storeCreator
  };
}