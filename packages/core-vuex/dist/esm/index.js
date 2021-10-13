import { createStore } from 'vuex';
import { computed } from 'vue';
import { mergeState } from '@elux/core';

var updateMutation = function updateMutation(state, _ref) {
  var newState = _ref.newState;
  mergeState(state, newState);
};

var UpdateMutationName = 'update';
export function storeCreator(storeOptions, id) {
  var _mutations;

  if (id === void 0) {
    id = 0;
  }

  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      plugins = storeOptions.plugins;
  var devtools = id === 0 && process.env.NODE_ENV === 'development';
  var store = createStore({
    state: initState,
    mutations: (_mutations = {}, _mutations[UpdateMutationName] = updateMutation, _mutations),
    plugins: plugins,
    devtools: devtools
  });
  var vuexStore = store;
  vuexStore.id = id;
  vuexStore.builder = {
    storeCreator: storeCreator,
    storeOptions: storeOptions
  };

  vuexStore.getState = function () {
    return store.state;
  };

  vuexStore.update = function (actionName, newState, actionData) {
    store.commit(UpdateMutationName, {
      actionName: actionName,
      newState: newState,
      actionData: actionData
    });
  };

  vuexStore.destroy = function () {
    return;
  };

  return vuexStore;
}
export function createVuex(storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}
export function refStore(store, maps) {
  var state = store.getState();
  return Object.keys(maps).reduce(function (data, prop) {
    data[prop] = computed(function () {
      return maps[prop](state);
    });
    return data;
  }, {});
}
export function getRefsValue(refs, keys) {
  return (keys || Object.keys(refs)).reduce(function (data, key) {
    data[key] = refs[key].value;
    return data;
  }, {});
}
export function mapState(storeProperty, maps) {
  return Object.keys(maps).reduce(function (data, prop) {
    data[prop] = function () {
      var store = this[storeProperty];
      var state = store.getState();
      return maps[prop].call(this, state);
    };

    return data;
  }, {});
}