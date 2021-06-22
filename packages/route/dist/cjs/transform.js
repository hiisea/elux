"use strict";

exports.__esModule = true;
exports.getDefaultParams = getDefaultParams;
exports.assignDefaultData = assignDefaultData;
exports.dataIsNativeLocation = dataIsNativeLocation;
exports.createLocationTransform = createLocationTransform;
exports.nativeLocationToEluxLocation = nativeLocationToEluxLocation;
exports.nativeUrlToNativeLocation = nativeUrlToNativeLocation;
exports.nativeUrlToEluxLocation = nativeUrlToEluxLocation;
exports.nativeLocationToNativeUrl = nativeLocationToNativeUrl;
exports.eluxLocationToNativeUrl = eluxLocationToNativeUrl;
exports.eluxLocationToEluxUrl = eluxLocationToEluxUrl;
exports.urlToEluxLocation = urlToEluxLocation;
exports.payloadToEluxLocation = payloadToEluxLocation;

var _core = require("@elux/core");

var _deepExtend = require("./deep-extend");

var _basic = require("./basic");

function getDefaultParams() {
  if (_basic.routeConfig.defaultParams) {
    return _basic.routeConfig.defaultParams;
  }

  var modules = (0, _core.getCachedModules)();
  return Object.keys(modules).reduce(function (data, moduleName) {
    var result = modules[moduleName];

    if (result && !(0, _core.isPromise)(result)) {
      data[moduleName] = result.default.params;
    }

    return data;
  }, {});
}

function assignDefaultData(data) {
  var def = getDefaultParams();
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def.hasOwnProperty(moduleName)) {
      params[moduleName] = (0, _deepExtend.extendDefault)(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

function dataIsNativeLocation(data) {
  return data['pathname'];
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
          params = (0, _core.deepMerge)(pathParams, searchParams, hashParams);
        } else {
          var _pathParams = pagenameMap[pagename].argsToParams([]);

          params = (0, _core.deepMerge)(_pathParams, data.params);
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

      var params = (0, _deepExtend.excludeDefault)(eluxLocation.params, getDefaultParams(), true);
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

      params = (0, _deepExtend.excludeDefault)(params, pathParams, false);
      var result = (0, _deepExtend.splitPrivate)(params, pathParams);
      var nativeLocation = {
        pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
        searchData: result[0] ? (_ref = {}, _ref[paramsKey] = JSON.stringify(result[0]), _ref) : undefined,
        hashData: result[1] ? (_ref2 = {}, _ref2[paramsKey] = JSON.stringify(result[1]), _ref2) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    }
  };
}

function nativeLocationToEluxLocation(nativeLocation, locationTransform) {
  var eluxLocation;

  try {
    eluxLocation = locationTransform.in(nativeLocation);
  } catch (error) {
    _core.env.console.warn(error);

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

function nativeUrlToEluxLocation(nativeUrl, locationTransform) {
  return nativeLocationToEluxLocation(nativeUrlToNativeLocation(nativeUrl), locationTransform);
}

function joinQuery(params) {
  return Object.keys(params || {}).map(function (key) {
    return key + "=" + encodeURIComponent(params[key]);
  }).join('&');
}

function nativeLocationToNativeUrl(_ref3) {
  var pathname = _ref3.pathname,
      searchData = _ref3.searchData,
      hashData = _ref3.hashData;
  var search = joinQuery(searchData);
  var hash = joinQuery(hashData);
  return ["/" + pathname.replace(/^\/+|\/+$/g, ''), search && "?" + search, hash && "#" + hash].join('');
}

function eluxLocationToNativeUrl(location, locationTransform) {
  var nativeLocation = locationTransform.out(location);
  return nativeLocationToNativeUrl(nativeLocation);
}

function eluxLocationToEluxUrl(location) {
  return [location.pagename, JSON.stringify(location.params || {})].join('?');
}

function urlToEluxLocation(url, locationTransform) {
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
    _core.env.console.warn(error);

    location = {
      pagename: '/',
      params: {}
    };
  }

  return location;
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
    pagename: payload.pagename || curRouteState.pagename,
    params: params || {}
  };
}