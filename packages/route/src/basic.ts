import {buildConfigSetter, env, RootState, DeepPartial} from '@elux/core';

/*** @public */
export interface EluxLocation<P extends RootState = RootState> {
  pathmatch: string;
  args: DeepPartial<P>;
}

/*** @public */
export interface NativeLocation {
  pathname: string;
  query: string;
}

/*** @public */
export interface StateLocation<P extends RootState = RootState, N extends string = string> {
  pagename: N;
  payload: DeepPartial<P>;
}

/*** @public */
export interface NativeLocationMap {
  in(nativeLocation: NativeLocation): EluxLocation;
  out(eluxLocation: EluxLocation): NativeLocation;
}

/*** @public */
export type PagenameMap<P extends string = string> = {
  [K in P]: {
    argsToParams(pathArgs: Array<string | undefined>): Record<string, any>;
    paramsToArgs(params: Record<string, any>): Array<string | undefined>; // TODO vue下类型推导出错？paramsToArgs(params: Record<string, any>): Array<any>;
    pageData?: any;
  };
};
export interface RouteConfig {
  //RouteModuleName: string;
  maxHistory: number;
  maxLocationCache: number;
  notifyNativeRouter: {
    root: boolean;
    internal: boolean;
  };
  indexUrl: string;
  notfoundPagename: string;
  paramsKey: string;
}
export const routeConfig: RouteConfig = {
  //RouteModuleName: 'route',
  maxHistory: 10,
  maxLocationCache: env.isServer ? 10000 : 500,
  notifyNativeRouter: {
    root: true,
    internal: false,
  },
  indexUrl: '/index',
  notfoundPagename: '/404',
  paramsKey: '_',
};

export const setRouteConfig = buildConfigSetter(routeConfig);

export const routeMeta: {
  defaultParams: Record<string, any>;
  pageDatas: Record<string, any>;
  pagenameMap: Record<string, any>;
  pagenameList: string[];
  nativeLocationMap: NativeLocationMap;
} = {
  defaultParams: {},
  pageDatas: {},
  pagenameMap: {},
  pagenameList: [],
  nativeLocationMap: {} as any,
};

/*** @public */
export function safeJsonParse(json: string): Record<string, any> {
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
