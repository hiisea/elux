import { Store } from 'vuex';
import { mergeState } from '@elux/core';

const updateMutation = (state, {
  newState
}) => {
  mergeState(state, newState);
};

const UpdateMutationName = 'update';
export function storeCreator(storeOptions, id = 0) {
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
  vuexStore.id = id;
  vuexStore.builder = {
    storeCreator,
    storeOptions
  };

  vuexStore.getState = () => {
    return store.state;
  };

  vuexStore.update = (actionName, newState, actionData) => {
    store.commit(UpdateMutationName, {
      actionName,
      newState,
      actionData
    });
  };

  vuexStore.destroy = () => {
    return;
  };

  return vuexStore;
}
export function createVuex(storeOptions = {}) {
  return {
    storeOptions,
    storeCreator
  };
}