import React from 'react';
import { buildConfigSetter } from '@elux/core';
export const reactComponentsConfig = {
  LoadComponentOnError: ({
    message
  }) => React.createElement("div", {
    className: "g-component-error"
  }, message),
  LoadComponentOnLoading: () => React.createElement("div", {
    className: "g-component-loading"
  }, "loading...")
};
export const setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);
export const EluxContextComponent = React.createContext({
  documentHead: ''
});