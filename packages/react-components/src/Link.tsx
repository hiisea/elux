import React, {useContext} from 'react';
import {EluxContextComponent} from './base';

export interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  replace?: boolean;
}

function isModifiedEvent(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export default React.forwardRef<HTMLAnchorElement, Props>(({onClick, replace, ...rest}, ref) => {
  const eluxContext = useContext(EluxContextComponent);
  const {target} = rest;
  const props = {
    ...rest,
    onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      try {
        onClick && onClick(event);
      } catch (ex) {
        event.preventDefault();
        throw ex;
      }

      if (
        !event.defaultPrevented && // onClick prevented default
        event.button === 0 && // ignore everything but left clicks
        (!target || target === '_self') && // let browser handle "target=_blank" etc.
        !isModifiedEvent(event) // ignore clicks with modifier keys
      ) {
        event.preventDefault();
        replace ? eluxContext.router!.replace(rest.href!) : eluxContext.router!.push(rest.href!);
      }
    },
  };
  return <a {...props} ref={ref} />;
});
