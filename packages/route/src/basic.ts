import {Action, RouteAction, Location, coreConfig, buildConfigSetter} from '@elux/core';

export function urlToLocation(url: string): Location {
  const [path = '', search = '', hash = ''] = url.split(/[?#]/);
  //const pathname = ('/' + path.split('//').pop()).replace(/\/(\/|$)/, '');
  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {parse} = routeConfig.QueryString;
  const searchQuery = parse(search);
  const hashQuery = parse(hash);
  return {url: `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`, pathname, search, hash, searchQuery, hashQuery};
}

export function locationToUrl({url, pathname, search, hash, searchQuery, hashQuery}: Partial<Location>): string {
  if (url) {
    [pathname, search, hash] = url.split(/[?#]/);
  }
  //pathname = ('/' + (pathname || '').split('//').pop()).replace(/\/(\/|$)/, '');
  pathname = '/' + (pathname || '').replace(/^\/|\/$/g, '');
  const {stringify} = routeConfig.QueryString;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';
  return `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
}

export function toNativeLocation(location: Location): Location {
  const pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return {...location, pathname, url};
}

export function toEluxLocation(location: Location): Location {
  const pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return {...location, pathname, url};
}

export function testChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${coreConfig.AppModuleName}${coreConfig.NSP}testRouteChange`,
    payload: [location, routeAction],
  };
}
export function beforeChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${coreConfig.AppModuleName}${coreConfig.NSP}beforeRouteChange`,
    payload: [location, routeAction],
  };
}
export function afterChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${coreConfig.AppModuleName}${coreConfig.NSP}afterRouteChange`,
    payload: [location, routeAction],
  };
}
export interface RouteConfig {
  NotifyNativeRouter: {
    window: boolean;
    page: boolean;
  };
  QueryString: {
    parse(str: string): {[key: string]: any};
    stringify(query: {[key: string]: any}): string;
  };
  HomeUrl: string;
  NativePathnameMapping: {
    in(pathname: string): string;
    out(pathname: string): string;
  };
}
export const routeConfig: RouteConfig = {
  /**
   * 实际上只支持三种组合：[false,false],[true,true],[true,false]
   * 否则back时可以出错
   */
  NotifyNativeRouter: {
    window: true,
    page: false,
  },
  HomeUrl: '/',
  QueryString: {
    parse: (str: string) => ({}),
    stringify: () => '',
  },
  NativePathnameMapping: {
    in: (pathname: string) => (pathname === '/' ? routeConfig.HomeUrl : pathname),
    out: (pathname: string) => (pathname === routeConfig.HomeUrl ? '/' : pathname),
  },
};

export const setRouteConfig = buildConfigSetter(routeConfig);
