import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["onClick", "disabled", "to", "target", "action"];
import { h } from 'vue';
import { coreConfig } from '@elux/core';
import { urlToNativeUrl } from '@elux/route';
export var Link = function Link(_ref, context) {
  var _onClick = _ref.onClick,
      disabled = _ref.disabled,
      _ref$to = _ref.to,
      to = _ref$to === void 0 ? '' : _ref$to,
      _ref$target = _ref.target,
      target = _ref$target === void 0 ? 'page' : _ref$target,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  var router = coreConfig.UseRouter();

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
    href = urlToNativeUrl(href);
  } else {
    href = '#';
  }

  props['href'] = href;

  if (coreConfig.Platform === 'taro') {
    return h('span', props, context.slots.default());
  } else {
    return h('a', props, context.slots.default());
  }
};