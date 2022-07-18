import { exportView, setCoreConfig } from '@elux/core';
import { connect, Provider, useStore } from 'react-redux';
export function connectStore(mapStateToProps, options) {
  return function (component) {
    return exportView(connect(mapStateToProps, options)(component));
  };
}
export const connectRedux = connectStore;
setCoreConfig({
  UseStore: useStore,
  StoreProvider: Provider
});
export { batch, connect, connectAdvanced, createSelectorHook, shallowEqual, useSelector } from 'react-redux';