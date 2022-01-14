"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;

exports.__esModule = true;
exports.default = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _base = require("./base");

var _jsxRuntime = require("react/jsx-runtime");

var _excluded = ["onClick", "disabled", "href", "route", "root", "action"];

var _default = _react.default.forwardRef(function (_ref, ref) {
  var _onClick = _ref.onClick,
      disabled = _ref.disabled,
      href = _ref.href,
      route = _ref.route,
      root = _ref.root,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      props = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded);
  var eluxContext = (0, _react.useContext)(_base.EluxContextComponent);
  var router = eluxContext.router;
  var onClick = (0, _react.useCallback)(function (event) {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router[action](route, root);
  }, [_onClick, action, root, route, router]);
  !disabled && (props['onClick'] = onClick);
  disabled && (props['disabled'] = true);
  !disabled && href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return (0, _jsxRuntime.jsx)("a", (0, _extends2.default)({}, props, {
      ref: ref
    }));
  } else {
    return (0, _jsxRuntime.jsx)("div", (0, _extends2.default)({}, props, {
      ref: ref
    }));
  }
});

exports.default = _default;