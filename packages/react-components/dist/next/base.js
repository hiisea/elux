import React from 'react';
import { env, buildConfigSetter } from '@elux/core';
import { jsx as _jsx } from "react/jsx-runtime";
export const reactComponentsConfig = {
  setPageTitle(title) {
    return env.document.title = title;
  },

  Provider: null,
  useStore: null,
  LoadComponentOnError: ({
    message
  }) => _jsx("div", {
    className: "g-component-error",
    children: message
  }),
  LoadComponentOnLoading: () => _jsx("div", {
    className: "g-component-loading",
    children: "loading..."
  })
};
export const setReactComponentsConfig = buildConfigSetter(reactComponentsConfig);
export const EluxContextComponent = React.createContext({
  documentHead: ''
});