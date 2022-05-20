import { buildConfigSetter, coreConfig } from '@elux/core';
export const ErrorCodes = {
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW'
};
export function nativeUrlToUrl(nativeUrl) {
  const [path = '', search = '', hash = ''] = nativeUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
}
export function urlToNativeUrl(eluxUrl) {
  const [path = '', search = '', hash = ''] = eluxUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
}
export function urlToLocation(url) {
  const [path = '', query = '', hash = ''] = url.split(/[?#]/);
  const arr = `?${query}`.match(/(.*)[?&]__c=([^&]+)(.*$)/);
  let search = query;
  let classname = '';

  if (arr) {
    classname = arr[2];
    search = (arr[1] + arr[3]).substr(1);
  }

  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {
    parse
  } = routeConfig.QueryString;
  const searchQuery = parse(search);
  const hashQuery = parse(hash);
  return {
    url: `${pathname}${query ? '?' + query : ''}${hash ? '#' + hash : ''}`,
    pathname,
    search,
    hash,
    classname,
    searchQuery,
    hashQuery
  };
}
export function locationToUrl({
  url,
  pathname,
  search,
  hash,
  classname,
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

  if (classname) {
    search = `?${search}`.replace(/[?&]__c=[^&]+/, '').substr(1);
    search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
  }

  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';
  url = `${pathname}${search ? '?' + search : ''}${hash ? '#' + hash : ''}`;
  return url;
}
export function locationToNativeLocation(location) {
  const pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return { ...location,
    pathname,
    url
  };
}
export function nativeLocationToLocation(location) {
  const pathname = routeConfig.NativePathnameMapping.in(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return { ...location,
    pathname,
    url
  };
}
export function testChangeAction(location, routeAction) {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_testRouteChange`,
    payload: [location, routeAction]
  };
}
export function beforeChangeAction(location, routeAction) {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_beforeRouteChange`,
    payload: [location, routeAction]
  };
}
export function afterChangeAction(location, routeAction) {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_afterRouteChange`,
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
    out: pathname => pathname
  }
};
export const setRouteConfig = buildConfigSetter(routeConfig);