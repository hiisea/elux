"use strict";

exports.__esModule = true;
var _exportNames = {
  DocumentHead: true,
  Switch: true,
  Else: true,
  Link: true,
  errorAction: true,
  LoadingState: true,
  env: true,
  effect: true,
  reducer: true,
  setLoading: true,
  effectLogger: true,
  isServer: true,
  deepMerge: true,
  exportModule: true,
  exportView: true,
  exportComponent: true,
  modelHotReplacement: true,
  EmptyModel: true,
  BaseModel: true,
  RouteModel: true,
  loadModel: true,
  getModule: true,
  getComponent: true,
  location: true,
  createRouteModule: true,
  safeJsonParse: true,
  getApi: true,
  patchActions: true,
  setConfig: true,
  createApp: true,
  createSSR: true
};
exports.safeJsonParse = exports.reducer = exports.patchActions = exports.modelHotReplacement = exports.location = exports.loadModel = exports.isServer = exports.getModule = exports.getComponent = exports.getApi = exports.exportView = exports.exportModule = exports.exportComponent = exports.errorAction = exports.env = exports.effectLogger = exports.effect = exports.deepMerge = exports.createSSR = exports.createRouteModule = exports.createApp = exports.Switch = exports.RouteModel = exports.LoadingState = exports.Link = exports.EmptyModel = exports.Else = exports.DocumentHead = exports.BaseModel = void 0;
exports.setConfig = setConfig;
exports.setLoading = void 0;

var _core = require("@elux/core");

exports.errorAction = _core.errorAction;
exports.LoadingState = _core.LoadingState;
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
exports.EmptyModel = _core.EmptyModel;
exports.BaseModel = _core.BaseModel;
exports.RouteModel = _core.RouteModel;
exports.loadModel = _core.loadModel;
exports.getModule = _core.getModule;
exports.getComponent = _core.getComponent;

var _reactComponents = require("@elux/react-components");

exports.DocumentHead = _reactComponents.DocumentHead;
exports.Switch = _reactComponents.Switch;
exports.Else = _reactComponents.Else;
exports.Link = _reactComponents.Link;

var _stage = require("@elux/react-components/stage");

var _app = require("@elux/app");

exports.getApi = _app.getApi;
exports.patchActions = _app.patchActions;

var _routeBrowser = require("@elux/route-browser");

var _reactRedux = require("@elux/react-redux");

Object.keys(_reactRedux).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _reactRedux[key]) return;
  exports[key] = _reactRedux[key];
});

var _route = require("@elux/route");

exports.location = _route.location;
exports.createRouteModule = _route.createRouteModule;
exports.safeJsonParse = _route.safeJsonParse;
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