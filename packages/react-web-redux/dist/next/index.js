import { connect } from 'react-redux';
import { exportView } from '@elux/react-web';
export { createRedux } from '@elux/react-web';
export const connectRedux = function (...args) {
  return function (component) {
    return exportView(connect(...args)(component));
  };
};
export * from 'react-redux';