import React, { useEffect } from 'react';
import { env, isServer } from '@elux/core';

const Component = ({
  children
}) => {
  let title = '';
  React.Children.forEach(children, child => {
    if (child && child.type === 'title') {
      title = child.props.children;
    }
  });

  if (!isServer()) {
    useEffect(() => {
      if (title) {
        env.document.title = title;
      }
    }, [title]);
    return null;
  }

  return React.createElement("head", null, children);
};

export const DocumentHead = React.memo(Component);