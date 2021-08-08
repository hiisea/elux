import { compose, createStore, applyMiddleware } from 'redux';
import { env, ActionTypes } from '@elux/core';

const reduxReducer = (state, action) => {
  return { ...state,
    ...action.state
  };
};

export function storeCreator(storeOptions, router, id = 0) {
  const {
    initState = {},
    enhancers = [],
    middlewares
  } = storeOptions;

  if (middlewares) {
    const middlewareEnhancer = applyMiddleware(...middlewares);
    enhancers.push(middlewareEnhancer);
  }

  if (id === 0 && process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__());
  }

  const store = createStore(reduxReducer, initState, enhancers.length > 1 ? compose(...enhancers) : enhancers[0]);
  const {
    dispatch
  } = store;
  const reduxStore = Object.assign(store, {
    id,
    router,
    baseFork: {
      creator: storeCreator,
      options: storeOptions
    }
  });

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

  reduxStore.destroy = () => {
    return;
  };

  return reduxStore;
}
export function createRedux(storeOptions = {}) {
  return {
    storeOptions,
    storeCreator
  };
}