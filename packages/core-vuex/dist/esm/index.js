import { Store } from 'vuex';
import { mergeState } from '@elux/core';

var updateMutation = function updateMutation(state, _ref) {
  var newState = _ref.newState;
  mergeState(state, newState);
};

var UpdateMutationName = 'update';
export function storeCreator(storeOptions, router, id) {
  var _mutations;

  if (id === void 0) {
    id = 0;
  }

  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      plugins = storeOptions.plugins,
      _storeOptions$devtool = storeOptions.devtools,
      devtools = _storeOptions$devtool === void 0 ? true : _storeOptions$devtool;
  var store = new Store({
    state: initState,
    mutations: (_mutations = {}, _mutations[UpdateMutationName] = updateMutation, _mutations),
    plugins: plugins,
    devtools: devtools
  });
  var vuexStore = Object.assign(store, {
    id: id,
    router: router,
    baseFork: {
      creator: storeCreator,
      options: storeOptions
    }
  });

  vuexStore.getState = function () {
    return store.state;
  };

  vuexStore.getPureState = function () {
    var state = vuexStore.getState();
    return JSON.parse(JSON.stringify(state));
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