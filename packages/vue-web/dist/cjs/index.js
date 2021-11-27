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
exports.createSSR = exports.createApp = exports.Switch = exports.Link = exports.Else = exports.DocumentHead = void 0;
exports.setConfig = setConfig;

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
  (0, _core.defineModuleGetter)(moduleGetter);
  var app = (0, _vue.createApp)(_stage.Router);
  var history = (0, _routeBrowser.createBrowserHistory)();
  var router = (0, _routeBrowser.createRouter)(history, {});
  return (0, _app.createBaseApp)(app, router, _stage.renderToDocument, middlewares);
};

exports.createApp = createApp;

var createSSR = function createSSR(moduleGetter, url, nativeData, middlewares) {
  (0, _core.defineModuleGetter)(moduleGetter);
  var app = (0, _vue.createSSRApp)(_stage.Router);
  var history = (0, _routeBrowser.createServerHistory)(url);
  var router = (0, _routeBrowser.createRouter)(history, nativeData);
  return (0, _app.createBaseSSR)(app, router, _stage.renderToString, middlewares);
};

exports.createSSR = createSSR;