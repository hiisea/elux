import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["to", "cname", "action", "onClick", "disabled", "overflowRedirect", "target", "payload"];
import { coreConfig } from '@elux/core';
import { urlToNativeUrl } from '@elux/route';
import { useCallback, useMemo, useRef } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
export var Link = function Link(_ref) {
  var to = _ref.to,
      cname = _ref.cname,
      action = _ref.action,
      onClick = _ref.onClick,
      disabled = _ref.disabled,
      overflowRedirect = _ref.overflowRedirect,
      target = _ref.target,
      payload = _ref.payload,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  var router = coreConfig.UseRouter();

  var _useMemo = useMemo(function () {
    var firstArg, url, href;

    if (action === 'back') {
      firstArg = to;
      url = "#" + to.toString();
      href = "#";
    } else {
      var location = typeof to === 'string' ? {
        url: to
      } : to;
      cname !== undefined && (location.classname = cname);
      url = router.computeUrl(location, action, target);
      firstArg = {
        url: url
      };
      href = urlToNativeUrl(url);
    }

    return {
      firstArg: firstArg,
      url: url,
      href: href
    };
  }, [target, action, cname, router, to]),
      firstArg = _useMemo.firstArg,
      url = _useMemo.url,
      href = _useMemo.href;

  var data = {
    router: router,
    onClick: onClick,
    disabled: disabled,
    firstArg: firstArg,
    action: action,
    target: target,
    payload: payload,
    overflowRedirect: overflowRedirect
  };
  var refData = useRef(data);
  Object.assign(refData.current, data);
  var clickHandler = useCallback(function (event) {
    event.preventDefault();
    var _refData$current = refData.current,
        router = _refData$current.router,
        disabled = _refData$current.disabled,
        onClick = _refData$current.onClick,
        firstArg = _refData$current.firstArg,
        action = _refData$current.action,
        target = _refData$current.target,
        payload = _refData$current.payload,
        overflowRedirect = _refData$current.overflowRedirect;

    if (!disabled) {
      onClick && onClick(event);
      router[action](firstArg, target, payload, overflowRedirect);
    }
  }, []);
  props['onClick'] = clickHandler;
  props['action'] = action;
  props['target'] = target;
  props['url'] = url;
  props['href'] = href;
  overflowRedirect && (props['overflow'] = overflowRedirect);
  disabled && (props['disabled'] = true);

  if (coreConfig.Platform === 'taro') {
    return _jsx("span", _extends({}, props));
  } else {
    return _jsx("a", _extends({}, props));
  }
};
Link.displayName = 'EluxLink';