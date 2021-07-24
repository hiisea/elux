import React from 'react';
import { buildConfigSetter } from '@elux/core';
export var reactComponentsConfig = {
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