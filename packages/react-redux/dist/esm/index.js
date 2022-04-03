import { connect, useStore, Provider } from 'react-redux';
import { exportView, setCoreConfig } from '@elux/core';
export function connectRedux(mapStateToProps, options) {
  return function (component) {
    return exportView(connect(mapStateToProps, options)(component));
  };
}
setCoreConfig({
  UseStore: useStore,
  StoreProvider: Provider
});
export { shallowEqual, connectAdvanced, batch, useSelector, createSelectorHook, connect } from 'react-redux';