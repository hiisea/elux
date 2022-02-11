import { buildConfigSetter, env } from '@elux/core';
export const routeConfig = {
  maxHistory: 10,
  maxLocationCache: env.isServer ? 10000 : 500,
  notifyNativeRouter: {
    root: true,
    internal: false
  },
  indexUrl: '/index',
  notfoundPagename: '/404',
  paramsKey: '_'
};
export const setRouteConfig = buildConfigSetter(routeConfig);
export const routeMeta = {
  defaultParams: {},
  pageDatas: {},
  pagenameMap: {},
  pagenameList: [],
  nativeLocationMap: {}
};
export function safeJsonParse(json) {
  if (!json || json === '{}' || json.charAt(0) !== '{' || json.charAt(json.length - 1) !== '}') {
    return {};
  }

  let args = {};

  try {
    args = JSON.parse(json);
  } catch (error) {
    args = {};
  }

  return args;
}