import env from './env';
import { buildConfigSetter, deepMerge } from './utils';
export function isEluxComponent(data) {
  return data['__elux_component__'];
}
export var MetaData = {
  moduleApiMap: null,
  moduleCaches: {},
  componentCaches: {},
  reducersMap: {},
  effectsMap: {},
  clientRouter: undefined,
  AppProvider: undefined
};
export var coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  StageModuleName: 'stage',
  StageViewName: 'main',
  SSRDataKey: 'eluxSSRData',
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
  ModuleGetter: {},
  StoreInitState: function StoreInitState() {
    return {};
  },
  StoreMiddlewares: [],
  StoreLogger: function StoreLogger() {
    return undefined;
  },
  SetPageTitle: function SetPageTitle(title) {
    if (env.document) {
      env.document.title = title;
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
export var setCoreConfig = buildConfigSetter(coreConfig);
export function deepMergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (coreConfig.MutableData) {
    return deepMerge.apply(void 0, [target].concat(args));
  }

  return deepMerge.apply(void 0, [{}, target].concat(args));
}
export function mergeState(target) {
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
export function getClientRouter() {
  return MetaData.clientRouter;
}