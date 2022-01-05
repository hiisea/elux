/// <reference path="../runtime/runtime.d.ts" />
import {compose, createStore, applyMiddleware, Reducer, Unsubscribe, StoreEnhancer, Middleware} from 'redux';
import {env, BStore, StoreBuilder, StoreOptions} from '@elux/core';

/**
 * @internal
 */
export interface ReduxOptions extends StoreOptions {
  enhancers?: StoreEnhancer[];
  middlewares?: Middleware[];
}

/**
 * @internal
 */
export interface ReduxStore<S extends Record<string, any> = {}> extends BStore<S> {
  subscribe(listener: () => void): Unsubscribe;
}

const reduxReducer: Reducer = (state, action) => {
  return {...state, ...action.state};
};

/**
 * @internal
 */
export function storeCreator(storeOptions: ReduxOptions, id = 0): ReduxStore {
  const {initState = {}, enhancers = [], middlewares} = storeOptions;
  if (middlewares) {
    const middlewareEnhancer = applyMiddleware(...middlewares);
    enhancers.push(middlewareEnhancer);
  }
  if (id === 0 && process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__());
  }
  const store = createStore(reduxReducer, initState, enhancers.length > 1 ? compose(...enhancers) : enhancers[0]);
  const {dispatch} = store;
  const reduxStore: ReduxStore = store as any;
  reduxStore.id = id;
  reduxStore.builder = {storeCreator, storeOptions};
  reduxStore.update = (actionName: string, state: any, actionData: any[]) => {
    dispatch({type: actionName, state, payload: actionData});
  };
  reduxStore.destroy = () => {
    return;
  };
  return reduxStore;
}

/**
 * @internal
 */
export function createRedux(storeOptions: ReduxOptions = {}): StoreBuilder<ReduxOptions, ReduxStore> {
  return {storeOptions, storeCreator};
}
