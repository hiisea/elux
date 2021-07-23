import _extends from "@babel/runtime/helpers/esm/extends";
import React, { useContext } from 'react';
import { EluxContextComponent } from './base';

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default React.forwardRef(({
  onClick,
  replace,
  ...rest
}, ref) => {
  const eluxContext = useContext(EluxContextComponent);
  const {
    target
  } = rest;
  const props = { ...rest,
    onClick: event => {
      try {
        onClick && onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (!event.defaultPrevented && event.button === 0 && (!target || target === '_self') && !isModifiedEvent(event)) {
          event.preventDefault();
          replace ? eluxContext.router.replace(rest.href) : eluxContext.router.push(rest.href);
        }
    }
  };
  return React.createElement("a", _extends({}, props, {
    ref: ref
  }));
});