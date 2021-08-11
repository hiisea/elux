"use strict";

exports.__esModule = true;
exports.buildConfigSetter = buildConfigSetter;
exports.isEluxComponent = isEluxComponent;
exports.moduleExists = moduleExists;
exports.deepMergeState = deepMergeState;
exports.mergeState = mergeState;
exports.MetaData = exports.setCoreConfig = exports.coreConfig = void 0;

var _sprite = require("./sprite");

var coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  RouteModuleName: 'route',
  AppModuleName: 'stage'
};
exports.coreConfig = coreConfig;

function buildConfigSetter(data) {
  return function (config) {
    return Object.keys(data).forEach(function (key) {
      config[key] !== undefined && (data[key] = config[key]);
    });
  };
}

var setCoreConfig = buildConfigSetter(coreConfig);
exports.setCoreConfig = setCoreConfig;

function isEluxComponent(data) {
  return data['__elux_component__'];
}

var MetaData = {
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  facadeMap: null,
  moduleGetter: null,
  moduleExists: null,
  currentRouter: null
};
exports.MetaData = MetaData;

function moduleExists() {
  return MetaData.moduleExists;
}

function deepMergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (coreConfig.MutableData) {
    return _sprite.deepMerge.apply(void 0, [target].concat(args));
  }

  return _sprite.deepMerge.apply(void 0, [{}, target].concat(args));
}

function mergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  if (coreConfig.MutableData) {
    return Object.assign.apply(Object, [target].concat(args));
  }

  return Object.assign.apply(Object, [{}, target].concat(args));
}