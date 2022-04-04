"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.toPromise = exports.setProcessedError = exports.setLoading = exports.setCoreConfig = exports.reducer = exports.modelHotReplacement = exports.isServer = exports.isPromise = exports.injectComponent = exports.getModuleApiMap = exports.getEntryComponent = exports.getComponent = exports.getClientRouter = exports.getApi = exports.exportView = exports.exportModule = exports.exportComponent = exports.errorAction = exports.env = exports.effectLogger = exports.effect = exports.deepMerge = exports.deepClone = exports.coreConfig = exports.buildSSR = exports.buildConfigSetter = exports.buildApp = exports.Store = exports.EmptyModel = exports.CoreRouter = exports.BaseModel = void 0;

var _env = _interopRequireDefault(require("./env"));

exports.env = _env.default;

var _utils = require("./utils");

exports.isPromise = _utils.isPromise;
exports.isServer = _utils.isServer;
exports.buildConfigSetter = _utils.buildConfigSetter;
exports.deepClone = _utils.deepClone;
exports.toPromise = _utils.toPromise;
exports.deepMerge = _utils.deepMerge;

var _basic = require("./basic");

exports.coreConfig = _basic.coreConfig;
exports.setCoreConfig = _basic.setCoreConfig;
exports.getClientRouter = _basic.getClientRouter;

var _actions = require("./actions");

exports.errorAction = _actions.errorAction;
exports.setProcessedError = _actions.setProcessedError;

var _inject = require("./inject");

exports.getComponent = _inject.getComponent;
exports.getEntryComponent = _inject.getEntryComponent;
exports.getModuleApiMap = _inject.getModuleApiMap;
exports.injectComponent = _inject.injectComponent;

var _module = require("./module");

exports.setLoading = _module.setLoading;
exports.exportView = _module.exportView;
exports.exportComponent = _module.exportComponent;
exports.effect = _module.effect;
exports.reducer = _module.reducer;
exports.effectLogger = _module.effectLogger;
exports.EmptyModel = _module.EmptyModel;

var _store = require("./store");

exports.CoreRouter = _store.CoreRouter;
exports.Store = _store.Store;
exports.modelHotReplacement = _store.modelHotReplacement;

var _facade = require("./facade");

exports.exportModule = _facade.exportModule;
exports.getApi = _facade.getApi;
exports.BaseModel = _facade.BaseModel;

var _app = require("./app");

exports.buildApp = _app.buildApp;
exports.buildSSR = _app.buildSSR;