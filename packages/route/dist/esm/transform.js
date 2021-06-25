import { deepMerge, getCachedModules, env, isPromise, getModuleList } from '@elux/core';
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
      data[moduleName] = result.params;
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
export function eluxUrlToEluxLocation(url) {
  if (!url) {
    return {
      pathname: '/',
      params: undefined
    };
  }

  var _url$split = url.split('?'),
      pathname = _url$split[0],
      others = _url$split.slice(1);

  var query = others.join('?');
  var params;

  if (query && query.charAt(0) === '{' && query.charAt(query.length - 1) === '}') {
    try {
      params = JSON.parse(query);
    } catch (e) {
      env.console.error(e);
    }
  }

  return {
    pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
    params: params
  };
}

function joinQuery(params) {
  return Object.keys(params || {}).map(function (key) {
    return key + "=" + encodeURIComponent(params[key]);
  }).join('&');
}

export function nativeLocationToNativeUrl(_ref) {
  var pathname = _ref.pathname,
      searchData = _ref.searchData,
      hashData = _ref.hashData;
  var search = joinQuery(searchData);
  var hash = joinQuery(hashData);
  return ["/" + pathname.replace(/^\/+|\/+$/g, ''), search && "?" + search, hash && "#" + hash].join('');
}
export function eluxLocationToEluxUrl(location) {
  return [location.pathname, JSON.stringify(location.params || {})].join('?');
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
    pathname: payload.pathname || curRouteState.pagename,
    params: params
  };
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
    urlToEluxLocation: function urlToEluxLocation(url) {
      var _url$split2 = url.split('?', 2),
          query = _url$split2[1];

      if (query && query.charAt(0) === '{') {
        return eluxUrlToEluxLocation(url);
      }

      return this.nativeUrlToEluxLocation(url);
    },
    nativeUrlToEluxLocation: function nativeUrlToEluxLocation(nativeUrl) {
      return this.nativeLocationToEluxLocation(nativeUrlToNativeLocation(nativeUrl));
    },
    nativeLocationToEluxLocation: function nativeLocationToEluxLocation(nativeLocation) {
      nativeLocation = nativeLocationMap.in(nativeLocation);
      var searchParams;
      var hashParams;

      try {
        searchParams = nativeLocation.searchData && nativeLocation.searchData[paramsKey] ? JSON.parse(nativeLocation.searchData[paramsKey]) : undefined;
        hashParams = nativeLocation.hashData && nativeLocation.hashData[paramsKey] ? JSON.parse(nativeLocation.hashData[paramsKey]) : undefined;
      } catch (e) {
        env.console.error(e);
      }

      return {
        pathname: nativeLocation.pathname,
        params: deepMerge(searchParams, hashParams)
      };
    },
    eluxLocationtoPartialLocation: function eluxLocationtoPartialLocation(eluxLocation) {
      var pathname = ("/" + eluxLocation.pathname + "/").replace(/^\/+|\/+$/g, '/');
      var pagename = pagenames.find(function (name) {
        return pathname.startsWith(name);
      });
      var params;

      if (pagename) {
        var _pathArgs = pathname.replace(pagename, '').split('/').map(function (item) {
          return item ? decodeURIComponent(item) : undefined;
        });

        var pathParams = pagenameMap[pagename].argsToParams(_pathArgs);
        params = deepMerge({}, pathParams, eluxLocation.params);
      } else {
        pagename = notfoundPagename + "/";
        params = {};
      }

      return {
        pagename: "/" + pagename.replace(/^\/+|\/+$/g, ''),
        params: params
      };
    },
    partialLocationToLocation: function partialLocationToLocation(partialLocation) {
      var pagename = partialLocation.pagename,
          params = partialLocation.params;

      if (routeConfig.defaultParams) {
        return {
          pagename: pagename,
          params: assignDefaultData(params)
        };
      }

      return getModuleList(Object.keys(params)).then(function () {
        return {
          pagename: pagename,
          params: assignDefaultData(params)
        };
      });
    },
    eluxLocationtoLocation: function eluxLocationtoLocation(eluxLocation) {
      return this.partialLocationToLocation(this.eluxLocationtoPartialLocation(eluxLocation));
    },
    locationToMinData: function locationToMinData(location) {
      var params = excludeDefault(location.params, getDefaultParams(), true);
      var pathParams;
      var pathname;
      var pagename = ("/" + location.pagename + "/").replace(/^\/+|\/+$/g, '/');

      if (pagenameMap[pagename]) {
        var _pathArgs2 = toStringArgs(pagenameMap[pagename].paramsToArgs(params));

        pathname = pagename + _pathArgs2.map(function (item) {
          return item ? encodeURIComponent(item) : '';
        }).join('/').replace(/\/*$/, '');
        pathParams = pagenameMap[pagename].argsToParams(_pathArgs2);
      } else {
        pathname = pagename;
        pathParams = {};
      }

      params = excludeDefault(params, pathParams, false);
      return {
        pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
        params: params,
        pathParams: pathParams
      };
    },
    locationtoNativeLocation: function locationtoNativeLocation(location) {
      var _ref2, _ref3;

      var _this$locationToMinDa = this.locationToMinData(location),
          pathname = _this$locationToMinDa.pathname,
          params = _this$locationToMinDa.params,
          pathParams = _this$locationToMinDa.pathParams;

      var result = splitPrivate(params, pathParams);
      var nativeLocation = {
        pathname: pathname,
        searchData: result[0] ? (_ref2 = {}, _ref2[paramsKey] = JSON.stringify(result[0]), _ref2) : undefined,
        hashData: result[1] ? (_ref3 = {}, _ref3[paramsKey] = JSON.stringify(result[1]), _ref3) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    }
  };
}