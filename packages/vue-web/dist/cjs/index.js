"use strict";

exports.__esModule = true;
var _exportNames = {
  setConfig: true,
  createApp: true,
  createSSR: true
};
exports.setConfig = setConfig;
exports.createSSR = exports.createApp = void 0;

var _vue = require("vue");

var _core = require("@elux/core");

var _vueComponents = require("@elux/vue-components");

Object.keys(_vueComponents).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _vueComponents[key]) return;
  exports[key] = _vueComponents[key];
});

var _stage = require("@elux/vue-components/stage");

var _app = require("@elux/app");

Object.keys(_app).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _app[key]) return;
  exports[key] = _app[key];
});

var _routeBrowser = require("@elux/route-browser");

(0, _core.setCoreConfig)({
  MutableData: true
});
(0, _app.setAppConfig)({
  loadComponent: _vueComponents.loadComponent
});

function setConfig(conf) {
  (0, _vueComponents.setVueComponentsConfig)(conf);
  (0, _app.setUserConfig)(conf);
}

var createApp = function createApp(moduleGetter, middlewares, appModuleName) {
  var app = (0, _vue.createApp)(_stage.RootComponent);
  return (0, _app.createBaseApp)(app, function (locationTransform) {
    return (0, _routeBrowser.createRouter)('Browser', locationTransform);
  }, _stage.renderToDocument, moduleGetter, middlewares, appModuleName);
};

exports.createApp = createApp;

var createSSR = function createSSR(moduleGetter, url, middlewares, appModuleName) {
  var app = (0, _vue.createSSRApp)(_stage.RootComponent);
  return (0, _app.createBaseSSR)(app, function (locationTransform) {
    return (0, _routeBrowser.createRouter)(url, locationTransform);
  }, _stage.renderToString, moduleGetter, middlewares, appModuleName);
};

exports.createSSR = createSSR;