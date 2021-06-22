import {deepMerge, getCachedModules, env, isPromise} from '@elux/core';
import {extendDefault, excludeDefault, splitPrivate} from './deep-extend';
import {routeConfig, EluxLocation, DeepPartial, RouteState} from './basic';

export function getDefaultParams(): Record<string, any> {
  if (routeConfig.defaultParams) {
    return routeConfig.defaultParams;
  }
  const modules = getCachedModules();
  return Object.keys(modules).reduce((data, moduleName) => {
    const result = modules[moduleName];
    if(result && !isPromise(result)){
      data[moduleName] = result.default.params;
    }
    return data;
  }, {});
}
export interface NativeLocation {
  pathname: string;
  searchData?: Record<string, string>;
  hashData?: Record<string, string>;
}

export type LocationTransform = {
  in: (nativeLocation: NativeLocation | EluxLocation) => EluxLocation;
  out: (eluxLocation: EluxLocation) => NativeLocation;
};

export type PagenameMap<P> = Record<
  string,
  {
    argsToParams(pathArgs: Array<string | undefined>): DeepPartial<P>;
    paramsToArgs(params: DeepPartial<P>): Array<any>;
  }
>;
export type NativeLocationMap = {
  in(nativeLocation: NativeLocation): NativeLocation;
  out(nativeLocation: NativeLocation): NativeLocation;
};
export function assignDefaultData(data: {[moduleName: string]: any}): {[moduleName: string]: any} {
  const def = getDefaultParams();
  return Object.keys(data).reduce((params, moduleName) => {
    // eslint-disable-next-line no-prototype-builtins
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }
    return params;
  }, {});
}

export function dataIsNativeLocation(data: any): data is NativeLocation {
  return data['pathname'];
}

