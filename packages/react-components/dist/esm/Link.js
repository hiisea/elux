import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["onClick", "disabled", "href", "route", "root", "action"];
import React, { useContext, useCallback } from 'react';
import { EluxContextComponent } from './base';
import { jsx as _jsx } from "react/jsx-runtime";
export default React.forwardRef(function (_ref, ref) {
  var _onClick = _ref.onClick,
      disabled = _ref.disabled,
      href = _ref.href,
      route = _ref.route,
      root = _ref.root,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      props = _objectWithoutPropertiesLoose(_ref, _excluded);

  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;
  var onClick = useCallback(function (event) {
    event.preventDefault();
    _onClick && _onClick(event);
    route && router[action](route, root);
  }, [_onClick, action, root, route, router]);
  !disabled && (props['onClick'] = onClick);
  disabled && (props['disabled'] = true);
  !disabled && href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return _jsx("a", _extends({}, props, {
      ref: ref
    }));
  } else {
    return _jsx("div", _extends({}, props, {
      ref: ref
    }));
  }
});