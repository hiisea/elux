import {buildConfigSetter, env} from '@elux/core';

/*** @public */
export type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';

/*** @public */
export type RootParams = Record<string, any>;

/*** @public */
export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

/*** @public */
export interface EluxLocation<P extends RootParams = any> {
  pathmatch: string;
  args: DeepPartial<P>;
}

/*** @public */
export interface NativeLocation {
  pathname: string;
  query: string;
}

/*** @public */
export interface StateLocation<P extends RootParams = any, N extends string = string> {
  pagename: N;
  payload: DeepPartial<P>;
}

/*** @public */
export interface LocationState<P extends RootParams = any> {
  pagename: string;
  params: Partial<P>;
}

/*** @public */
export interface RouteState<P extends RootParams = any> {
  action: HistoryAction;
  key: string;
  pagename: string;
  params: Partial<P>;
}

/*** @internal */
export interface NativeLocationMap {
  in(nativeLocation: NativeLocation): EluxLocation;
  out(eluxLocation: EluxLocation): NativeLocation;
}

/*** @internal */
export interface PagenameMap {
  [pageName: string]: {
    argsToParams(pathArgs: Array<string | undefined>): Record<string, any>;
    paramsToArgs: Function; // TODO vue下类型推导出错？paramsToArgs(params: Record<string, any>): Array<any>;
    page?: any;
  };
}
export interface RouteConfig {
  RouteModuleName: string;
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
  RouteModuleName: 'route',
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
  pagenames: Record<string, string>;
  defaultParams: Record<string, any>;
  pages: Record<string, any>;
  pagenameMap: Record<string, any>;
  pagenameList: string[];
  nativeLocationMap: NativeLocationMap;
} = {
  defaultParams: {},
  pagenames: {},
  pages: {},
  pagenameMap: {},
  pagenameList: [],
  nativeLocationMap: {} as any,
};

/*** @internal */
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