export function createLocationTransform(
  pagenameMap: PagenameMap<any>,
  nativeLocationMap: NativeLocationMap,
  notfoundPagename: string = '/404',
  paramsKey: string = '_'
): LocationTransform {
  let pagenames = Object.keys(pagenameMap);
  pagenameMap = pagenames
    .sort((a, b) => b.length - a.length)
    .reduce((map, pagename) => {
      const fullPagename = `/${pagename}/`.replace(/^\/+|\/+$/g, '/');
      map[fullPagename] = pagenameMap[pagename];
      return map;
    }, {});
  routeConfig.pagenames = pagenames.reduce((obj, key) => {
    obj[key] = key;
    return obj;
  }, {});
  pagenames = Object.keys(pagenameMap);

  function toStringArgs(arr: any[]): Array<string | undefined> {
    return arr.map((item) => {
      if (item === null || item === undefined) {
        return undefined;
      }
      return item.toString();
    });
  }
  return {
    in(data) {
      let path: string;
      if (dataIsNativeLocation(data)) {
        data = nativeLocationMap.in(data);
        path = data.pathname;
      } else {
        path = data.pagename;
      }
      path = `/${path}/`.replace(/^\/+|\/+$/g, '/');
      let pagename = pagenames.find((name) => path.startsWith(name));
      let params: Record<string, any>;
      if (pagename) {
        if (dataIsNativeLocation(data)) {
          const searchParams = data.searchData && data.searchData[paramsKey] ? JSON.parse(data.searchData[paramsKey]) : undefined;
          const hashParams = data.hashData && data.hashData[paramsKey] ? JSON.parse(data.hashData[paramsKey]) : undefined;
          const pathArgs: Array<string | undefined> = path
            .replace(pagename, '')
            .split('/')
            .map((item) => (item ? decodeURIComponent(item) : undefined));
          const pathParams = pagenameMap[pagename].argsToParams(pathArgs);
          params = deepMerge(pathParams, searchParams, hashParams);
        } else {
          const pathParams = pagenameMap[pagename].argsToParams([]);
          params = deepMerge(pathParams, data.params);
        }
      } else {
        pagename = `${notfoundPagename}/`;
        params = pagenameMap[pagename] ? pagenameMap[pagename].argsToParams([path.replace(/\/$/, '')]) : {};
      }
      return {pagename: `/${pagename.replace(/^\/+|\/+$/g, '')}`, params};
    },
    out(eluxLocation): NativeLocation {
      let params = excludeDefault(eluxLocation.params, getDefaultParams(), true);
      const pagename = `/${eluxLocation.pagename}/`.replace(/^\/+|\/+$/g, '/');
      let pathParams: Record<string, any>;
      let pathname: string;
      if (pagenameMap[pagename]) {
        const pathArgs = toStringArgs(pagenameMap[pagename].paramsToArgs(params));
        pathParams = pagenameMap[pagename].argsToParams(pathArgs);
        pathname =
          pagename +
          pathArgs
            .map((item) => item && encodeURIComponent(item))
            .join('/')
            .replace(/\/*$/, '');
      } else {
        pathParams = {};
        pathname = pagename;
      }
      params = excludeDefault(params, pathParams, false);
      const result = splitPrivate(params, pathParams);
      const nativeLocation = {
        pathname: `/${pathname.replace(/^\/+|\/+$/g, '')}`,
        searchData: result[0] ? {[paramsKey]: JSON.stringify(result[0])} : undefined,
        hashData: result[1] ? {[paramsKey]: JSON.stringify(result[1])} : undefined,
      };
      return nativeLocationMap.out(nativeLocation);
    },
  };
}

export function nativeLocationToEluxLocation(nativeLocation: NativeLocation, locationTransform: LocationTransform): EluxLocation {
  let eluxLocation: EluxLocation;
  try {
    eluxLocation = locationTransform.in(nativeLocation);
  } catch (error) {
    env.console.warn(error);
    eluxLocation = {pagename: '/', params: {}};
  }
  return eluxLocation;
}
function splitQuery(query: string): Record<string, string> | undefined {
  return (query || '').split('&').reduce((params, str) => {
    const sections = str.split('=');
    if (sections.length > 1) {
      const [key, ...arr] = sections;
      if (!params) {
        params = {};
      }
      params[key] = decodeURIComponent(arr.join('='));
    }
    return params;
  }, undefined as any);
}
export function nativeUrlToNativeLocation(url: string): NativeLocation {
  if (!url) {
    return {
      pathname: '/',
      searchData: undefined,
      hashData: undefined,
    };
  }
  const arr = url.split(/[?#]/);
  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }
  const [path, search, hash] = arr;
  return {
    pathname: `/${path.replace(/^\/+|\/+$/g, '')}`,
    searchData: splitQuery(search),
    hashData: splitQuery(hash),
  };
}

export function nativeUrlToEluxLocation(nativeUrl: string, locationTransform: LocationTransform): EluxLocation {
  return nativeLocationToEluxLocation(nativeUrlToNativeLocation(nativeUrl), locationTransform);
}

function joinQuery(params: Record<string, string> | undefined): string {
  return Object.keys(params || {})
    .map((key) => `${key}=${encodeURIComponent((params as any)[key])}`)
    .join('&');
}

export function nativeLocationToNativeUrl({pathname, searchData, hashData}: NativeLocation): string {
  const search = joinQuery(searchData);
  const hash = joinQuery(hashData);
  return [`/${pathname.replace(/^\/+|\/+$/g, '')}`, search && `?${search}`, hash && `#${hash}`].join('');
}

export function eluxLocationToNativeUrl(location: EluxLocation, locationTransform: LocationTransform): string {
  const nativeLocation = locationTransform.out(location);
  return nativeLocationToNativeUrl(nativeLocation);
}

export function eluxLocationToEluxUrl(location: EluxLocation): string {
  return [location.pagename, JSON.stringify(location.params || {})].join('?');
}

export function urlToEluxLocation(url: string, locationTransform: LocationTransform): EluxLocation {
  const [pathname, ...others] = url.split('?');
  const query = others.join('?');
  let location: EluxLocation;
  try {
    if (query.startsWith('{')) {
      const data = JSON.parse(query);
      location = locationTransform.in({pagename: pathname, params: data});
    } else {
      const nativeLocation = nativeUrlToNativeLocation(url);
      location = locationTransform.in(nativeLocation);
    }
  } catch (error) {
    env.console.warn(error);
    location = {pagename: '/', params: {}};
  }
  return location;
}

export function payloadToEluxLocation(
  payload: {
    pagename?: string;
    params?: Record<string, any>;
    extendParams?: Record<string, any> | 'current';
  },
  curRouteState: RouteState
): EluxLocation {
  let params = payload.params;
  const extendParams = payload.extendParams === 'current' ? curRouteState.params : payload.extendParams;
  if (extendParams && params) {
    params = deepMerge({}, extendParams, params);
  } else if (extendParams) {
    params = extendParams;
  }
  return {pagename: payload.pagename || curRouteState.pagename, params: params || {}};
}
