import { buildConfigSetter } from '@elux/core';
export const routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  disableNativeRoute: false,
  indexUrl: '',
  defaultParams: {}
};
export const setRouteConfig = buildConfigSetter(routeConfig);
export const routeMeta = {};