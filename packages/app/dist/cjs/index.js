"use strict";

exports.__esModule = true;
exports.modelHotReplacement = exports.locationToUrl = exports.isServer = exports.getApi = exports.exportView = exports.exportModule = exports.exportComponent = exports.errorAction = exports.env = exports.effectLogger = exports.effect = exports.deepMerge = exports.ErrorCodes = exports.EmptyModel = exports.BaseModel = void 0;
exports.patchActions = patchActions;
exports.reducer = void 0;
exports.setConfig = setConfig;
exports.urlToLocation = exports.toNativeLocation = exports.toEluxLocation = exports.setLoading = void 0;

var _core = require("@elux/core");

exports.errorAction = _core.errorAction;
exports.env = _core.env;
exports.effect = _core.effect;
exports.reducer = _core.reducer;
exports.setLoading = _core.setLoading;
exports.effectLogger = _core.effectLogger;
exports.isServer = _core.isServer;
exports.deepMerge = _core.deepMerge;
exports.exportModule = _core.exportModule;
exports.exportView = _core.exportView;
exports.exportComponent = _core.exportComponent;
exports.modelHotReplacement = _core.modelHotReplacement;
exports.getApi = _core.getApi;
exports.EmptyModel = _core.EmptyModel;
exports.BaseModel = _core.BaseModel;
exports.ErrorCodes = _core.ErrorCodes;

var _route = require("@elux/route");

exports.locationToUrl = _route.locationToUrl;
exports.urlToLocation = _route.urlToLocation;
exports.toNativeLocation = _route.toNativeLocation;
exports.toEluxLocation = _route.toEluxLocation;
var appConfig = Symbol();

function setConfig(conf) {
  (0, _core.setCoreConfig)(conf);
  (0, _route.setRouteConfig)(conf);

  if (conf.DisableNativeRouter) {
    (0, _route.setRouteConfig)({
      NotifyNativeRouter: {
        window: false,
        page: false
      }
    });
  }

  return appConfig;
}

function patchActions(typeName, json) {
  if (json) {
    (0, _core.getModuleApiMap)(JSON.parse(json));
  }
}