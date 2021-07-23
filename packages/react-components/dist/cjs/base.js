"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.EluxContextComponent = void 0;

var _react = _interopRequireDefault(require("react"));

var EluxContextComponent = _react.default.createContext({
  documentHead: ''
});

exports.EluxContextComponent = EluxContextComponent;