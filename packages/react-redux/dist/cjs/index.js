"use strict";

exports.__esModule = true;
exports.useStore = exports.useSelector = exports.shallowEqual = exports.createSelectorHook = exports.createRedux = exports.connectRedux = exports.connectAdvanced = exports.batch = exports.Provider = void 0;

var _reactRedux = require("react-redux");

exports.connect = _reactRedux.connect;
exports.shallowEqual = _reactRedux.shallowEqual;
exports.connectAdvanced = _reactRedux.connectAdvanced;
exports.batch = _reactRedux.batch;
exports.useSelector = _reactRedux.useSelector;
exports.createSelectorHook = _reactRedux.createSelectorHook;
exports.Provider = _reactRedux.Provider;
exports.useStore = _reactRedux.useStore;

var _core = require("@elux/core");

var _coreRedux = require("@elux/core-redux");

exports.createRedux = _coreRedux.createRedux;

var connectRedux = function connectRedux() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function (component) {
    return (0, _core.exportView)(_reactRedux.connect.apply(void 0, args)(component));
  };
};

exports.connectRedux = connectRedux;