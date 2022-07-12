import {Action, buildConfigSetter, coreConfig, Location, RouteAction} from '@elux/core';

/**
 * 内置ErrorCode
 *
 * @public
 */
export const ErrorCodes = {
  /**
   * 在路由被强制中断并返回时抛出该错误
   */
  ROUTE_RETURN: 'ELIX.ROUTE_RETURN',
  /**
   * 在SSR服务器渲染时，操作路由跳转会抛出该错误
   */
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  /**
   * 在路由后退时，如果步数溢出则抛出该错误
   */
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW',
};

/**
 * 原生路由Url转换为内部路由Url
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export function nativeUrlToUrl(nativeUrl: string): string {
  const [path = '', search = '', hash = ''] = nativeUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}

/**
 * 内部路由Url转换为原生路由Url
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export function urlToNativeUrl(eluxUrl: string): string {
  const [path = '', search = '', hash = ''] = eluxUrl.split(/[?#]/);
  const pathname = routeConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}

/**
 * Url转换为Location
 *
 * @public
 */
export function urlToLocation(url: string, state: any): Location {
  const [path = '', query = '', hash = ''] = url.split(/[?#]/);
  const arr = `?${query}`.match(/[?&]__c=([^&]*)/) || ['', ''];
  const classname = arr[1];
  let search = `?${query}`.replace(/[?&]__c=[^&]*/g, '').substr(1);
  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {parse} = routeConfig.QueryString;
  const searchQuery = parse(search);
  const hashQuery = parse(hash);
  if (classname) {
    search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
  }
  return {url: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`, pathname, search, hash, classname, searchQuery, hashQuery, state};
}

/**
 * Location转换为Url
 *
 * @public
 */
export function locationToUrl({url, pathname, search, hash, classname, searchQuery, hashQuery}: Partial<Location>, defClassname?: string): string {
  if (url) {
    [pathname, search, hash] = url.split(/[?#]/);
  }
  pathname = '/' + (pathname || '').replace(/^\/|\/$/g, '');
  const {stringify} = routeConfig.QueryString;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';
  if (!/[?&]__c=/.test(`?${search}`) && defClassname && classname === undefined) {
    classname = defClassname;
  }
  if (typeof classname === 'string') {
    search = `?${search}`.replace(/[?&]__c=[^&]*/g, '').substr(1);
    if (classname) {
      search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
    }
  }
  url = `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
  return url;
}

/**
 * 内部路由Location转换为原生路由Location
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export function locationToNativeLocation(location: Location): Location {
  const pathname = routeConfig.NativePathnameMapping.out(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return {...location, pathname, url};
}

/**
 * 原生路由Location转换为内部路由Location
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
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
  NativePathnameMapping: {
    in(nativePathname: string): string;
    out(internalPathname: string): string;
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
  QueryString: {
    parse: (str: string) => ({}),
    stringify: () => '',
  },
  NativePathnameMapping: {
    in: (pathname: string) => pathname,
    out: (pathname: string) => pathname,
  },
};

export const setRouteConfig = buildConfigSetter(routeConfig);
