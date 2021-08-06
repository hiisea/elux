/// <reference path="../runtime/runtime.d.ts" />
import {compose, createStore, applyMiddleware, Reducer, Unsubscribe, StoreEnhancer, Middleware} from 'redux';
import {env, BStore, ICoreRouter, StoreBuilder, ActionTypes} from '@elux/core';

export interface ReduxOptions {
  initState?: any;
  enhancers?: StoreEnhancer[];
  middlewares?: Middleware[];
}

export interface ReduxStore<S extends Record<string, any> = {}> extends BStore<S> {
  subscribe(listener: () => void): Unsubscribe;
}

const reduxReducer: Reducer = (state, action) => {
  return {...state, ...action.state};
};

export function storeCreator(storeOptions: ReduxOptions, router: ICoreRouter, id = 0): ReduxStore {
  const {initState = {}, enhancers = [], middlewares} = storeOptions;
  if (middlewares) {
    const middlewareEnhancer = applyMiddleware(...middlewares);
    enhancers.push(middlewareEnhancer);
  }
  if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
    enhancers.push(env.__REDUX_DEVTOOLS_EXTENSION__(env.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
  }
  const store = createStore(reduxReducer, initState, enhancers.length > 1 ? compose(...enhancers) : enhancers[0]);
  const {dispatch} = store;
  const reduxStore: ReduxStore = Object.assign(store, {id, router, baseFork: {}}) as any;
  reduxStore.getPureState = reduxStore.getState;
  reduxStore.update = (actionName: string, state: any, actionData: any[]) => {
    dispatch({type: actionName, state, payload: actionData});
  };
  reduxStore.replaceState = (state: any) => {
    dispatch({type: ActionTypes.Replace, state});
  };
  reduxStore.baseFork = {creator: storeCreator, options: storeOptions};
  return reduxStore;
}

export function createRedux(storeOptions: ReduxOptions = {}): StoreBuilder<ReduxOptions, ReduxStore> {
  return {storeOptions, storeCreator};
}
