import { connect, Provider } from 'react-redux';
import { exportView } from '@elux/core';
import { setReactComponentsConfig } from '@elux/react-web';
export { createRedux } from '@elux/core-redux';
export const connectRedux = function (...args) {
  return function (component) {
    return exportView(connect(...args)(component));
  };
};
export { shallowEqual, connectAdvanced, batch, useSelector, createSelectorHook, Provider, connect } from 'react-redux';
setReactComponentsConfig({
  Provider: Provider
});