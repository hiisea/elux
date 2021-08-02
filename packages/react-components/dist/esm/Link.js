import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useContext } from 'react';
import { EluxContextComponent } from './base';
export default React.forwardRef(function (_ref, ref) {
  var onClick = _ref.onClick,
      href = _ref.href,
      url = _ref.url,
      portal = _ref.portal,
      replace = _ref.replace,
      rest = _objectWithoutPropertiesLoose(_ref, ["onClick", "href", "url", "portal", "replace"]);

  var eluxContext = useContext(EluxContextComponent);

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
      replace ? eluxContext.router.replace(url, portal) : eluxContext.router.push(url, portal);
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