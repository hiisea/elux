import React, { useCallback } from 'react';
import { coreConfig } from '@elux/core';
import { urlToNativeUrl } from '@elux/route';
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
  props['onClick'] = onClick;
  props['action'] = action;
  props['target'] = target;
  props['to'] = to;
  disabled && (props['disabled'] = true);
  let href = action !== 'back' ? to : '';

  if (href) {
    href = urlToNativeUrl(href);
  } else {
    href = '#';
  }

  props['href'] = href;

  if (coreConfig.Platform === 'taro') {
    return _jsx("span", { ...props,
      ref: ref
    });
  } else {
    return _jsx("a", { ...props,
      ref: ref
    });
  }
});