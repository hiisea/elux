import { connect } from 'react-redux';
import { defineView } from '@elux/core';
export { Provider } from 'react-redux';
export { createRedux } from '@elux/core-redux';
export var connectRedux = function connectRedux() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function (component) {
    return defineView(connect.apply(void 0, args)(component));
  };
};