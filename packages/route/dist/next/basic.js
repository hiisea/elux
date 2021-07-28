import { buildConfigSetter } from '@elux/core';
export const routeConfig = {
  maxHistory: 10,
  notifyNativeRouter: {
    root: true,
    internal: false
  },
  indexUrl: ''
};
export const setRouteConfig = buildConfigSetter(routeConfig);
export const routeMeta = {
  defaultParams: {}
};