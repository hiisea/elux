import { getModuleApiMap, setCoreConfig } from '@elux/core';
export { BaseModel, deepMerge, effect, effectLogger, EmptyModel, env, errorAction, exportComponent, exportModule, exportView, getApi, getTplInSSR, injectModule, isServer, modelHotReplacement, moduleExists, reducer, setLoading, ErrorCodes, locationToNativeLocation, locationToUrl, nativeLocationToLocation, nativeUrlToUrl, urlToLocation, urlToNativeUrl } from '@elux/core';
const appConfig = Symbol();
export function setConfig(conf) {
  setCoreConfig(conf);

  if (conf.DisableNativeRouter) {
    setCoreConfig({
      NotifyNativeRouter: {
        window: false,
        page: false
      }
    });
  }

  return appConfig;
}
export function patchActions(typeName, json) {
  if (json) {
    getModuleApiMap(JSON.parse(json));
  }
}