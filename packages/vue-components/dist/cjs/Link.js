"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = _default;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _vue = require("vue");

var _base = require("./base");

function _default(props, context) {
  var _inject = (0, _vue.inject)(_base.EluxContextKey, {
    documentHead: ''
  }),
      router = _inject.router;

  var onClick = props.onClick,
      href = props.href,
      route = props.route,
      _props$action = props.action,
      action = _props$action === void 0 ? 'push' : _props$action,
      root = props.root,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["onClick", "href", "route", "action", "root"]);
  var newProps = (0, _extends2.default)({}, rest, {
    onClick: function (_onClick) {
      function onClick(_x) {
        return _onClick.apply(this, arguments);
      }

      onClick.toString = function () {
        return _onClick.toString();
      };

      return onClick;
    }(function (event) {
      event.preventDefault();
      onClick && onClick(event);
      router[action](route, root);
    })
  });

  if (href) {
    return (0, _vue.h)('a', newProps, context.slots.default());
  } else {
    return (0, _vue.h)('div', newProps, context.slots.default());
  }
}