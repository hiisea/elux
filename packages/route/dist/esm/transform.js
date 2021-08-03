import { deepMerge, env, getModuleList, getModuleGetter, isPromise } from '@elux/core';
import { extendDefault, excludeDefault, splitPrivate } from './deep-extend';
import { routeMeta } from './basic';
export function assignDefaultData(data) {
  var def = routeMeta.defaultParams;
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def[moduleName]) {
      params[moduleName] = extendDefault(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function splitQuery(query) {
  if (!query) {
    return undefined;
  }

  return query.split('&').reduce(function (params, str) {
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

function joinQuery(params) {
  return Object.keys(params || {}).map(function (key) {
    return key + "=" + encodeURIComponent(params[key]);
  }).join('&');
}

function isEluxLocation(data) {
  return data['params'];
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
      params: {}
    };
  }

  var _url$split = url.split('?'),
      pathname = _url$split[0],
      others = _url$split.slice(1);

  var query = others.join('?');
  var params = {};

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
  pagenames.forEach(function (key) {
    routeMeta.pagenames[key] = key;
  });
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
    urlToLocation: function urlToLocation(url) {
      return this.partialLocationToLocation(this.urlToToPartialLocation(url));
    },
    urlToToPartialLocation: function urlToToPartialLocation(url) {
      var givenLocation = this.urlToGivenLocation(url);

      if (isEluxLocation(givenLocation)) {
        return this.eluxLocationToPartialLocation(givenLocation);
      }

      return this.nativeLocationToPartialLocation(givenLocation);
    },
    urlToEluxLocation: function urlToEluxLocation(url) {
      var givenLocation = this.urlToGivenLocation(url);

      if (isEluxLocation(givenLocation)) {
        return givenLocation;
      }

      return this.nativeLocationToEluxLocation(givenLocation);
    },
    urlToGivenLocation: function urlToGivenLocation(url) {
      var _url$split2 = url.split('?', 2),
          query = _url$split2[1];

      if (query && query.charAt(0) === '{') {
        return eluxUrlToEluxLocation(url);
      }

      return nativeUrlToNativeLocation(url);
    },
    nativeLocationToLocation: function nativeLocationToLocation(nativeLocation) {
      return this.partialLocationToLocation(this.nativeLocationToPartialLocation(nativeLocation));
    },
    nativeLocationToPartialLocation: function nativeLocationToPartialLocation(nativeLocation) {
      var eluxLocation = this.nativeLocationToEluxLocation(nativeLocation);
      return this.eluxLocationToPartialLocation(eluxLocation);
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
        params: deepMerge(searchParams, hashParams) || {}
      };
    },
    eluxLocationToNativeLocation: function eluxLocationToNativeLocation(eluxLocation) {
      var _ref2, _ref3;

      var pathname = ("/" + eluxLocation.pathname + "/").replace(/^\/+|\/+$/g, '/');
      var pagename = pagenames.find(function (name) {
        return pathname.startsWith(name);
      });
      var pathParams = {};

      if (pagename) {
        var _pathArgs = pathname.replace(pagename, '').split('/').map(function (item) {
          return item ? decodeURIComponent(item) : undefined;
        });

        pathParams = pagenameMap[pagename].argsToParams(_pathArgs);
      } else {
        pagename = notfoundPagename + "/";

        if (pagenameMap[pagename]) {
          pathParams = pagenameMap[pagename].argsToParams([eluxLocation.pathname]);
        }
      }

      var result = splitPrivate(eluxLocation.params, pathParams);
      var nativeLocation = {
        pathname: pathname,
        searchData: result[0] ? (_ref2 = {}, _ref2[paramsKey] = JSON.stringify(result[0]), _ref2) : undefined,
        hashData: result[1] ? (_ref3 = {}, _ref3[paramsKey] = JSON.stringify(result[1]), _ref3) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    },
    eluxLocationToPartialLocation: function eluxLocationToPartialLocation(eluxLocation) {
      var pathname = ("/" + eluxLocation.pathname + "/").replace(/^\/+|\/+$/g, '/');
      var pagename = pagenames.find(function (name) {
        return pathname.startsWith(name);
      });
      var pathParams = {};

      if (pagename) {
        var _pathArgs2 = pathname.replace(pagename, '').split('/').map(function (item) {
          return item ? decodeURIComponent(item) : undefined;
        });

        pathParams = pagenameMap[pagename].argsToParams(_pathArgs2);
      } else {
        pagename = notfoundPagename + "/";

        if (pagenameMap[pagename]) {
          pathParams = pagenameMap[pagename].argsToParams([eluxLocation.pathname]);
        }
      }

      var params = deepMerge({}, pathParams, eluxLocation.params);
      var moduleGetter = getModuleGetter();
      Object.keys(params).forEach(function (moduleName) {
        if (!moduleGetter[moduleName]) {
          delete params[moduleName];
        }
      });
      return {
        pagename: "/" + pagename.replace(/^\/+|\/+$/g, ''),
        params: params
      };
    },
    partialLocationToLocation: function partialLocationToLocation(partialLocation) {
      var pagename = partialLocation.pagename,
          params = partialLocation.params;
      var def = routeMeta.defaultParams;
      var asyncLoadModules = Object.keys(params).filter(function (moduleName) {
        return def[moduleName] === undefined;
      });
      var modulesOrPromise = getModuleList(asyncLoadModules);

      if (isPromise(modulesOrPromise)) {
        return modulesOrPromise.then(function (modules) {
          modules.forEach(function (module) {
            def[module.moduleName] = module.params;
          });
          return {
            pagename: pagename,
            params: assignDefaultData(params)
          };
        });
      }

      var modules = modulesOrPromise;
      modules.forEach(function (module) {
        def[module.moduleName] = module.params;
      });
      return {
        pagename: pagename,
        params: assignDefaultData(params)
      };
    },
    eluxLocationToLocation: function eluxLocationToLocation(eluxLocation) {
      return this.partialLocationToLocation(this.eluxLocationToPartialLocation(eluxLocation));
    },
    partialLocationToMinData: function partialLocationToMinData(partialLocation) {
      var params = excludeDefault(partialLocation.params, routeMeta.defaultParams, true);
      var pathParams;
      var pathname;
      var pagename = ("/" + partialLocation.pagename + "/").replace(/^\/+|\/+$/g, '/');

      if (pagenameMap[pagename]) {
        var _pathArgs3 = toStringArgs(pagenameMap[pagename].paramsToArgs(params));

        pathname = pagename + _pathArgs3.map(function (item) {
          return item ? encodeURIComponent(item) : '';
        }).join('/').replace(/\/*$/, '');
        pathParams = pagenameMap[pagename].argsToParams(_pathArgs3);
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
    partialLocationToEluxLocation: function partialLocationToEluxLocation(partialLocation) {
      var _this$partialLocation = this.partialLocationToMinData(partialLocation),
          pathname = _this$partialLocation.pathname,
          params = _this$partialLocation.params;

      return {
        pathname: pathname,
        params: params
      };
    },
    partialLocationToNativeLocation: function partialLocationToNativeLocation(partialLocation) {
      var _ref4, _ref5;

      var _this$partialLocation2 = this.partialLocationToMinData(partialLocation),
          pathname = _this$partialLocation2.pathname,
          params = _this$partialLocation2.params,
          pathParams = _this$partialLocation2.pathParams;

      var result = splitPrivate(params, pathParams);
      var nativeLocation = {
        pathname: pathname,
        searchData: result[0] ? (_ref4 = {}, _ref4[paramsKey] = JSON.stringify(result[0]), _ref4) : undefined,
        hashData: result[1] ? (_ref5 = {}, _ref5[paramsKey] = JSON.stringify(result[1]), _ref5) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    }
  };
}