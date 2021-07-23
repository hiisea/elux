import _extends from "@babel/runtime/helpers/esm/extends";
import _objectWithoutPropertiesLoose from "@babel/runtime/helpers/esm/objectWithoutPropertiesLoose";
import React, { useContext } from 'react';
import { EluxContextComponent } from './base';

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default React.forwardRef(function (_ref, ref) {
  var _onClick = _ref.onClick,
      replace = _ref.replace,
      rest = _objectWithoutPropertiesLoose(_ref, ["onClick", "replace"]);

  var eluxContext = useContext(EluxContextComponent);
  var target = rest.target;

  var props = _extends({}, rest, {
    onClick: function onClick(event) {
      try {
        _onClick && _onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
          event.preventDefault();
          replace ? eluxContext.router.replace(rest.href) : eluxContext.router.push(rest.href);
        }
    }
  });

  return React.createElement("a", _extends({}, props, {
    ref: ref
  }));
});