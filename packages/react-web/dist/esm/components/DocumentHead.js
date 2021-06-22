import React, { useEffect } from 'react';
import { env, isServer } from '@elux/core';

var Component = function Component(_ref) {
  var children = _ref.children;
  var title = '';
  React.Children.forEach(children, function (child) {
    if (child && child.type === 'title') {
      title = child.props.children;
    }
  });

  if (!isServer()) {
    useEffect(function () {
      if (title) {
        env.document.title = title;
      }
    }, [title]);
    return null;
  }

  return React.createElement("head", null, children);
};

export var DocumentHead = React.memo(Component);