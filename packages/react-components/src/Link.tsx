import React, {useContext, useCallback} from 'react';
import {EluxContextComponent} from './base';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  route?: string;
  onClick?(event: React.MouseEvent): void;
  href?: string;
  action?: 'push' | 'replace' | 'relaunch';
  root?: boolean;
}

export default React.forwardRef<HTMLAnchorElement, Props>(({onClick: _onClick, href, route, root, action = 'push', ...props}, ref) => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router!;
  const onClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      _onClick && _onClick(event);
      route && router[action](route, root);
    },
    [_onClick, action, root, route, router]
  );
  props['onClick'] = onClick;
  href && (props['href'] = href);
  route && (props['route'] = route);
  action && (props['action'] = action);
  root && (props['target'] = 'root');

  if (href) {
    return <a {...props} ref={ref} />;
  } else {
    return <div {...props} ref={ref} />;
  }
});
