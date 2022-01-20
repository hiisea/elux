import React from 'react';

var Component = function Component(_ref) {
  var children = _ref.children,
      elseView = _ref.elseView;
  var arr = [];
  React.Children.forEach(children, function (item) {
    item && arr.push(item);
  });

  if (arr.length > 0) {
    return React.createElement(React.Fragment, null, arr);
  }

  return React.createElement(React.Fragment, null, elseView);
};

export default React.memo(Component);