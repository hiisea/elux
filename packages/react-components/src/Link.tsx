import React, {useContext} from 'react';
import {EluxContextComponent} from './base';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  onClick?(event: React.MouseEvent): void;
  href?: string;
  action?: 'push' | 'replace' | 'relaunch';
  root?: boolean;
}

export default React.forwardRef<HTMLAnchorElement, Props>(({onClick, href, url, root, action = 'push', ...rest}, ref) => {
  const eluxContext = useContext(EluxContextComponent);
  const router = eluxContext.router!;
  const props = {
    ...rest,
    onClick: (event: React.MouseEvent) => {
      event.preventDefault();
      onClick && onClick(event);
      router[action](url, root);
    },
  };
  if (href) {
    return <a {...props} href={href} ref={ref} />;
  } else {
    return <div {...props} ref={ref} />;
  }
});
