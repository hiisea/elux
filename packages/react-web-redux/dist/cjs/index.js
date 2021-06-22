"use strict";

exports.__esModule = true;
exports.connectRedux = exports.createRedux = exports.Provider = void 0;

var _reactRedux = require("react-redux");

exports.Provider = _reactRedux.Provider;

var _core = require("@elux/core");

var _coreRedux = require("@elux/core-redux");

exports.createRedux = _coreRedux.createRedux;

var connectRedux = function connectRedux() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function (component) {
    (0, _core.defineView)(component);
    return _reactRedux.connect.apply(void 0, args)(component);
  };
};

exports.connectRedux = connectRedux;