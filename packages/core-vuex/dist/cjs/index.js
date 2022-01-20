"use strict";

exports.__esModule = true;
exports.createStore = createStore;
exports.getRefsValue = getRefsValue;
exports.mapState = mapState;
exports.refStore = refStore;
exports.storeCreator = storeCreator;

var _vue = require("vue");

var _store = require("./store");

function storeCreator(storeOptions) {
  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta;
  var state = (0, _vue.reactive)(initState);
  return new _store.Store(state, {
    storeCreator: storeCreator,
    storeOptions: storeOptions
  });
}

function createStore(storeOptions) {
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