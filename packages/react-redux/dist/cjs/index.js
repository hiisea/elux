"use strict";

exports.__esModule = true;
exports.connectAdvanced = exports.batch = exports.Provider = void 0;
exports.connectRedux = connectRedux;
exports.useStore = exports.useSelector = exports.shallowEqual = exports.createSelectorHook = void 0;

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

function connectRedux(mapStateToProps, options) {
  return function (component) {
    return (0, _core.exportView)((0, _reactRedux.connect)(mapStateToProps, options)(component));
  };
}