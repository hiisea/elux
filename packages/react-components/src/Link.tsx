import React, {useContext} from 'react';
import {EluxContextComponent} from './base';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
  onClick?(event: React.MouseEvent): void;
  href?: string;
  replace?: boolean;
}

export default React.forwardRef<HTMLAnchorElement, Props>(({onClick, href, url, replace, ...rest}, ref) => {
  const eluxContext = useContext(EluxContextComponent);
  const props = {
    ...rest,
    onClick: (event: React.MouseEvent) => {
      event.preventDefault();
      onClick && onClick(event);
      replace ? eluxContext.router!.replace(url) : eluxContext.router!.push(url);
    },
  };
  if (href) {
    return <a {...props} href={href} ref={ref} />;
  } else {
    return <div {...props} ref={ref} />;
  }
});
