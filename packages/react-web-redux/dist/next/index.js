import { connect } from 'react-redux';
import { exportView } from '@elux/core';
export { Provider } from 'react-redux';
export { createRedux } from '@elux/core-redux';
export const connectRedux = function (...args) {
  return function (component) {
    return exportView(connect(...args)(component));
  };
};