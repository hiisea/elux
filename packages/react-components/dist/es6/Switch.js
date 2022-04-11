import React from 'react';
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsx as _jsx } from "react/jsx-runtime";

const Component = ({
  children,
  elseView
}) => {
  const arr = [];
  React.Children.forEach(children, item => {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return _jsx(_Fragment, {
      children: arr[0]
    });
  }

  return _jsx(_Fragment, {
    children: elseView
  });
};

export const Switch = React.memo(Component);