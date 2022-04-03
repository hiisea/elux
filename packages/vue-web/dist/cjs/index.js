"use strict";

exports.__esModule = true;
var _exportNames = {
  DocumentHead: true,
  Switch: true,
  Else: true,
  Link: true,
  createApp: true,
  createSSR: true
};
exports.Switch = exports.Link = exports.Else = exports.DocumentHead = void 0;
exports.createApp = createApp;
exports.createSSR = createSSR;

var _vue = require("vue");

var _core = require("@elux/core");

var _routeBrowser = require("@elux/route-browser");

var _vueComponents = require("@elux/vue-components");

exports.DocumentHead = _vueComponents.DocumentHead;
exports.Switch = _vueComponents.Switch;
exports.Else = _vueComponents.Else;
exports.Link = _vueComponents.Link;

var _app = require("@elux/app");

Object.keys(_app).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _app[key]) return;
  exports[key] = _app[key];
});

function createApp(appConfig) {
  var router = (0, _routeBrowser.createClientRouter)();
  var app = (0, _vue.createApp)(_vueComponents.RouterComponent);
  return (0, _core.buildApp)(app, router);
}

function createSSR(appConfig, url, nativeData) {
  var router = (0, _routeBrowser.createServerRouter)(url, nativeData);
  var app = (0, _vue.createSSRApp)(_vueComponents.RouterComponent);
  return (0, _core.buildSSR)(app, router);
}