"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.coreConfig = exports.MetaData = exports.ErrorCodes = void 0;
exports.deepMergeState = deepMergeState;
exports.getClientRouter = getClientRouter;
exports.isEluxComponent = isEluxComponent;
exports.mergeState = mergeState;
exports.setCoreConfig = void 0;

var _env = _interopRequireDefault(require("./env"));

var _utils = require("./utils");

var ErrorCodes = {
  INIT_ERROR: 'ELUX.INIT_ERROR',
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW'
};
exports.ErrorCodes = ErrorCodes;

function isEluxComponent(data) {
  return data['__elux_component__'];
}

var MetaData = {
  moduleApiMap: null,
  moduleCaches: {},
  componentCaches: {},
  reducersMap: {},
  effectsMap: {},
  clientRouter: undefined
};
exports.MetaData = MetaData;
var coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  AppModuleName: 'app',
  StageModuleName: 'stage',
  StageViewName: 'main',
  SSRDataKey: 'eluxSSRData',
  SSRTPL: _env.default.isServer ? _env.default.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
  ModuleGetter: {},
  StoreInitState: function StoreInitState() {
    return {};
  },
  StoreMiddlewares: [],
  StoreLogger: function StoreLogger() {
    return undefined;
  },
  SetPageTitle: function SetPageTitle(title) {
    if (_env.default.document) {
      _env.default.document.title = title;
    }
  },
  StoreProvider: undefined,
  LoadComponent: undefined,
  LoadComponentOnError: undefined,
  LoadComponentOnLoading: undefined,
  UseRouter: undefined,
  UseStore: undefined,
  AppRender: undefined
};
exports.coreConfig = coreConfig;
var setCoreConfig = (0, _utils.buildConfigSetter)(coreConfig);
exports.setCoreConfig = setCoreConfig;

function deepMergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (coreConfig.MutableData) {
    return _utils.deepMerge.apply(void 0, [target].concat(args));
  }

  return _utils.deepMerge.apply(void 0, [{}, target].concat(args));
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

function getClientRouter() {
  return MetaData.clientRouter;
}