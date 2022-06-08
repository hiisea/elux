import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["onClick", "disabled", "to", "action", "classname", "target", "payload"];
import { coreConfig } from '@elux/core';
import { locationToUrl, urlToNativeUrl } from '@elux/route';
import { useCallback, useMemo } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
export var Link = function Link(_ref) {
  var _onClick = _ref.onClick,
      disabled = _ref.disabled,
      _ref$to = _ref.to,
      to = _ref$to === void 0 ? '' : _ref$to,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      _ref$classname = _ref.classname,
      classname = _ref$classname === void 0 ? '' : _ref$classname,
      _ref$target = _ref.target,
      target = _ref$target === void 0 ? 'page' : _ref$target,
      payload = _ref.payload,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  var _useMemo = useMemo(function () {
    var back;
    var url;
    var href;

    if (action === 'back') {
      back = to || 1;
    } else {
      url = classname ? locationToUrl({
        url: to.toString(),
        classname: classname
      }) : to.toString();
      href = urlToNativeUrl(url);
    }

    return {
      back: back,
      url: url,
      href: href
    };
  }, [action, classname, to]),
      back = _useMemo.back,
      url = _useMemo.url,
      href = _useMemo.href;

  var router = coreConfig.UseRouter();
  var onClick = useCallback(function (event) {
    event.preventDefault();

    if (!disabled) {
      _onClick && _onClick(event);
      router[action](back || {
        url: url
      }, target, payload);
    }
  }, [disabled, _onClick, router, action, back, url, target, payload]);
  props['onClick'] = onClick;
  props['action'] = action;
  props['target'] = target;
  props['to'] = (back || url) + '';
  props['href'] = href;
  href && (props['href'] = href);
  classname && (props['classname'] = classname);
  disabled && (props['disabled'] = true);

  if (coreConfig.Platform === 'taro') {
    return _jsx("span", _extends({}, props));
  } else {
    return _jsx("a", _extends({}, props));
  }
};
Link.displayName = 'EluxLink';