"use strict";

exports.__esModule = true;
exports.assignDefaultData = assignDefaultData;
exports.nativeUrlToNativeLocation = nativeUrlToNativeLocation;
exports.eluxUrlToEluxLocation = eluxUrlToEluxLocation;
exports.nativeLocationToNativeUrl = nativeLocationToNativeUrl;
exports.eluxLocationToEluxUrl = eluxLocationToEluxUrl;
exports.payloadToEluxLocation = payloadToEluxLocation;
exports.createLocationTransform = createLocationTransform;

var _core = require("@elux/core");

var _deepExtend = require("./deep-extend");

var _basic = require("./basic");

function assignDefaultData(data) {
  var def = _basic.routeConfig.defaultParams;
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def[moduleName]) {
      params[moduleName] = (0, _deepExtend.extendDefault)(data[moduleName], def[moduleName]);
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

function nativeUrlToNativeLocation(url) {
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

function eluxUrlToEluxLocation(url) {
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
      _core.env.console.error(e);
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

function nativeLocationToNativeUrl(_ref) {
  var pathname = _ref.pathname,
      searchData = _ref.searchData,
      hashData = _ref.hashData;
  var search = joinQuery(searchData);
  var hash = joinQuery(hashData);
  return ["/" + pathname.replace(/^\/+|\/+$/g, ''), search && "?" + search, hash && "#" + hash].join('');
}

function eluxLocationToEluxUrl(location) {
  return [location.pathname, JSON.stringify(location.params || {})].join('?');
}

function payloadToEluxLocation(payload, curRouteState) {
  var params = payload.params;
  var extendParams = payload.extendParams === 'current' ? curRouteState.params : payload.extendParams;

  if (extendParams && params) {
    params = (0, _core.deepMerge)({}, extendParams, params);
  } else if (extendParams) {
    params = extendParams;
  }

  return {
    pathname: payload.pathname || curRouteState.pagename,
    params: params
  };
}

function createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey) {
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
  _basic.routeConfig.pagenames = pagenames.reduce(function (obj, key) {
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
        _core.env.console.error(e);
      }

      return {
        pathname: nativeLocation.pathname,
        params: (0, _core.deepMerge)(searchParams, hashParams)
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
        params = (0, _core.deepMerge)({}, pathParams, eluxLocation.params);
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
      var def = _basic.routeConfig.defaultParams;
      var asyncLoadModules = Object.keys(params).filter(function (moduleName) {
        return def[moduleName] === undefined;
      });
      return (0, _core.getModuleList)(asyncLoadModules).then(function (modules) {
        modules.forEach(function (module) {
          def[module.moduleName] = module.params;
        });
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
      var params = (0, _deepExtend.excludeDefault)(location.params, _basic.routeConfig.defaultParams, true);
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

      params = (0, _deepExtend.excludeDefault)(params, pathParams, false);
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

      var result = (0, _deepExtend.splitPrivate)(params, pathParams);
      var nativeLocation = {
        pathname: pathname,
        searchData: result[0] ? (_ref2 = {}, _ref2[paramsKey] = JSON.stringify(result[0]), _ref2) : undefined,
        hashData: result[1] ? (_ref3 = {}, _ref3[paramsKey] = JSON.stringify(result[1]), _ref3) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    }
  };
}