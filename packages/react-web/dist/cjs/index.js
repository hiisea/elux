"use strict";

exports.__esModule = true;
exports.connectRedux = exports.Switch = exports.LoadingState = exports.Link = exports.EmptyModel = exports.Else = exports.DocumentHead = exports.BaseModel = void 0;
exports.createApp = createApp;
exports.createRouteModule = void 0;
exports.createSSR = createSSR;
exports.routeJsonParse = exports.reducer = exports.modelHotReplacement = exports.location = exports.loadModel = exports.isServer = exports.getModule = exports.getComponent = exports.getApi = exports.exportView = exports.exportModule = exports.exportComponent = exports.errorAction = exports.env = exports.effectLogger = exports.effect = exports.deepMerge = exports.createSelectorHook = void 0;
exports.setConfig = setConfig;
exports.useSelector = exports.shallowEqual = exports.setLoading = void 0;

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

var _routeBrowser = require("@elux/route-browser");

var _reactRedux = require("@elux/react-redux");

exports.connectRedux = _reactRedux.connectRedux;
exports.shallowEqual = _reactRedux.shallowEqual;
exports.useSelector = _reactRedux.useSelector;
exports.createSelectorHook = _reactRedux.createSelectorHook;

var _route = require("@elux/route");

exports.location = _route.location;
exports.createRouteModule = _route.createRouteModule;
exports.routeJsonParse = _route.routeJsonParse;
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

function createApp(moduleGetter, storeMiddlewares, storeLogger) {
  (0, _core.defineModuleGetter)(moduleGetter);
  var history = (0, _routeBrowser.createBrowserHistory)();
  var router = (0, _routeBrowser.createRouter)(history, {});
  return (0, _app.createBaseApp)({}, router, _stage.renderToDocument, function (data) {
    return data;
  }, storeMiddlewares, storeLogger);
}

function createSSR(moduleGetter, url, nativeData, storeMiddlewares, storeLogger) {
  (0, _core.defineModuleGetter)(moduleGetter);
  var history = (0, _routeBrowser.createServerHistory)(url);
  var router = (0, _routeBrowser.createRouter)(history, nativeData);
  return (0, _app.createBaseSSR)({}, router, _stage.renderToString, function (data) {
    return data;
  }, storeMiddlewares, storeLogger);
}