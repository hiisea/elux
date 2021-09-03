import {deepMerge, env, getModuleList, moduleExists, isPromise} from '@elux/core';
import {extendDefault, excludeDefault, splitPrivate} from './deep-extend';
import {routeMeta, EluxLocation, PartialLocationState, LocationState, RootParams, NativeLocation} from './basic';

export interface LocationTransform {
  eluxLocationToPartialLocationState(eluxLocation: EluxLocation): PartialLocationState;
  partialLocationStateToEluxLocation(partialLocationState: PartialLocationState): EluxLocation;
  nativeLocationToPartialLocationState(nativeLocation: NativeLocation): PartialLocationState;
  partialLocationStateToNativeLocation(partialLocationState: PartialLocationState): NativeLocation;
  eluxLocationToNativeLocation(eluxLocation: EluxLocation): NativeLocation;
  nativeLocationToEluxLocation(nativeLocation: NativeLocation): EluxLocation;
  eluxUrlToEluxLocation(eluxUrl: string): EluxLocation;
  eluxLocationToEluxUrl(location: EluxLocation): string;
  nativeUrlToNativeLocation(nativeUrl: string): NativeLocation;
  nativeLocationToNativeUrl(location: NativeLocation): string;
  eluxUrlToNativeUrl(eluxUrl: string): string;
  nativeUrlToEluxUrl(nativeUrl: string): string;
  partialLocationStateToLocationState<P extends RootParams>(partialLocationState: PartialLocationState): LocationState<P> | Promise<LocationState<P>>;
  partialLocationStateToMinData(
    partialLocationState: PartialLocationState
  ): {pathname: string; params: Record<string, any>; pathParams: Record<string, any>};
  payloadToPartialLocationState(payload: {
    params?: Record<string, any>;
    extendParams?: Record<string, any>;
    pagename?: string;
    pathname?: string;
  }): PartialLocationState;
}

export interface PagenameMap {
  [pageName: string]: {
    argsToParams(pathArgs: Array<string | undefined>): Record<string, any>;
    paramsToArgs: Function; // TODO vue下类型推导出错？paramsToArgs(params: Record<string, any>): Array<any>;
    page?: any;
  };
}

export type NativeLocationMap = {
  in(nativeLocation: NativeLocation): NativeLocation;
  out(nativeLocation: NativeLocation): NativeLocation;
};
export function assignDefaultData(data: {[moduleName: string]: any}): {[moduleName: string]: any} {
  const def = routeMeta.defaultParams;
  return Object.keys(data).reduce((params, moduleName) => {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }
    return params;
  }, {});
}

function splitQuery(query: string): Record<string, string> | undefined {
  if (!query) {
    return undefined;
  }
  return query.split('&').reduce((params, str) => {
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
      const {argsToParams, paramsToArgs, page} = pagenameMap[pagename];
      map[fullPagename] = {argsToParams, paramsToArgs};
      routeMeta.pagenames[pagename] = pagename;
      routeMeta.pages[pagename] = page;
      return map;
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
    eluxLocationToPartialLocationState(eluxLocation) {
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
      const modules = moduleExists();
      Object.keys(params).forEach((moduleName) => {
        if (!modules[moduleName]) {
          delete params[moduleName];
        }
      });
      return {pagename: `/${pagename.replace(/^\/+|\/+$/g, '')}`, params};
    },
    partialLocationStateToEluxLocation(partialLocation) {
      const {pathname, params} = this.partialLocationStateToMinData(partialLocation);
      return {pathname, params};
    },
    nativeLocationToPartialLocationState(nativeLocation) {
      const eluxLocation = this.nativeLocationToEluxLocation(nativeLocation);
      return this.eluxLocationToPartialLocationState(eluxLocation);
    },
    partialLocationStateToNativeLocation(partialLocation) {
      const {pathname, params, pathParams} = this.partialLocationStateToMinData(partialLocation);
      const result = splitPrivate(params, pathParams);
      const nativeLocation = {
        pathname,
        searchData: result[0] ? {[paramsKey]: JSON.stringify(result[0])} : undefined,
        hashData: result[1] ? {[paramsKey]: JSON.stringify(result[1])} : undefined,
      };
      return nativeLocationMap.out(nativeLocation);
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
      return {pathname: nativeLocation.pathname, params: deepMerge(searchParams, hashParams) || {}};
    },
    eluxUrlToEluxLocation,
    eluxLocationToEluxUrl,
    nativeUrlToNativeLocation,
    nativeLocationToNativeUrl,
    eluxUrlToNativeUrl(eluxUrl) {
      const eluxLocation = this.eluxUrlToEluxLocation(eluxUrl);
      return nativeLocationToNativeUrl(this.eluxLocationToNativeLocation(eluxLocation));
    },
    nativeUrlToEluxUrl(nativeUrl) {
      const nativeLocation = this.nativeUrlToNativeLocation(nativeUrl);
      return eluxLocationToEluxUrl(this.nativeLocationToEluxLocation(nativeLocation));
    },
    partialLocationStateToLocationState<P extends RootParams>(
      partialLocationState: PartialLocationState
    ): LocationState<P> | Promise<LocationState<P>> {
      const {pagename, params} = partialLocationState;
      const def = routeMeta.defaultParams;
      const asyncLoadModules = Object.keys(params).filter((moduleName) => def[moduleName] === undefined);
      const modulesOrPromise = getModuleList(asyncLoadModules);
      if (isPromise(modulesOrPromise)) {
        return modulesOrPromise.then((modules) => {
          modules.forEach((module) => {
            def[module.moduleName] = module.params;
          });
          return {pagename, params: assignDefaultData(params) as P};
        });
      }
      const modules = modulesOrPromise;
      modules.forEach((module) => {
        def[module.moduleName] = module.params;
      });
      return {pagename, params: assignDefaultData(params) as P};
    },
    partialLocationStateToMinData(partialLocationState) {
      let params = excludeDefault(partialLocationState.params, routeMeta.defaultParams, true);
      let pathParams: Record<string, any>;
      let pathname: string;
      const pagename = `/${partialLocationState.pagename}/`.replace(/^\/+|\/+$/g, '/');
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
    payloadToPartialLocationState(payload) {
      const {params, extendParams, pagename, pathname} = payload;
      let newParams: Record<string, any>;
      if (extendParams && params) {
        newParams = deepMerge({}, extendParams, params);
      } else {
        newParams = extendParams || {};
      }
      if (pathname) {
        return this.eluxLocationToPartialLocationState({pathname, params: newParams});
      } else {
        return {pagename: pagename || '/', params: newParams};
      }
    },
  };
}
