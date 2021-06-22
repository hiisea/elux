import React from 'react';
import {MetaData} from '../sington';

export interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  replace?: boolean;
}

function isModifiedEvent(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

export const Link = React.forwardRef<HTMLAnchorElement, Props>(({onClick, replace, ...rest}, ref) => {
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
        replace ? MetaData.router.replace(rest.href!) : MetaData.router.push(rest.href!);
      }
    },
  };
  // eslint-disable-next-line jsx-a11y/anchor-has-content
  return <a {...props} ref={ref} />;
});
