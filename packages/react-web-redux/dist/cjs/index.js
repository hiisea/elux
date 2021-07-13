"use strict";

exports.__esModule = true;
var _exportNames = {
  createRedux: true,
  connectRedux: true
};
exports.connectRedux = exports.createRedux = void 0;

var _reactRedux = require("react-redux");

Object.keys(_reactRedux).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactRedux[key]) return;
  exports[key] = _reactRedux[key];
});

var _reactWeb = require("@elux/react-web");

exports.createRedux = _reactWeb.createRedux;

var connectRedux = function connectRedux() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return function (component) {
    return (0, _reactWeb.exportView)(_reactRedux.connect.apply(void 0, args)(component));
  };
};

exports.connectRedux = connectRedux;