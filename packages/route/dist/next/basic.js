import { buildConfigSetter } from '@elux/core';
export const routeConfig = {
  RouteModuleName: 'route',
  maxHistory: 10,
  notifyNativeRouter: {
    root: true,
    internal: false
  },
  indexUrl: ''
};
export const setRouteConfig = buildConfigSetter(routeConfig);
export const routeMeta = {
  defaultParams: {},
  pagenames: {},
  pages: {}
};