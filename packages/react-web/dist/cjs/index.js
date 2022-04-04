"use strict";

exports.__esModule = true;
var _exportNames = {
  DocumentHead: true,
  Switch: true,
  Else: true,
  Link: true,
  connectRedux: true,
  shallowEqual: true,
  useSelector: true,
  createSelectorHook: true,
  createApp: true,
  createSSR: true
};
exports.connectRedux = exports.Switch = exports.Link = exports.Else = exports.DocumentHead = void 0;
exports.createApp = createApp;
exports.createSSR = createSSR;
exports.useSelector = exports.shallowEqual = exports.createSelectorHook = void 0;

var _core = require("@elux/core");

var _routeBrowser = require("@elux/route-browser");

var _reactComponents = require("@elux/react-components");

exports.DocumentHead = _reactComponents.DocumentHead;
exports.Switch = _reactComponents.Switch;
exports.Else = _reactComponents.Else;
exports.Link = _reactComponents.Link;

var _reactRedux = require("@elux/react-redux");

exports.connectRedux = _reactRedux.connectRedux;
exports.shallowEqual = _reactRedux.shallowEqual;
exports.useSelector = _reactRedux.useSelector;
exports.createSelectorHook = _reactRedux.createSelectorHook;

var _app = require("@elux/app");

Object.keys(_app).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _app[key]) return;
  exports[key] = _app[key];
});

function createApp(appConfig) {
  var router = (0, _routeBrowser.createClientRouter)();
  return (0, _core.buildApp)({}, router);
}

function createSSR(appConfig, nativeRequest) {
  var router = (0, _routeBrowser.createServerRouter)(nativeRequest);
  return (0, _core.buildSSR)({}, router);
}