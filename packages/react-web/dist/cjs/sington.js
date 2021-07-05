"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.EluxContext = exports.MetaData = void 0;

var _react = _interopRequireDefault(require("react"));

var MetaData = {
  router: undefined
};
exports.MetaData = MetaData;

var EluxContext = _react.default.createContext({
  documentHead: ''
});

exports.EluxContext = EluxContext;