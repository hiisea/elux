"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard").default;

exports.__esModule = true;
exports.Link = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireWildcard(require("react"));

var _core = require("@elux/core");

var _jsxRuntime = require("react/jsx-runtime");

var _excluded = ["onClick", "disabled", "to", "target", "action"];

var Link = _react.default.forwardRef(function (_ref, ref) {
  var _onClick = _ref.onClick,
      disabled = _ref.disabled,
      _ref$to = _ref.to,
      to = _ref$to === void 0 ? '' : _ref$to,
      _ref$target = _ref.target,
      target = _ref$target === void 0 ? 'page' : _ref$target,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      props = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded);

  var router = _core.coreConfig.UseRouter();

  var onClick = (0, _react.useCallback)(function (event) {
    event.preventDefault();

    if (!disabled) {
      _onClick && _onClick(event);
      to && router[action](action === 'back' ? parseInt(to) : {
        url: to
      }, target);
    }
  }, [_onClick, disabled, to, router, action, target]);
  var href = action !== 'back' ? to : '';
  props['onClick'] = onClick;
  props['action'] = action;
  props['target'] = target;
  props['to'] = to;
  disabled && (props['disabled'] = true);
  href && (props['href'] = href);

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

exports.Link = Link;