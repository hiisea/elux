"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = _default;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _vue = require("vue");

var _base = require("./base");

function _default(_ref, context) {
  var _onClick = _ref.onClick,
      href = _ref.href,
      route = _ref.route,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      root = _ref.root,
      props = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["onClick", "href", "route", "action", "root"]);

  var _inject = (0, _vue.inject)(_base.EluxContextKey, {
    documentHead: ''
  }),
      router = _inject.router;

  props['onClick'] = function (event) {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router[action](route, root);
  };

  if (href) {
    return (0, _vue.h)('a', props, context.slots.default());
  } else {
    return (0, _vue.h)('div', props, context.slots.default());
  }
}