import _extends from "@babel/runtime/helpers/esm/extends";
import React, { useContext } from 'react';
import { EluxContextComponent } from './base';
export default React.forwardRef(({
  onClick,
  href,
  route,
  root,
  action = 'push',
  ...rest
}, ref) => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router;
  const props = { ...rest,
    onClick: event => {
      event.preventDefault();
      onClick && onClick(event);
      router[action](route, root);
    }
  };

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