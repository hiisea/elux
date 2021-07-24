"use strict";

exports.__esModule = true;
exports.routeMeta = exports.setRouteConfig = exports.routeConfig = void 0;

var _core = require("@elux/core");

var routeConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  disableNativeRoute: false,
  indexUrl: '',
  defaultParams: {}
};
exports.routeConfig = routeConfig;
var setRouteConfig = (0, _core.buildConfigSetter)(routeConfig);
exports.setRouteConfig = setRouteConfig;
var routeMeta = {};
exports.routeMeta = routeMeta;