export var routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {},
  disableNativeRoute: false,
  indexUrl: '',
  defaultParams: null
};
export function setRouteConfig(conf) {
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
  conf.disableNativeRoute && (routeConfig.disableNativeRoute = true);
  conf.indexUrl && (routeConfig.indexUrl = conf.indexUrl);
  conf.defaultParams && (routeConfig.defaultParams = conf.defaultParams);
}