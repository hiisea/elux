"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.Link = void 0;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _vue = require("vue");

var _base = require("./base");

var _excluded = ["onClick", "disabled", "href", "route", "action", "root"];

var Link = function Link(_ref, context) {
  var _onClick = _ref.onClick,
      disabled = _ref.disabled,
      href = _ref.href,
      route = _ref.route,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      root = _ref.root,
      props = (0, _objectWithoutPropertiesLoose2.default)(_ref, _excluded);

  var _inject = (0, _vue.inject)(_base.EluxContextKey, {
    documentHead: ''
  }),
      router = _inject.router;

  var onClick = function onClick(event) {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router[action](route, root);
  };

  !disabled && (props['onClick'] = onClick);
  disabled && (props['disabled'] = true);
  !disabled && href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return (0, _vue.h)('a', props, context.slots.default());
  } else {
    return (0, _vue.h)('div', props, context.slots.default());
  }
};

exports.Link = Link;