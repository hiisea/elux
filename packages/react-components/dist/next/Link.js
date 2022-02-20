import _extends from "@babel/runtime/helpers/esm/extends";
import React, { useContext, useCallback } from 'react';
import { EluxContextComponent } from './base';
export const Link = React.forwardRef(({
  onClick: _onClick,
  disabled,
  href,
  route,
  root,
  action = 'push',
  ...props
}, ref) => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  const onClick = useCallback(event => {
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
    return React.createElement("a", _extends({}, props, {
      ref: ref
    }));
  } else {
    return React.createElement("div", _extends({}, props, {
      ref: ref
    }));
  }
});