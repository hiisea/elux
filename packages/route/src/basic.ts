import {buildConfigSetter} from '@elux/core';
export interface RouteConfig {
  RouteModuleName: string;
  maxHistory: number;
  notifyNativeRouter: {
    root: boolean;
    internal: boolean;
  };
  indexUrl: string;
}
export const routeConfig: RouteConfig = {
  RouteModuleName: 'route',
  maxHistory: 10,
  notifyNativeRouter: {
    root: true,
    internal: false,
  },
  indexUrl: '/index',
};

export const setRouteConfig = buildConfigSetter(routeConfig);

export const routeMeta: {pagenames: Record<string, string>; defaultParams: Record<string, any>; pages: Record<string, any>} = {
  defaultParams: {},
  pagenames: {},
  pages: {},
};

export type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';

export type RootParams = Record<string, any>;

export interface EluxLocation {
  pathname: string;
  params: Record<string, any>;
}
export interface NativeLocation {
  pathname: string;
  searchData?: Record<string, string>;
  hashData?: Record<string, string>;
}

export interface PayloadData<P extends RootParams = {}, N extends string = string> {
  pagename?: N;
  pathname?: string;
  params?: DeepPartial<P>;
  extendParams?: DeepPartial<P> | 'current';
}

export interface LocationState<P extends RootParams = {}> {
  pagename: string;
  params: Partial<P>;
}

export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

export interface PartialLocationState {
  pagename: string;
  params: Record<string, any>;
}

export type RouteState<P extends RootParams = any> = LocationState<P> & {
  action: HistoryAction;
  key: string;
};
