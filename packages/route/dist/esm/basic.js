import { buildConfigSetter } from '@elux/core';
export var routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  disableNativeRoute: false,
  indexUrl: '',
  defaultParams: {}
};
export var setRouteConfig = buildConfigSetter(routeConfig);
export var routeMeta = {};