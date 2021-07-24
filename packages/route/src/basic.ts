import {buildConfigSetter} from '@elux/core';
export interface RouteConfig {
  actionMaxHistory: number;
  pagesMaxHistory: number;

  disableNativeRoute: boolean;
  indexUrl: string;
  defaultParams: Record<string, any>;
}
export const routeConfig: RouteConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  disableNativeRoute: false,
  indexUrl: '',
  defaultParams: {},
};

export const setRouteConfig = buildConfigSetter(routeConfig);

export const routeMeta: {pagenames: Record<string, string>} = {} as any;

export type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';

export type ModuleParams = Record<string, any>;
export type RootParams = Record<string, ModuleParams>;

export interface Location<P extends RootParams = {}> {
  pagename: string;
  params: Partial<P>;
}
export interface PayloadLocation<P extends RootParams = {}, N extends string = string> {
  pathname?: N;
  params?: DeepPartial<P>;
  extendParams?: DeepPartial<P> | 'current';
}

export type RouteState<P extends RootParams = {}> = Location<P> & {
  action: HistoryAction;
  key: string;
};

export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

export interface PartialLocation {
  pagename: string;
  params: Record<string, any>;
}
export interface EluxLocation {
  pathname: string;
  params: Record<string, any>;
}
export interface NativeLocation {
  pathname: string;
  searchData?: Record<string, string>;
  hashData?: Record<string, string>;
}
