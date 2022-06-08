import { Children } from 'react';
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsx as _jsx } from "react/jsx-runtime";
export var Switch = function Switch(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;
  var arr = [];
  Children.forEach(children, function (item) {
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
Switch.displayName = 'EluxSwitch';