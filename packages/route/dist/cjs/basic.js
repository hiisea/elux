"use strict";

exports.__esModule = true;
exports.routeMeta = exports.setRouteConfig = exports.routeConfig = void 0;

var _core = require("@elux/core");

var routeConfig = {
  maxHistory: 10,
  notifyNativeRouter: {
    root: true,
    internal: false
  },
  indexUrl: ''
};
exports.routeConfig = routeConfig;
var setRouteConfig = (0, _core.buildConfigSetter)(routeConfig);
exports.setRouteConfig = setRouteConfig;
var routeMeta = {
  defaultParams: {},
  pagenames: {},
  pages: {}
};
exports.routeMeta = routeMeta;