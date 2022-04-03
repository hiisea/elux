import { setCoreConfig, getModuleApiMap } from '@elux/core';
import { setRouteConfig } from '@elux/route';
export { errorAction, env, effect, reducer, setLoading, effectLogger, isServer, deepMerge, exportModule, exportView, exportComponent, modelHotReplacement, getApi, EmptyModel, BaseModel, ErrorCodes } from '@elux/core';
export { locationToUrl, urlToLocation, toNativeLocation, toEluxLocation } from '@elux/route';
const appConfig = Symbol();
export function setConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);

  if (conf.DisableNativeRouter) {
    setRouteConfig({
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