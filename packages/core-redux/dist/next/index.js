import { createStore as createRedux } from 'redux';
import { Store } from './store';

const reduxReducer = (state, action) => {
  return { ...state,
    ...action.state
  };
};

export function storeCreator(storeOptions) {
  const {
    initState = {}
  } = storeOptions;
  const baseStore = createRedux(reduxReducer, initState);
  return new Store(baseStore, {
    storeCreator,
    storeOptions
  });
}
export function createStore(storeOptions = {}) {
  return {
    storeOptions,
    storeCreator
  };
}