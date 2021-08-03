"use strict";

exports.__esModule = true;
var _exportNames = {
  Page: true,
  setConfig: true,
  createApp: true,
  createSSR: true
};
exports.setConfig = setConfig;
exports.createSSR = exports.createApp = exports.Page = void 0;

var _reactComponents = require("@elux/react-components");

Object.keys(_reactComponents).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactComponents[key]) return;
  exports[key] = _reactComponents[key];
});

var _stage = require("@elux/react-components/stage");

exports.Page = _stage.Page;

var _app = require("@elux/app");

Object.keys(_app).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _app[key]) return;
  exports[key] = _app[key];
});

var _routeBrowser = require("@elux/route-browser");

(0, _app.setAppConfig)({
  loadComponent: _reactComponents.loadComponent
});

function setConfig(conf) {
  (0, _reactComponents.setReactComponentsConfig)(conf);
  (0, _app.setUserConfig)(conf);
}

var createApp = function createApp(moduleGetter, middlewares, appModuleName) {
  return (0, _app.createBaseApp)({}, function (locationTransform) {
    return (0, _routeBrowser.createRouter)('Browser', locationTransform);
  }, _stage.renderToDocument, moduleGetter, middlewares, appModuleName);
};

exports.createApp = createApp;

var createSSR = function createSSR(moduleGetter, url, middlewares, appModuleName) {
  return (0, _app.createBaseSSR)({}, function (locationTransform) {
    return (0, _routeBrowser.createRouter)(url, locationTransform);
  }, _stage.renderToString, moduleGetter, middlewares, appModuleName);
};

exports.createSSR = createSSR;