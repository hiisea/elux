import React, {ReactNode, useEffect} from 'react';
import {env, isServer} from '@elux/core';

interface Props {
  children?: ReactNode;
}

const Component: React.FC<Props> = ({children}) => {
  let title = '';
  React.Children.forEach(children, (child: any) => {
    if (child && child.type === 'title') {
      title = child.props.children;
    }
  });
  if (!isServer()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (title) {
        env.document.title = title;
      }
    }, [title]);
    return null;
  }
  return <head>{children}</head>;
};

export const DocumentHead = React.memo(Component);
