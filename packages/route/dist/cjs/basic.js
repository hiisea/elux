"use strict";

exports.__esModule = true;
exports.setRouteConfig = setRouteConfig;
exports.routeConfig = void 0;
var routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {},
  disableNativeRoute: false,
  indexUrl: '',
  defaultParams: null
};
exports.routeConfig = routeConfig;

function setRouteConfig(conf) {
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
  conf.disableNativeRoute && (routeConfig.disableNativeRoute = true);
  conf.indexUrl && (routeConfig.indexUrl = conf.indexUrl);
  conf.defaultParams && (routeConfig.defaultParams = conf.defaultParams);
}