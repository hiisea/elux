import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["onClick", "disabled", "to", "target", "action"];
import React, { useCallback } from 'react';
import { coreConfig } from '@elux/core';
import { urlToNativeUrl } from '@elux/route';
import { jsx as _jsx } from "react/jsx-runtime";
export var Link = React.forwardRef(function (_ref, ref) {
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
  var onClick = useCallback(function (event) {
    event.preventDefault();

    if (!disabled) {
      _onClick && _onClick(event);
      to && router[action](action === 'back' ? parseInt(to) : {
        url: to
      }, target);
    }
  }, [_onClick, disabled, to, router, action, target]);
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

  if (process.env.TARO_ENV) {
    return _jsx("span", _extends({}, props, {
      ref: ref
    }));
  } else {
    return _jsx("a", _extends({}, props, {
      ref: ref
    }));
  }
});