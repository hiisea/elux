import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
var _excluded = ["onClick", "href", "route", "root", "action"];
import React, { useContext, useCallback } from 'react';
import { EluxContextComponent } from './base';
export default React.forwardRef(function (_ref, ref) {
  var _onClick = _ref.onClick,
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
  props['onClick'] = onClick;
  href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return React.createElement("a", _extends({}, props, {
      ref: ref
    }));
  } else {
    return React.createElement("div", _extends({}, props, {
      ref: ref
    }));
  }
});