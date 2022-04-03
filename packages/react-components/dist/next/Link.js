import React, { useCallback } from 'react';
import { coreConfig } from '@elux/core';
import { jsx as _jsx } from "react/jsx-runtime";
export const Link = React.forwardRef(({
  onClick: _onClick,
  disabled,
  to = '',
  target = 'page',
  action = 'push',
  ...props
}, ref) => {
  const router = coreConfig.UseRouter();
  const onClick = useCallback(event => {
    event.preventDefault();

    if (!disabled) {
      _onClick && _onClick(event);
      to && router[action](action === 'back' ? parseInt(to) : {
        url: to
      }, target);
    }
  }, [_onClick, disabled, to, router, action, target]);
  const href = action !== 'back' ? to : '';
  props['onClick'] = onClick;
  props['action'] = action;
  props['target'] = target;
  props['to'] = to;
  disabled && (props['disabled'] = true);
  href && (props['href'] = href);

  if (href) {
    return _jsx("a", { ...props,
      ref: ref
    });
  } else {
    return _jsx("div", { ...props,
      ref: ref
    });
  }
});