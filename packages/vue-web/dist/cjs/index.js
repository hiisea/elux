"use strict";

exports.__esModule = true;
var _exportNames = {
  DocumentHead: true,
  Switch: true,
  Else: true,
  Link: true,
  setConfig: true,
  createApp: true,
  createSSR: true,
  loadComponent: true
};
exports.setConfig = setConfig;
exports.createSSR = exports.createApp = exports.Link = exports.Else = exports.Switch = exports.DocumentHead = void 0;

var _vue = require("vue");

var _core = require("@elux/core");

var _vueComponents = require("@elux/vue-components");

exports.loadComponent = _vueComponents.loadComponent;
exports.DocumentHead = _vueComponents.DocumentHead;
exports.Switch = _vueComponents.Switch;
exports.Else = _vueComponents.Else;
exports.Link = _vueComponents.Link;

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
  loadComponent: _vueComponents.loadComponent,
  useRouter: _vueComponents.useRouter,
  useStore: _vueComponents.useStore
});

function setConfig(conf) {
  (0, _vueComponents.setVueComponentsConfig)(conf);
  (0, _app.setUserConfig)(conf);
}

var createApp = function createApp(moduleGetter, middlewares) {
  var url = [location.pathname, location.search, location.hash].join('');
  var app = (0, _vue.createApp)(_stage.Router);
  return (0, _app.createBaseApp)(app, function (locationTransform) {
    return (0, _routeBrowser.createRouter)(url, locationTransform, {});
  }, _stage.renderToDocument, moduleGetter, middlewares);
};

exports.createApp = createApp;

var createSSR = function createSSR(moduleGetter, url, nativeData, middlewares) {
  var app = (0, _vue.createSSRApp)(_stage.Router);
  return (0, _app.createBaseSSR)(app, function (locationTransform) {
    return (0, _routeBrowser.createRouter)(url, locationTransform, nativeData);
  }, _stage.renderToString, moduleGetter, middlewares);
};

exports.createSSR = createSSR;