import {Action, RouteAction, Location, coreConfig, buildConfigSetter} from '@elux/core';

export const ErrorCodes = {
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW',
};

export function nativeUrlToUrl(nativeUrl: string): string {
  const [path = '', search = '', hash = ''] = nativeUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
}

export function urlToNativeUrl(eluxUrl: string): string {
  const [path = '', search = '', hash = ''] = eluxUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
}

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

export function locationToNativeLocation(location: Location): Location {
  const pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return {...location, pathname, url};
}

export function nativeLocationToLocation(location: Location): Location {
  const pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return {...location, pathname, url};
}

export function testChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_testRouteChange`,
    payload: [location, routeAction],
  };
}
export function beforeChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_beforeRouteChange`,
    payload: [location, routeAction],
  };
}
export function afterChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_afterRouteChange`,
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
