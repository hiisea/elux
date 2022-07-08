import { buildConfigSetter, coreConfig } from '@elux/core';
export const ErrorCodes = {
  ROUTE_RETURN: 'ELIX.ROUTE_RETURN',
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW'
};
export function nativeUrlToUrl(nativeUrl) {
  const [path = '', search = '', hash = ''] = nativeUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}
export function urlToNativeUrl(eluxUrl) {
  const [path = '', search = '', hash = ''] = eluxUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}
export function urlToLocation(url, state) {
  const [path = '', query = '', hash = ''] = url.split(/[?#]/);
  const arr = `?${query}`.match(/[?&]__c=([^&]*)/) || ['', ''];
  const classname = arr[1];
  let search = `?${query}`.replace(/[?&]__c=[^&]*/g, '').substr(1);
  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {
    parse
  } = routeConfig.QueryString;
  const searchQuery = parse(search);
  const hashQuery = parse(hash);

  if (classname) {
    search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
  }

  return {
    url: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`,
    pathname,
    search,
    hash,
    classname,
    searchQuery,
    hashQuery,
    state
  };
}
export function mergeDefaultClassname(url, defClassname) {
  if (!defClassname) {
    return url;
  }

  const [path = '', query = '', hash = ''] = url.split(/[?#]/);

  if (/[?&]__c=/.test(`?${query}`)) {
    return url;
  }

  const search = query ? `${query}&__c=${defClassname}` : `__c=${defClassname}`;
  return `${path}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
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
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';

  if (typeof classname === 'string') {
    search = `?${search}`.replace(/[?&]__c=[^&]*/g, '').substr(1);

    if (classname) {
      search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
    }
  }

  url = `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
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
  QueryString: {
    parse: str => ({}),
    stringify: () => ''
  },
  NativePathnameMapping: {
    in: pathname => pathname,
    out: pathname => pathname
  }
};
export const setRouteConfig = buildConfigSetter(routeConfig);