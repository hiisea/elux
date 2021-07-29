"use strict";

exports.__esModule = true;
exports.storeCreator = storeCreator;
exports.createVuex = createVuex;

var _vuex = require("vuex");

var _core = require("@elux/core");

var updateMutation = function updateMutation(state, _ref) {
  var newState = _ref.newState;
  (0, _core.mergeState)(state, newState);
};

var UpdateMutationName = 'update';

function storeCreator(storeOptions) {
  var _mutations;

  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      plugins = storeOptions.plugins,
      _storeOptions$devtool = storeOptions.devtools,
      devtools = _storeOptions$devtool === void 0 ? true : _storeOptions$devtool;
  var store = new _vuex.Store({
    state: initState,
    mutations: (_mutations = {}, _mutations[UpdateMutationName] = updateMutation, _mutations),
    plugins: plugins,
    devtools: devtools
  });
  var vuexStore = store;

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

  return vuexStore;
}

function createVuex(storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}