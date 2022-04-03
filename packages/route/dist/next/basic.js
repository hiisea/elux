import { coreConfig, buildConfigSetter } from '@elux/core';
export function urlToLocation(url) {
  const [path = '', search = '', hash = ''] = url.split(/[?#]/);
  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {
    parse
  } = routeConfig.QueryString;
  const searchQuery = parse(search);
  const hashQuery = parse(hash);
  return {
    url: `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`,
    pathname,
    search,
    hash,
    searchQuery,
    hashQuery
  };
}
export function locationToUrl({
  url,
  pathname,
  search,
  hash,
  searchQuery,
  hashQuery
}) {
  if (url) {
    [pathname, search, hash] = url.split(/[?#]/);
  }

  pathname = '/' + (pathname || '').replace(/^\/|\/$/g, '');
  const {
    stringify
  } = routeConfig.QueryString;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';
  return `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
}
export function toNativeLocation(location) {
  const pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return { ...location,
    pathname,
    url
  };
}
export function toEluxLocation(location) {
  const pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return { ...location,
    pathname,
    url
  };
}
export function testChangeAction(location, routeAction) {
  return {
    type: `${coreConfig.AppModuleName}${coreConfig.NSP}testRouteChange`,
    payload: [location, routeAction]
  };
}
export function beforeChangeAction(location, routeAction) {
  return {
    type: `${coreConfig.AppModuleName}${coreConfig.NSP}beforeRouteChange`,
    payload: [location, routeAction]
  };
}
export function afterChangeAction(location, routeAction) {
  return {
    type: `${coreConfig.AppModuleName}${coreConfig.NSP}afterRouteChange`,
    payload: [location, routeAction]
  };
}
export const routeConfig = {
  NotifyNativeRouter: {
    window: true,
    page: false
  },
  HomeUrl: '/',
  QueryString: {
    parse: str => ({}),
    stringify: () => ''
  },
  NativePathnameMapping: {
    in: pathname => pathname === '/' ? routeConfig.HomeUrl : pathname,
    out: pathname => pathname === routeConfig.HomeUrl ? '/' : pathname
  }
};
export const setRouteConfig = buildConfigSetter(routeConfig);