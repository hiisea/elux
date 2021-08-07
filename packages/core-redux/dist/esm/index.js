import _extends from "@babel/runtime/helpers/esm/extends";
import { compose, createStore, applyMiddleware } from 'redux';
import { env, ActionTypes } from '@elux/core';

var reduxReducer = function reduxReducer(state, action) {
  return _extends({}, state, action.state);
};

export function storeCreator(storeOptions, router, id) {
  if (id === void 0) {
    id = 0;
  }

  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta,
      _storeOptions$enhance = storeOptions.enhancers,
      enhancers = _storeOptions$enhance === void 0 ? [] : _storeOptions$enhance,
      middlewares = storeOptions.middlewares;

  if (middlewares) {
    var middlewareEnhancer = applyMiddleware.apply(void 0, middlewares);
    enhancers.push(middlewareEnhancer);
  }

  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__({
      name: 'elux'
    }));
  }

  var store = createStore(reduxReducer, initState, enhancers.length > 1 ? compose.apply(void 0, enhancers) : enhancers[0]);
  var dispatch = store.dispatch;
  var reduxStore = Object.assign(store, {
    id: id,
    router: router,
    baseFork: {
      creator: storeCreator,
      options: storeOptions
    }
  });

  reduxStore.update = function (actionName, state, actionData) {
    dispatch({
      type: actionName,
      state: state,
      payload: actionData
    });
  };

  reduxStore.replaceState = function (state) {
    dispatch({
      type: ActionTypes.Replace,
      state: state
    });
  };

  reduxStore.destroy = function () {
    return;
  };

  return reduxStore;
}
export function createRedux(storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}