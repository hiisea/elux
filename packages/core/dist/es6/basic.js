import env from './env';
import { buildConfigSetter, deepMerge } from './utils';
export function isEluxComponent(data) {
  return data['__elux_component__'];
}
export const MetaData = {
  moduleApiMap: null,
  moduleCaches: {},
  componentCaches: {},
  reducersMap: {},
  effectsMap: {},
  clientRouter: undefined
};
export const coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 1,
  StageModuleName: 'stage',
  StageViewName: 'main',
  SSRDataKey: 'eluxSSRData',
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
  ModuleGetter: {},
  StoreInitState: () => ({}),
  StoreMiddlewares: [],
  StoreLogger: () => undefined,
  SetPageTitle: title => {
    if (env.document) {
      env.document.title = title;
    }
  },
  Platform: '',
  StoreProvider: undefined,
  LoadComponent: undefined,
  LoadComponentOnError: undefined,
  LoadComponentOnLoading: undefined,
  UseRouter: undefined,
  UseStore: undefined,
  AppRender: undefined
};
export const setCoreConfig = buildConfigSetter(coreConfig);
export function deepMergeState(target = {}, ...args) {
  if (coreConfig.MutableData) {
    return deepMerge(target, ...args);
  }

  return deepMerge({}, target, ...args);
}
export function mergeState(target = {}, ...args) {
  if (coreConfig.MutableData) {
    return Object.assign(target, ...args);
  }

  return Object.assign({}, target, ...args);
}
export function getClientRouter() {
  return MetaData.clientRouter;
}