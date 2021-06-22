import { connect } from 'react-redux';
import { defineView } from '@elux/core';
export { Provider } from 'react-redux';
export { createRedux } from '@elux/core-redux';
export const connectRedux = function (...args) {
  return function (component) {
    defineView(component);
    return connect(...args)(component);
  };
};