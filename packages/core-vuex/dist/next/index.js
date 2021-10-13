import { createStore } from 'vuex';
import { computed } from 'vue';
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
    plugins
  } = storeOptions;
  const devtools = id === 0 && process.env.NODE_ENV === 'development';
  const store = createStore({
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
export function refStore(store, maps) {
  const state = store.getState();
  return Object.keys(maps).reduce((data, prop) => {
    data[prop] = computed(() => maps[prop](state));
    return data;
  }, {});
}
export function getRefsValue(refs, keys) {
  return (keys || Object.keys(refs)).reduce((data, key) => {
    data[key] = refs[key].value;
    return data;
  }, {});
}
export function mapState(storeProperty, maps) {
  return Object.keys(maps).reduce((data, prop) => {
    data[prop] = function () {
      const store = this[storeProperty];
      const state = store.getState();
      return maps[prop].call(this, state);
    };

    return data;
  }, {});
}