import React from 'react';
import { env, buildConfigSetter } from '@elux/core';
import { jsx as _jsx } from "react/jsx-runtime";
export var reactComponentsConfig = {
  setPageTitle: function setPageTitle(title) {
    return env.document.title = title;
  },
  Provider: null,
  useStore: null,
  LoadComponentOnError: function LoadComponentOnError(_ref) {
    var message = _ref.message;
    return _jsx("div", {
      className: "g-component-error",
      children: message
    });
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return _jsx("div", {
      className: "g-component-loading",
      children: "loading..."
    });
  }
};
export var setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);
export var EluxContextComponent = React.createContext({
  documentHead: ''
});