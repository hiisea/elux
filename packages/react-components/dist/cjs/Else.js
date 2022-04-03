"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.Else = void 0;

var _react = _interopRequireDefault(require("react"));

var _jsxRuntime = require("react/jsx-runtime");

var Component = function Component(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;
  var arr = [];

  _react.default.Children.forEach(children, function (item) {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return (0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
      children: arr
    });
  }

  return (0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
    children: elseView
  });
};

var Else = _react.default.memo(Component);

exports.Else = Else;