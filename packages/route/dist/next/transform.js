import { deepMerge, getCachedModules, env, isPromise } from '@elux/core';
import { extendDefault, excludeDefault, splitPrivate } from './deep-extend';
import { routeConfig } from './basic';
export function getDefaultParams() {
  if (routeConfig.defaultParams) {
    return routeConfig.defaultParams;
  }

  const modules = getCachedModules();
  return Object.keys(modules).reduce((data, moduleName) => {
    const result = modules[moduleName];

    if (result && !isPromise(result)) {
      data[moduleName] = result.default.params;
    }

    return data;
  }, {});
}
export function assignDefaultData(data) {
  const def = getDefaultParams();
  return Object.keys(data).reduce((params, moduleName) => {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}
export function dataIsNativeLocation(data) {
  return data['pathname'];
}
export function createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename = '/404', paramsKey = '_') {
  let pagenames = Object.keys(pagenameMap);
  pagenameMap = pagenames.sort((a, b) => b.length - a.length).reduce((map, pagename) => {
    const fullPagename = `/${pagename}/`.replace(/^\/+|\/+$/g, '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  routeConfig.pagenames = pagenames.reduce((obj, key) => {
    obj[key] = key;
    return obj;
  }, {});
  pagenames = Object.keys(pagenameMap);

  function toStringArgs(arr) {
    return arr.map(item => {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  }

  return {
    in(data) {
      let path;

      if (dataIsNativeLocation(data)) {
        data = nativeLocationMap.in(data);
        path = data.pathname;
      } else {
        path = data.pagename;
      }

      path = `/${path}/`.replace(/^\/+|\/+$/g, '/');
      let pagename = pagenames.find(name => path.startsWith(name));
      let params;

      if (pagename) {
        if (dataIsNativeLocation(data)) {
          const searchParams = data.searchData && data.searchData[paramsKey] ? JSON.parse(data.searchData[paramsKey]) : undefined;
          const hashParams = data.hashData && data.hashData[paramsKey] ? JSON.parse(data.hashData[paramsKey]) : undefined;
          const pathArgs = path.replace(pagename, '').split('/').map(item => item ? decodeURIComponent(item) : undefined);
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

      return {
        pagename: `/${pagename.replace(/^\/+|\/+$/g, '')}`,
        params
      };
    },

    out(eluxLocation) {
      let params = excludeDefault(eluxLocation.params, getDefaultParams(), true);
      const pagename = `/${eluxLocation.pagename}/`.replace(/^\/+|\/+$/g, '/');
      let pathParams;
      let pathname;

      if (pagenameMap[pagename]) {
        const pathArgs = toStringArgs(pagenameMap[pagename].paramsToArgs(params));
        pathParams = pagenameMap[pagename].argsToParams(pathArgs);
        pathname = pagename + pathArgs.map(item => item && encodeURIComponent(item)).join('/').replace(/\/*$/, '');
      } else {
        pathParams = {};
        pathname = pagename;
      }

      params = excludeDefault(params, pathParams, false);
      const result = splitPrivate(params, pathParams);
      const nativeLocation = {
        pathname: `/${pathname.replace(/^\/+|\/+$/g, '')}`,
        searchData: result[0] ? {
          [paramsKey]: JSON.stringify(result[0])
        } : undefined,
        hashData: result[1] ? {
          [paramsKey]: JSON.stringify(result[1])
        } : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    }

  };
}
export function nativeLocationToEluxLocation(nativeLocation, locationTransform) {
  let eluxLocation;

  try {
    eluxLocation = locationTransform.in(nativeLocation);
  } catch (error) {
    env.console.warn(error);
    eluxLocation = {
      pagename: '/',
      params: {}
    };
  }

  return eluxLocation;
}

function splitQuery(query) {
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
  }, undefined);
}

export function nativeUrlToNativeLocation(url) {
  if (!url) {
    return {
      pathname: '/',
      searchData: undefined,
      hashData: undefined
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
    hashData: splitQuery(hash)
  };
}
export function nativeUrlToEluxLocation(nativeUrl, locationTransform) {
  return nativeLocationToEluxLocation(nativeUrlToNativeLocation(nativeUrl), locationTransform);
}

function joinQuery(params) {
  return Object.keys(params || {}).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
}

export function nativeLocationToNativeUrl({
  pathname,
  searchData,
  hashData
}) {
  const search = joinQuery(searchData);
  const hash = joinQuery(hashData);
  return [`/${pathname.replace(/^\/+|\/+$/g, '')}`, search && `?${search}`, hash && `#${hash}`].join('');
}
export function eluxLocationToNativeUrl(location, locationTransform) {
  const nativeLocation = locationTransform.out(location);
  return nativeLocationToNativeUrl(nativeLocation);
}
export function eluxLocationToEluxUrl(location) {
  return [location.pagename, JSON.stringify(location.params || {})].join('?');
}
export function urlToEluxLocation(url, locationTransform) {
  const [pathname, ...others] = url.split('?');
  const query = others.join('?');
  let location;

  try {
    if (query.startsWith('{')) {
      const data = JSON.parse(query);
      location = locationTransform.in({
        pagename: pathname,
        params: data
      });
    } else {
      const nativeLocation = nativeUrlToNativeLocation(url);
      location = locationTransform.in(nativeLocation);
    }
  } catch (error) {
    env.console.warn(error);
    location = {
      pagename: '/',
      params: {}
    };
  }

  return location;
}
export function payloadToEluxLocation(payload, curRouteState) {
  let params = payload.params;
  const extendParams = payload.extendParams === 'current' ? curRouteState.params : payload.extendParams;

  if (extendParams && params) {
    params = deepMerge({}, extendParams, params);
  } else if (extendParams) {
    params = extendParams;
  }

  return {
    pagename: payload.pagename || curRouteState.pagename,
    params: params || {}
  };
}