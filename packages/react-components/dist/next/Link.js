import React, { useContext, useCallback } from 'react';
import { EluxContextComponent } from './base';
import { jsx as _jsx } from "react/jsx-runtime";
export default React.forwardRef(({
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
    return _jsx("a", { ...props,
      ref: ref
    });
  } else {
    return _jsx("div", { ...props,
      ref: ref
    });
  }
});