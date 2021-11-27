"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.createRedux = createRedux;
exports.storeCreator = storeCreator;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _redux = require("redux");

var _core = require("@elux/core");

var reduxReducer = function reduxReducer(state, action) {
  return (0, _extends2.default)({}, state, action.state);
};

function storeCreator(storeOptions, id) {
  if (id === void 0) {
    id = 0;
  }

  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      _storeOptions$enhance = storeOptions.enhancers,
      enhancers = _storeOptions$enhance === void 0 ? [] : _storeOptions$enhance,
      middlewares = storeOptions.middlewares;

  if (middlewares) {
    var middlewareEnhancer = _redux.applyMiddleware.apply(void 0, middlewares);

    enhancers.push(middlewareEnhancer);
  }

  if (id === 0 && process.env.NODE_ENV === 'development' && _core.env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(_core.env.__REDUX_DEVTOOLS_EXTENSION__());
  }

  var store = (0, _redux.createStore)(reduxReducer, initState, enhancers.length > 1 ? _redux.compose.apply(void 0, enhancers) : enhancers[0]);
  var dispatch = store.dispatch;
  var reduxStore = store;
  reduxStore.id = id;
  reduxStore.builder = {
    storeCreator: storeCreator,
    storeOptions: storeOptions
  };

  reduxStore.update = function (actionName, state, actionData) {
    dispatch({
      type: actionName,
      state: state,
      payload: actionData
    });
  };

  reduxStore.destroy = function () {
    return;
  };

  return reduxStore;
}

function createRedux(storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}