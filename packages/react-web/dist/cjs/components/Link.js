"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.Link = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _react = _interopRequireDefault(require("react"));

var _sington = require("../sington");

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

var Link = _react.default.forwardRef(function (_ref, ref) {
  var _onClick = _ref.onClick,
      replace = _ref.replace,
      rest = (0, _objectWithoutPropertiesLoose2.default)(_ref, ["onClick", "replace"]);
  var target = rest.target;
  var props = (0, _extends2.default)({}, rest, {
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
  return _react.default.createElement("a", (0, _extends2.default)({}, props, {
    ref: ref
  }));
});

exports.Link = Link;