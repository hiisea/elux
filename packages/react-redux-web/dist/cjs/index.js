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

var _core = require("@elux/core");

var _reactComponents = require("@elux/react-components");

exports.loadComponent = _reactComponents.loadComponent;
exports.DocumentHead = _reactComponents.DocumentHead;
exports.Switch = _reactComponents.Switch;
exports.Else = _reactComponents.Else;
exports.Link = _reactComponents.Link;

var _stage = require("@elux/react-components/stage");

var _app = require("@elux/app");

Object.keys(_app).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _app[key]) return;
  exports[key] = _app[key];
});

var _routeBrowser = require("@elux/route-browser");

var _reactRedux = require("@elux/react-redux");

Object.keys(_reactRedux).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactRedux[key]) return;
  exports[key] = _reactRedux[key];
});
(0, _app.setAppConfig)({
  loadComponent: _reactComponents.loadComponent,
  useRouter: _reactComponents.useRouter,
  useStore: _reactRedux.useStore
});
(0, _reactComponents.setReactComponentsConfig)({
  Provider: _reactRedux.Provider,
  useStore: _reactRedux.useStore
});

function setConfig(conf) {
  (0, _reactComponents.setReactComponentsConfig)(conf);
  (0, _app.setUserConfig)(conf);
}

var createApp = function createApp(moduleGetter, storeMiddlewares, storeLogger) {
  (0, _core.defineModuleGetter)(moduleGetter);
  var history = (0, _routeBrowser.createBrowserHistory)();
  var router = (0, _routeBrowser.createRouter)(history, {});
  return (0, _app.createBaseApp)({}, router, _stage.renderToDocument, function (data) {
    return data;
  }, storeMiddlewares, storeLogger);
};

exports.createApp = createApp;

var createSSR = function createSSR(moduleGetter, url, nativeData, storeMiddlewares, storeLogger) {
  (0, _core.defineModuleGetter)(moduleGetter);
  var history = (0, _routeBrowser.createServerHistory)(url);
  var router = (0, _routeBrowser.createRouter)(history, nativeData);
  return (0, _app.createBaseSSR)({}, router, _stage.renderToString, function (data) {
    return data;
  }, storeMiddlewares, storeLogger);
};

exports.createSSR = createSSR;