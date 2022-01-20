import _extends from "@babel/runtime/helpers/esm/extends";
import { createStore as createRedux } from 'redux';
import { Store } from './store';

var reduxReducer = function reduxReducer(state, action) {
  return _extends({}, state, action.state);
};

export function storeCreator(storeOptions) {
  var _storeOptions$initSta = storeOptions.initState,
      initState = _storeOptions$initSta === void 0 ? {} : _storeOptions$initSta;
  var baseStore = createRedux(reduxReducer, initState);
  return new Store(baseStore, {
    storeCreator: storeCreator,
    storeOptions: storeOptions
  });
}
export function createStore(storeOptions) {
  if (storeOptions === void 0) {
    storeOptions = {};
  }

  return {
    storeOptions: storeOptions,
    storeCreator: storeCreator
  };
}