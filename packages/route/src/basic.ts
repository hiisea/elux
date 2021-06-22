export interface RouteConfig {
  actionMaxHistory: number;
  pagesMaxHistory: number;
  pagenames: Record<string, string>;
  disableNativeRoute: boolean;
  indexUrl: string;
  defaultParams: null | Record<string, any>;
}
export const routeConfig: RouteConfig = {
  actionMaxHistory: 10,
  pagesMaxHistory: 10,
  pagenames: {},
  disableNativeRoute: false,
  indexUrl: '',
  defaultParams: null,
};

export function setRouteConfig(conf: {
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  indexUrl?: string;
  disableNativeRoute?: boolean;
  defaultParams?: Record<string, any>;
}) {
  conf.actionMaxHistory && (routeConfig.actionMaxHistory = conf.actionMaxHistory);
  conf.pagesMaxHistory && (routeConfig.pagesMaxHistory = conf.pagesMaxHistory);
  conf.disableNativeRoute && (routeConfig.disableNativeRoute = true);
  conf.indexUrl && (routeConfig.indexUrl = conf.indexUrl);
  conf.defaultParams && (routeConfig.defaultParams = conf.defaultParams);
}

export type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';

export type ModuleParams = Record<string, any>;
export type RootParams = Record<string, ModuleParams>;

export interface Location<P extends RootParams = {}> {
  pagename: string;
  params: Partial<P>;
}
export interface PayloadLocation<P extends RootParams = {}, N extends string = string> {
  pagename?: N;
  params?: DeepPartial<P>;
  extendParams?: DeepPartial<P> | 'current';
}
export interface PartialLocation<P extends RootParams = {}> {
  pagename: string;
  params: DeepPartial<P>;
}

export type RouteState<P extends RootParams = {}> = Location<P> & {
  action: HistoryAction;
  key: string;
};

export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};

export interface EluxLocation {
  pagename: string;
  params: unknown;
}
