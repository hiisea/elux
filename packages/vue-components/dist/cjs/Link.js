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
      url = props.url,
      replace = props.replace,
      portal = props.portal,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["onClick", "href", "url", "replace", "portal"]);
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
      replace ? router.replace(url, portal) : router.push(url, portal);
    })
  });

  if (href) {
    return (0, _vue.h)('a', newProps, context.slots);
  } else {
    return (0, _vue.h)('div', newProps, context.slots);
  }
}