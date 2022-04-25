import { getModuleApiMap, setCoreConfig } from '@elux/core';
import { setRouteConfig } from '@elux/route';
export { BaseModel, deepMerge, effect, effectLogger, EmptyModel, env, errorAction, exportComponent, exportModule, exportView, getApi, getComponent, getModule, injectModule, isServer, modelHotReplacement, reducer, setLoading } from '@elux/core';
export { ErrorCodes, locationToNativeLocation, locationToUrl, nativeLocationToLocation, nativeUrlToUrl, urlToLocation, urlToNativeUrl } from '@elux/route';
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