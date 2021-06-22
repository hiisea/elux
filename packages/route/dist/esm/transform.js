import { deepMerge, getCachedModules, env, isPromise } from '@elux/core';
import { extendDefault, excludeDefault, splitPrivate } from './deep-extend';
import { routeConfig } from './basic';
export function getDefaultParams() {
  if (routeConfig.defaultParams) {
    return routeConfig.defaultParams;
  }

  var modules = getCachedModules();
  return Object.keys(modules).reduce(function (data, moduleName) {
    var result = modules[moduleName];

    if (result && !isPromise(result)) {
      data[moduleName] = result.default.params;
    }

    return data;
  }, {});
}
export function assignDefaultData(data) {
  var def = getDefaultParams();
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}
export function dataIsNativeLocation(data) {
  return data['pathname'];
}
export function createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey) {
  if (notfoundPagename === void 0) {
    notfoundPagename = '/404';
  }

  if (paramsKey === void 0) {
    paramsKey = '_';
  }

  var pagenames = Object.keys(pagenameMap);
  pagenameMap = pagenames.sort(function (a, b) {
    return b.length - a.length;
  }).reduce(function (map, pagename) {
    var fullPagename = ("/" + pagename + "/").replace(/^\/+|\/+$/g, '/');
    map[fullPagename] = pagenameMap[pagename];
    return map;
  }, {});
  routeConfig.pagenames = pagenames.reduce(function (obj, key) {
    obj[key] = key;
    return obj;
  }, {});
  pagenames = Object.keys(pagenameMap);

  function toStringArgs(arr) {
    return arr.map(function (item) {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  }

  return {
    in: function _in(data) {
      var path;

      if (dataIsNativeLocation(data)) {
        data = nativeLocationMap.in(data);
        path = data.pathname;
      } else {
        path = data.pagename;
      }

      path = ("/" + path + "/").replace(/^\/+|\/+$/g, '/');
      var pagename = pagenames.find(function (name) {
        return path.startsWith(name);
      });
      var params;

      if (pagename) {
        if (dataIsNativeLocation(data)) {
          var searchParams = data.searchData && data.searchData[paramsKey] ? JSON.parse(data.searchData[paramsKey]) : undefined;
          var hashParams = data.hashData && data.hashData[paramsKey] ? JSON.parse(data.hashData[paramsKey]) : undefined;

          var _pathArgs = path.replace(pagename, '').split('/').map(function (item) {
            return item ? decodeURIComponent(item) : undefined;
          });

          var pathParams = pagenameMap[pagename].argsToParams(_pathArgs);
          params = deepMerge(pathParams, searchParams, hashParams);
        } else {
          var _pathParams = pagenameMap[pagename].argsToParams([]);

          params = deepMerge(_pathParams, data.params);
        }
      } else {
        pagename = notfoundPagename + "/";
        params = pagenameMap[pagename] ? pagenameMap[pagename].argsToParams([path.replace(/\/$/, '')]) : {};
      }

      return {
        pagename: "/" + pagename.replace(/^\/+|\/+$/g, ''),
        params: params
      };
    },
    out: function out(eluxLocation) {
      var _ref, _ref2;

      var params = excludeDefault(eluxLocation.params, getDefaultParams(), true);
      var pagename = ("/" + eluxLocation.pagename + "/").replace(/^\/+|\/+$/g, '/');
      var pathParams;
      var pathname;

      if (pagenameMap[pagename]) {
        var _pathArgs2 = toStringArgs(pagenameMap[pagename].paramsToArgs(params));

        pathParams = pagenameMap[pagename].argsToParams(_pathArgs2);
        pathname = pagename + _pathArgs2.map(function (item) {
          return item && encodeURIComponent(item);
        }).join('/').replace(/\/*$/, '');
      } else {
        pathParams = {};
        pathname = pagename;
      }

      params = excludeDefault(params, pathParams, false);
      var result = splitPrivate(params, pathParams);
      var nativeLocation = {
        pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
        searchData: result[0] ? (_ref = {}, _ref[paramsKey] = JSON.stringify(result[0]), _ref) : undefined,
        hashData: result[1] ? (_ref2 = {}, _ref2[paramsKey] = JSON.stringify(result[1]), _ref2) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    }
  };
}
export function nativeLocationToEluxLocation(nativeLocation, locationTransform) {
  var eluxLocation;

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
  return (query || '').split('&').reduce(function (params, str) {
    var sections = str.split('=');

    if (sections.length > 1) {
      var key = sections[0],
          arr = sections.slice(1);

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

  var arr = url.split(/[?#]/);

  if (arr.length === 2 && url.indexOf('?') < 0) {
    arr.splice(1, 0, '');
  }

  var path = arr[0],
      search = arr[1],
      hash = arr[2];
  return {
    pathname: "/" + path.replace(/^\/+|\/+$/g, ''),
    searchData: splitQuery(search),
    hashData: splitQuery(hash)
  };
}
export function nativeUrlToEluxLocation(nativeUrl, locationTransform) {
  return nativeLocationToEluxLocation(nativeUrlToNativeLocation(nativeUrl), locationTransform);
}

function joinQuery(params) {
  return Object.keys(params || {}).map(function (key) {
    return key + "=" + encodeURIComponent(params[key]);
  }).join('&');
}

export function nativeLocationToNativeUrl(_ref3) {
  var pathname = _ref3.pathname,
      searchData = _ref3.searchData,
      hashData = _ref3.hashData;
  var search = joinQuery(searchData);
  var hash = joinQuery(hashData);
  return ["/" + pathname.replace(/^\/+|\/+$/g, ''), search && "?" + search, hash && "#" + hash].join('');
}
export function eluxLocationToNativeUrl(location, locationTransform) {
  var nativeLocation = locationTransform.out(location);
  return nativeLocationToNativeUrl(nativeLocation);
}
export function eluxLocationToEluxUrl(location) {
  return [location.pagename, JSON.stringify(location.params || {})].join('?');
}
export function urlToEluxLocation(url, locationTransform) {
  var _url$split = url.split('?'),
      pathname = _url$split[0],
      others = _url$split.slice(1);

  var query = others.join('?');
  var location;

  try {
    if (query.startsWith('{')) {
      var data = JSON.parse(query);
      location = locationTransform.in({
        pagename: pathname,
        params: data
      });
    } else {
      var _nativeLocation = nativeUrlToNativeLocation(url);

      location = locationTransform.in(_nativeLocation);
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
  var params = payload.params;
  var extendParams = payload.extendParams === 'current' ? curRouteState.params : payload.extendParams;

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