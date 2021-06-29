"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.default = _default;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _vue = require("vue");

var _sington = require("../sington");

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

function _default(props, context) {
  var _onClick = props.onClick,
      replace = props.replace,
      rest = (0, _objectWithoutPropertiesLoose2.default)(props, ["onClick", "replace"]);
  var target = rest.target;
  var newProps = (0, _extends2.default)({}, rest, {
    onClick: function onClick(event) {
      try {
        _onClick && _onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
          event.preventDefault();
          replace ? _sington.MetaData.router.replace(rest.href) : _sington.MetaData.router.push(rest.href);
        }
    }
  });
  return (0, _vue.h)('a', newProps, context.slots);
}