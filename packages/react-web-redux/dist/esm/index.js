import { connect } from 'react-redux';
import { exportView } from '@elux/react-web';
export { createRedux } from '@elux/react-web';
export var connectRedux = function connectRedux() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function (component) {
    return exportView(connect.apply(void 0, args)(component));
  };
};
export * from 'react-redux';