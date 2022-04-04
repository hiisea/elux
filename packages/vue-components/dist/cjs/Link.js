"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.Link = void 0;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _vue = require("vue");

var _core = require("@elux/core");

var _route = require("@elux/route");

var _excluded = ["onClick", "disabled", "to", "target", "action"];

var Link = function Link(_ref, context) {
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

  var onClick = function onClick(event) {
    event.preventDefault();

    if (!disabled) {
      _onClick && _onClick(event);
      to && router[action](action === 'back' ? parseInt(to) : {
        url: to
      }, target);
    }
  };

  props['onClick'] = onClick;
  props['action'] = action;
  props['target'] = target;
  props['to'] = to;
  disabled && (props['disabled'] = true);
  var href = action !== 'back' ? to : '';

  if (href) {
    href = (0, _route.urlToNativeUrl)(href);
  } else {
    href = '#';
  }

  props['href'] = href;
  return (0, _vue.h)('a', props, context.slots.default());
};

exports.Link = Link;