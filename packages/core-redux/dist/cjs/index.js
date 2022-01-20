"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.createStore = createStore;
exports.storeCreator = storeCreator;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _redux = require("redux");

var _store = require("./store");

var reduxReducer = function reduxReducer(state, action) {
  return (0, _extends2.default)({}, state, action.state);
};

function storeCreator(storeOptions) {
  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta;
  var baseStore = (0, _redux.createStore)(reduxReducer, initState);
  return new _store.Store(baseStore, {
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