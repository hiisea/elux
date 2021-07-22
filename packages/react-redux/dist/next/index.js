import { connect } from 'react-redux';
import { exportView } from '@elux/core';
export { createRedux } from '@elux/core-redux';
export const connectRedux = function (...args) {
  return function (component) {
    return exportView(connect(...args)(component));
  };
};
export { shallowEqual, connectAdvanced, batch, useSelector, createSelectorHook, Provider } from 'react-redux';