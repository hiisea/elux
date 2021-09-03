import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useContext } from 'react';
import { EluxContextComponent } from './base';
export default React.forwardRef(function (_ref, ref) {
  var onClick = _ref.onClick,
      href = _ref.href,
      route = _ref.route,
      root = _ref.root,
      _ref$action = _ref.action,
      action = _ref$action === void 0 ? 'push' : _ref$action,
      rest = _objectWithoutPropertiesLoose(_ref, ["onClick", "href", "route", "root", "action"]);

  var eluxContext = useContext(EluxContextComponent);
  var router = eluxContext.router;

  var props = _extends({}, rest, {
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
      router[action](route, root);
    })
  });

  if (href) {
    return React.createElement("a", _extends({}, props, {
      href: href,
      ref: ref
    }));
  } else {
    return React.createElement("div", _extends({}, props, {
      ref: ref
    }));
  }
});