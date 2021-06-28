import {deepMerge, getCachedModules, env, isPromise, getModuleList} from '@elux/core';
import {extendDefault, excludeDefault, splitPrivate} from './deep-extend';
import {routeConfig, EluxLocation, DeepPartial, PartialLocation, RouteState, Location, RootParams} from './basic';

function getDefaultParams(moduleNames: string[]): Record<string, any> {
  const defaultParams = routeConfig.defaultParams;
  const modules = getCachedModules();
  return moduleNames.reduce((data, moduleName) => {
    if (defaultParams[moduleName] !== undefined) {
      data[moduleName] = defaultParams[moduleName];
    } else {
      const result = modules[moduleName];
      if (result && !isPromise(result)) {
        defaultParams[moduleName] = result.params;
        data[moduleName] = result.params;
      }
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
  urlToEluxLocation: (url: string) => EluxLocation;
  nativeUrlToEluxLocation: (nativeUrl: string) => EluxLocation;
  nativeLocationToEluxLocation: (nativeLocation: NativeLocation) => EluxLocation;
  eluxLocationtoPartialLocation: (eluxLocation: EluxLocation) => PartialLocation;
  partialLocationToLocation: <P extends RootParams>(partialLocation: PartialLocation) => Location<P> | Promise<Location<P>>;
  eluxLocationtoLocation: <P extends RootParams>(eluxLocation: EluxLocation) => Location<P> | Promise<Location<P>>;
  locationToMinData: (location: Location) => {pathname: string; params: Record<string, any>; pathParams: Record<string, any>};
  locationtoNativeLocation: (location: Location) => NativeLocation;
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
  const moduleNames = Object.keys(data);
  const def = getDefaultParams(moduleNames);
  return moduleNames.reduce((params, moduleName) => {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }
    return params;
  }, {});
}

// export function dataIsNativeLocation(data: any): data is NativeLocation {
//   return data['pathname'];
// }

// export function nativeLocationToEluxLocation(nativeLocation: NativeLocation): EluxLocation {
//   let eluxLocation: EluxLocation;
//   try {
//     eluxLocation = locationTransform.in(nativeLocation);
//   } catch (error) {
//     env.console.warn(error);
//     eluxLocation = {pagename: '/', params: {}};
//   }
//   return eluxLocation;
// }
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
export function eluxUrlToEluxLocation(url: string): EluxLocation {
  if (!url) {
    return {
      pathname: '/',
      params: undefined,
    };
  }
  const [pathname, ...others] = url.split('?');
  const query = others.join('?');
  let params;
  if (query && query.charAt(0) === '{' && query.charAt(query.length - 1) === '}') {
    try {
      params = JSON.parse(query);
    } catch (e) {
      env.console.error(e);
    }
  }
  return {pathname: `/${pathname.replace(/^\/+|\/+$/g, '')}`, params};
}
// export function nativeUrlToEluxLocation(nativeUrl: string, locationTransform: LocationTransform): EluxLocation {
//   return nativeLocationToEluxLocation(nativeUrlToNativeLocation(nativeUrl), locationTransform);
// }

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

// export function eluxLocationToNativeUrl(location: EluxLocation, locationTransform: LocationTransform): string {
//   const nativeLocation = locationTransform.out(location);
//   return nativeLocationToNativeUrl(nativeLocation);
// }

export function eluxLocationToEluxUrl(location: EluxLocation): string {
  return [location.pathname, JSON.stringify(location.params || {})].join('?');
}

export function payloadToEluxLocation(
  payload: {
    pathname?: string;
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
  return {pathname: payload.pathname || curRouteState.pagename, params};
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
    urlToEluxLocation(url: string) {
      const [, query] = url.split('?', 2);
      if (query && query.charAt(0) === '{') {
        return eluxUrlToEluxLocation(url);
      }
      return this.nativeUrlToEluxLocation(url);
    },
    nativeUrlToEluxLocation(nativeUrl) {
      return this.nativeLocationToEluxLocation(nativeUrlToNativeLocation(nativeUrl));
    },
    nativeLocationToEluxLocation(nativeLocation) {
      nativeLocation = nativeLocationMap.in(nativeLocation);
      let searchParams;
      let hashParams;
      try {
        searchParams =
          nativeLocation.searchData && nativeLocation.searchData[paramsKey] ? JSON.parse(nativeLocation.searchData[paramsKey]) : undefined;
        hashParams = nativeLocation.hashData && nativeLocation.hashData[paramsKey] ? JSON.parse(nativeLocation.hashData[paramsKey]) : undefined;
      } catch (e) {
        env.console.error(e);
      }
      return {pathname: nativeLocation.pathname, params: deepMerge(searchParams, hashParams)};
    },

    eluxLocationtoPartialLocation(eluxLocation) {
      const pathname = `/${eluxLocation.pathname}/`.replace(/^\/+|\/+$/g, '/');
      let pagename = pagenames.find((name) => pathname.startsWith(name));
      let params: Record<string, any>;
      if (pagename) {
        const pathArgs: Array<string | undefined> = pathname
          .replace(pagename, '')
          .split('/')
          .map((item) => (item ? decodeURIComponent(item) : undefined));
        const pathParams = pagenameMap[pagename].argsToParams(pathArgs);
        params = deepMerge({}, pathParams, eluxLocation.params);
      } else {
        pagename = `${notfoundPagename}/`;
        params = {};
      }
      return {pagename: `/${pagename.replace(/^\/+|\/+$/g, '')}`, params};
    },
    partialLocationToLocation<P extends RootParams>(partialLocation: PartialLocation): Location<P> | Promise<Location<P>> {
      const {pagename, params} = partialLocation;
      if (routeConfig.defaultParams) {
        return {pagename, params: assignDefaultData(params) as P};
      }
      return getModuleList(Object.keys(params)).then(() => {
        return {pagename, params: assignDefaultData(params) as P};
      });
    },
    eluxLocationtoLocation<P extends RootParams>(eluxLocation: EluxLocation): Location<P> | Promise<Location<P>> {
      return this.partialLocationToLocation(this.eluxLocationtoPartialLocation(eluxLocation));
    },
    locationToMinData(location) {
      let params = excludeDefault(location.params, getDefaultParams(Object.keys(location.params)), true);
      let pathParams: Record<string, any>;
      let pathname: string;
      const pagename = `/${location.pagename}/`.replace(/^\/+|\/+$/g, '/');
      if (pagenameMap[pagename]) {
        const pathArgs = toStringArgs(pagenameMap[pagename].paramsToArgs(params));
        pathname =
          pagename +
          pathArgs
            .map((item) => (item ? encodeURIComponent(item) : ''))
            .join('/')
            .replace(/\/*$/, '');
        pathParams = pagenameMap[pagename].argsToParams(pathArgs);
      } else {
        pathname = pagename;
        pathParams = {};
      }
      params = excludeDefault(params, pathParams, false);
      return {pathname: `/${pathname.replace(/^\/+|\/+$/g, '')}`, params, pathParams};
    },
    locationtoNativeLocation(location) {
      const {pathname, params, pathParams} = this.locationToMinData(location);
      const result = splitPrivate(params as any, pathParams);
      const nativeLocation = {
        pathname,
        searchData: result[0] ? {[paramsKey]: JSON.stringify(result[0])} : undefined,
        hashData: result[1] ? {[paramsKey]: JSON.stringify(result[1])} : undefined,
      };
      return nativeLocationMap.out(nativeLocation);
    },
  };
}
