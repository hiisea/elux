"use strict";

exports.__esModule = true;
exports.routeMeta = exports.routeConfig = void 0;
exports.safeJsonParse = safeJsonParse;
exports.setRouteConfig = void 0;

var _core = require("@elux/core");

var routeConfig = {
  RouteModuleName: 'route',
  maxHistory: 10,
  maxLocationCache: _core.env.isServer ? 10000 : 500,
  notifyNativeRouter: {
    root: true,
    internal: false
  },
  indexUrl: '/index',
  notfoundPagename: '/404',
  paramsKey: '_'
};
exports.routeConfig = routeConfig;
var setRouteConfig = (0, _core.buildConfigSetter)(routeConfig);
exports.setRouteConfig = setRouteConfig;
var routeMeta = {
  defaultParams: {},
  pagenames: {},
  pages: {},
  pagenameMap: {},
  pagenameList: [],
  nativeLocationMap: {}
};
exports.routeMeta = routeMeta;

function safeJsonParse(json) {
  if (!json || json === '{}' || json.charAt(0) !== '{' || json.charAt(json.length - 1) !== '}') {
    return {};
  }

  var args = {};

  try {
    args = JSON.parse(json);
  } catch (error) {
    args = {};
  }

  return args;
}