import React from 'react';
import { env, buildConfigSetter } from '@elux/core';
export var reactComponentsConfig = {
  setPageTitle: function setPageTitle(title) {
    return env.document.title = title;
  },
  Provider: null,
  LoadComponentOnError: function LoadComponentOnError(_ref) {
    var message = _ref.message;
    return React.createElement("div", {
      className: "g-component-error"
    }, message);
  },
  LoadComponentOnLoading: function LoadComponentOnLoading() {
    return React.createElement("div", {
      className: "g-component-loading"
    }, "loading...");
  }
};
export var setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);
export var EluxContextComponent = React.createContext({
  documentHead: ''
});