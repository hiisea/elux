"use strict";

exports.__esModule = true;
var _exportNames = {
  setConfig: true,
  createApp: true,
  createSSR: true
};
exports.setConfig = setConfig;
exports.createSSR = exports.createApp = void 0;

var _reactComponents = require("@elux/react-components");

Object.keys(_reactComponents).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactComponents[key]) return;
  exports[key] = _reactComponents[key];
});

var _stage = require("@elux/react-components/stage");

var _app = require("@elux/app");

Object.keys(_app).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _app[key]) return;
  exports[key] = _app[key];
});

var _routeBrowser = require("@elux/route-browser");

(0, _app.setAppConfig)({
  loadComponent: _reactComponents.loadComponent,
  useRouter: _reactComponents.useRouter
});

function setConfig(conf) {
  (0, _reactComponents.setReactComponentsConfig)(conf);
  (0, _app.setUserConfig)(conf);
}

var createApp = function createApp(moduleGetter, middlewares) {
  var url = [location.pathname, location.search, location.hash].join('');
  return (0, _app.createBaseApp)({}, function (locationTransform) {
    return (0, _routeBrowser.createRouter)(url, locationTransform, {});
  }, _stage.renderToDocument, moduleGetter, middlewares);
};

exports.createApp = createApp;

var createSSR = function createSSR(moduleGetter, url, nativeData, middlewares) {
  return (0, _app.createBaseSSR)({}, function (locationTransform) {
    return (0, _routeBrowser.createRouter)(url, locationTransform, nativeData);
  }, _stage.renderToString, moduleGetter, middlewares);
};

exports.createSSR = createSSR;