import _extends from "@babel/runtime/helpers/esm/extends";
import React from 'react';
import { MetaData } from '../sington';

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export const Link = React.forwardRef(({
  onClick,
  replace,
  ...rest
}, ref) => {
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
          replace ? MetaData.router.replace(rest.href) : MetaData.router.push(rest.href);
        }
    }
  };
  return React.createElement("a", _extends({}, props, {
    ref: ref
  }));
});