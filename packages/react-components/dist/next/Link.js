import _extends from "@babel/runtime/helpers/esm/extends";
import React, { useContext, useCallback } from 'react';
import { EluxContextComponent } from './base';
export default React.forwardRef(({
  onClick: _onClick,
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
  props['onClick'] = onClick;

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