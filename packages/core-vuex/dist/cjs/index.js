"use strict";

exports.__esModule = true;
exports.createVuex = createVuex;
exports.getRefsValue = getRefsValue;
exports.mapState = mapState;
exports.refStore = refStore;
exports.storeCreator = storeCreator;

var _vuex = require("vuex");

var _vue = require("vue");

var _core = require("@elux/core");

var updateMutation = function updateMutation(state, _ref) {
  var newState = _ref.newState;
  (0, _core.mergeState)(state, newState);
};

var UpdateMutationName = 'update';

function storeCreator(storeOptions, id) {
  var _mutations;

  if (id === void 0) {
    id = 0;
  }

  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      plugins = storeOptions.plugins;
  var devtools = id === 0 && process.env.NODE_ENV === 'development';
  var store = (0, _vuex.createStore)({
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

function createVuex(storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}

function refStore(store, maps) {
  var state = store.getState();
  return Object.keys(maps).reduce(function (data, prop) {
    data[prop] = (0, _vue.computed)(function () {
      return maps[prop](state);
    });
    return data;
  }, {});
}

function getRefsValue(refs, keys) {
  return (keys || Object.keys(refs)).reduce(function (data, key) {
    data[key] = refs[key].value;
    return data;
  }, {});
}

function mapState(storeProperty, maps) {
  return Object.keys(maps).reduce(function (data, prop) {
    data[prop] = function () {
      var store = this[storeProperty];
      var state = store.getState();
      return maps[prop].call(this, state);
    };

    return data;
  }, {});
}