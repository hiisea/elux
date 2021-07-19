import {deepMerge, env, getModuleList, getModuleGetter} from '@elux/core';
import {extendDefault, excludeDefault, splitPrivate} from './deep-extend';
import {routeConfig, EluxLocation, PartialLocation, Location, RootParams, NativeLocation} from './basic';

export interface LocationTransform {
  eluxLocationToPartialLocation(eluxLocation: EluxLocation): PartialLocation; // E->L
  eluxLocationToLocation<P extends RootParams>(eluxLocation: EluxLocation): Promise<Location<P>>; // E->L
  eluxLocationToNativeLocation(eluxLocation: EluxLocation): NativeLocation; // E->N
  partialLocationToEluxLocation(partialLocation: PartialLocation): EluxLocation; // L->E
  partialLocationToNativeLocation(partialLocation: PartialLocation): NativeLocation; // L->N
  nativeLocationToEluxLocation(nativeLocation: NativeLocation): EluxLocation; // N->E
  nativeLocationToPartialLocation(nativeLocation: NativeLocation): PartialLocation; // N->L
  nativeLocationToLocation<P extends RootParams>(nativeLocation: NativeLocation): Promise<Location<P>>; // N->L
  urlToEluxLocation(url: string): EluxLocation; // U->E
  urlToToPartialLocation(url: string): PartialLocation; // U->L
  urlToLocation<P extends RootParams>(url: string): Promise<Location<P>>; // U->L
  urlToGivenLocation(url: string): NativeLocation | EluxLocation;
  partialLocationToLocation<P extends RootParams>(partialLocation: PartialLocation): Promise<Location<P>>;
  partialLocationToMinData(partialLocation: PartialLocation): {pathname: string; params: Record<string, any>; pathParams: Record<string, any>};
}

export interface PagenameMap {
  [pageName: string]: {
    argsToParams(pathArgs: Array<string | undefined>): Record<string, any>;
    paramsToArgs: Function; // TODO vue下类型推导出错？paramsToArgs(params: Record<string, any>): Array<any>;
  };
}

export type NativeLocationMap = {
  in(nativeLocation: NativeLocation): NativeLocation;
  out(nativeLocation: NativeLocation): NativeLocation;
};
export function assignDefaultData(data: {[moduleName: string]: any}): {[moduleName: string]: any} {
  const def = routeConfig.defaultParams;
  return Object.keys(data).reduce((params, moduleName) => {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }
    return params;
  }, {});
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

function joinQuery(params: Record<string, string> | undefined): string {
  return Object.keys(params || {})
    .map((key) => `${key}=${encodeURIComponent((params as any)[key])}`)
    .join('&');
}

