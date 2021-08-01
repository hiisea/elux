import { compose, createStore, applyMiddleware } from 'redux';
import { env, ActionTypes } from '@elux/core';

const reduxReducer = (state, action) => {
  return { ...state,
    ...action.state
  };
};

export function storeCreator(storeOptions) {
  const {
    initState = {},
    enhancers = [],
    middlewares
  } = storeOptions;

  if (middlewares) {
    const middlewareEnhancer = applyMiddleware(...middlewares);
    enhancers.push(middlewareEnhancer);
  }

  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }

  const store = createStore(reduxReducer, initState, enhancers.length > 1 ? compose(...enhancers) : enhancers[0]);
  const {
    dispatch
  } = store;
  const reduxStore = store;
  reduxStore.getPureState = reduxStore.getState;

  reduxStore.update = (actionName, state, actionData) => {
    dispatch({
      type: actionName,
      state,
      payload: actionData
    });
  };

  reduxStore.replaceState = state => {
    dispatch({
      type: ActionTypes.Replace,
      state
    });
  };

  reduxStore.clone = {
    creator: storeCreator,
    options: storeOptions
  };
  return reduxStore;
}
export function createRedux(storeOptions = {}) {
  return {
    storeOptions,
    storeCreator
  };
}