function isEluxLocation(data: EluxLocation | NativeLocation): data is EluxLocation {
  return data['params'];
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
      params: {},
    };
  }
  const [pathname, ...others] = url.split('?');
  const query = others.join('?');
  let params = {};
  if (query && query.charAt(0) === '{' && query.charAt(query.length - 1) === '}') {
    try {
      params = JSON.parse(query);
    } catch (e) {
      env.console.error(e);
    }
  }
  return {pathname: `/${pathname.replace(/^\/+|\/+$/g, '')}`, params};
}
export function nativeLocationToNativeUrl({pathname, searchData, hashData}: NativeLocation): string {
  const search = joinQuery(searchData);
  const hash = joinQuery(hashData);
  return [`/${pathname.replace(/^\/+|\/+$/g, '')}`, search && `?${search}`, hash && `#${hash}`].join('');
}
export function eluxLocationToEluxUrl(location: EluxLocation): string {
  return [location.pathname, JSON.stringify(location.params || {})].join('?');
}
export function createLocationTransform(
  pagenameMap: PagenameMap,
  nativeLocationMap: NativeLocationMap,
  notfoundPagename = '/404',
  paramsKey = '_'
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
    urlToLocation<P extends RootParams>(url: string): Promise<Location<P>> {
      return this.partialLocationToLocation(this.urlToToPartialLocation(url));
    },
    urlToToPartialLocation(url) {
      const givenLocation = this.urlToGivenLocation(url);
      if (isEluxLocation(givenLocation)) {
        return this.eluxLocationToPartialLocation(givenLocation);
      }
      return this.nativeLocationToPartialLocation(givenLocation);
    },
    urlToEluxLocation(url) {
      const givenLocation = this.urlToGivenLocation(url);
      if (isEluxLocation(givenLocation)) {
        return givenLocation;
      }
      return this.nativeLocationToEluxLocation(givenLocation);
    },
    urlToGivenLocation(url) {
      const [, query] = url.split('?', 2);
      if (query && query.charAt(0) === '{') {
        return eluxUrlToEluxLocation(url);
      }
      return nativeUrlToNativeLocation(url);
    },
    nativeLocationToLocation<P extends RootParams>(nativeLocation: NativeLocation): Promise<Location<P>> {
      return this.partialLocationToLocation(this.nativeLocationToPartialLocation(nativeLocation));
    },
    nativeLocationToPartialLocation(nativeLocation) {
      const eluxLocation = this.nativeLocationToEluxLocation(nativeLocation);
      return this.eluxLocationToPartialLocation(eluxLocation);
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
    eluxLocationToNativeLocation(eluxLocation) {
      const pathname = `/${eluxLocation.pathname}/`.replace(/^\/+|\/+$/g, '/');
      let pagename = pagenames.find((name) => pathname.startsWith(name));
      let pathParams: Record<string, any> = {};
      if (pagename) {
        const pathArgs: Array<string | undefined> = pathname
          .replace(pagename, '')
          .split('/')
          .map((item) => (item ? decodeURIComponent(item) : undefined));
        pathParams = pagenameMap[pagename].argsToParams(pathArgs);
      } else {
        pagename = `${notfoundPagename}/`;
        if (pagenameMap[pagename]) {
          pathParams = pagenameMap[pagename].argsToParams([eluxLocation.pathname]);
        }
      }
      const result = splitPrivate(eluxLocation.params, pathParams);
      const nativeLocation = {
        pathname,
        searchData: result[0] ? {[paramsKey]: JSON.stringify(result[0])} : undefined,
        hashData: result[1] ? {[paramsKey]: JSON.stringify(result[1])} : undefined,
      };
      return nativeLocationMap.out(nativeLocation);
    },
    eluxLocationToPartialLocation(eluxLocation) {
      const pathname = `/${eluxLocation.pathname}/`.replace(/^\/+|\/+$/g, '/');
      let pagename = pagenames.find((name) => pathname.startsWith(name));
      let pathParams: Record<string, any> = {};
      if (pagename) {
        const pathArgs: Array<string | undefined> = pathname
          .replace(pagename, '')
          .split('/')
          .map((item) => (item ? decodeURIComponent(item) : undefined));
        pathParams = pagenameMap[pagename].argsToParams(pathArgs);
      } else {
        pagename = `${notfoundPagename}/`;
        if (pagenameMap[pagename]) {
          pathParams = pagenameMap[pagename].argsToParams([eluxLocation.pathname]);
        }
      }
      const params = deepMerge({}, pathParams, eluxLocation.params);
      const moduleGetter = getModuleGetter();
      Object.keys(params).forEach((moduleName) => {
        if (!moduleGetter[moduleName]) {
          delete params[moduleName];
        }
      });
      return {pagename: `/${pagename.replace(/^\/+|\/+$/g, '')}`, params};
    },
    partialLocationToLocation<P extends RootParams>(partialLocation: PartialLocation): Promise<Location<P>> {
      const {pagename, params} = partialLocation;
      const def = routeConfig.defaultParams;
      const asyncLoadModules = Object.keys(params).filter((moduleName) => def[moduleName] === undefined);
      return getModuleList(asyncLoadModules).then((modules) => {
        modules.forEach((module) => {
          def[module.moduleName] = module.params;
        });
        return {pagename, params: assignDefaultData(params) as P};
      });
    },
    eluxLocationToLocation<P extends RootParams>(eluxLocation: EluxLocation): Promise<Location<P>> {
      return this.partialLocationToLocation(this.eluxLocationToPartialLocation(eluxLocation));
    },
    partialLocationToMinData(partialLocation) {
      let params = excludeDefault(partialLocation.params, routeConfig.defaultParams, true);
      let pathParams: Record<string, any>;
      let pathname: string;
      const pagename = `/${partialLocation.pagename}/`.replace(/^\/+|\/+$/g, '/');
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
    partialLocationToEluxLocation(partialLocation) {
      const {pathname, params} = this.partialLocationToMinData(partialLocation);
      return {pathname, params};
    },
    partialLocationToNativeLocation(partialLocation) {
      const {pathname, params, pathParams} = this.partialLocationToMinData(partialLocation);
      const result = splitPrivate(params, pathParams);
      const nativeLocation = {
        pathname,
        searchData: result[0] ? {[paramsKey]: JSON.stringify(result[0])} : undefined,
        hashData: result[1] ? {[paramsKey]: JSON.stringify(result[1])} : undefined,
      };
      return nativeLocationMap.out(nativeLocation);
    },
  };
}
