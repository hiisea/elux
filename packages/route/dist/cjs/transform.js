"use strict";

exports.__esModule = true;
exports.assignDefaultData = assignDefaultData;
exports.nativeUrlToNativeLocation = nativeUrlToNativeLocation;
exports.eluxUrlToEluxLocation = eluxUrlToEluxLocation;
exports.nativeLocationToNativeUrl = nativeLocationToNativeUrl;
exports.eluxLocationToEluxUrl = eluxLocationToEluxUrl;
exports.createLocationTransform = createLocationTransform;

var _core = require("@elux/core");

var _deepExtend = require("./deep-extend");

var _basic = require("./basic");

function assignDefaultData(data) {
  var def = _basic.routeMeta.defaultParams;
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def[moduleName]) {
      params[moduleName] = (0, _deepExtend.extendDefault)(data[moduleName], def[moduleName]);
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
      _core.env.console.error(e);
    }
  }

  return {
    pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
    params: params
  };
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
    var _pagenameMap$pagename = pagenameMap[pagename],
        argsToParams = _pagenameMap$pagename.argsToParams,
        paramsToArgs = _pagenameMap$pagename.paramsToArgs,
        page = _pagenameMap$pagename.page;
    map[fullPagename] = {
      argsToParams: argsToParams,
      paramsToArgs: paramsToArgs
    };
    _basic.routeMeta.pagenames[pagename] = pagename;
    _basic.routeMeta.pages[pagename] = page;
    return map;
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
    eluxLocationToPartialLocationState: function eluxLocationToPartialLocationState(eluxLocation) {
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

      var params = (0, _core.deepMerge)({}, pathParams, eluxLocation.params);
      var modules = (0, _core.moduleExists)();
      Object.keys(params).forEach(function (moduleName) {
        if (!modules[moduleName]) {
          delete params[moduleName];
        }
      });
      return {
        pagename: "/" + pagename.replace(/^\/+|\/+$/g, ''),
        params: params
      };
    },
    partialLocationStateToEluxLocation: function partialLocationStateToEluxLocation(partialLocation) {
      var _this$partialLocation = this.partialLocationStateToMinData(partialLocation),
          pathname = _this$partialLocation.pathname,
          params = _this$partialLocation.params;

      return {
        pathname: pathname,
        params: params
      };
    },
    nativeLocationToPartialLocationState: function nativeLocationToPartialLocationState(nativeLocation) {
      var eluxLocation = this.nativeLocationToEluxLocation(nativeLocation);
      return this.eluxLocationToPartialLocationState(eluxLocation);
    },
    partialLocationStateToNativeLocation: function partialLocationStateToNativeLocation(partialLocation) {
      var _ref2, _ref3;

      var _this$partialLocation2 = this.partialLocationStateToMinData(partialLocation),
          pathname = _this$partialLocation2.pathname,
          params = _this$partialLocation2.params,
          pathParams = _this$partialLocation2.pathParams;

      var result = (0, _deepExtend.splitPrivate)(params, pathParams);
      var nativeLocation = {
        pathname: pathname,
        searchData: result[0] ? (_ref2 = {}, _ref2[paramsKey] = JSON.stringify(result[0]), _ref2) : undefined,
        hashData: result[1] ? (_ref3 = {}, _ref3[paramsKey] = JSON.stringify(result[1]), _ref3) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
    },
    eluxLocationToNativeLocation: function eluxLocationToNativeLocation(eluxLocation) {
      var _ref4, _ref5;

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

      var result = (0, _deepExtend.splitPrivate)(eluxLocation.params, pathParams);
      var nativeLocation = {
        pathname: pathname,
        searchData: result[0] ? (_ref4 = {}, _ref4[paramsKey] = JSON.stringify(result[0]), _ref4) : undefined,
        hashData: result[1] ? (_ref5 = {}, _ref5[paramsKey] = JSON.stringify(result[1]), _ref5) : undefined
      };
      return nativeLocationMap.out(nativeLocation);
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
        params: (0, _core.deepMerge)(searchParams, hashParams) || {}
      };
    },
    eluxUrlToEluxLocation: eluxUrlToEluxLocation,
    eluxLocationToEluxUrl: eluxLocationToEluxUrl,
    nativeUrlToNativeLocation: nativeUrlToNativeLocation,
    nativeLocationToNativeUrl: nativeLocationToNativeUrl,
    eluxUrlToNativeUrl: function eluxUrlToNativeUrl(eluxUrl) {
      var eluxLocation = this.eluxUrlToEluxLocation(eluxUrl);
      return nativeLocationToNativeUrl(this.eluxLocationToNativeLocation(eluxLocation));
    },
    nativeUrlToEluxUrl: function nativeUrlToEluxUrl(nativeUrl) {
      var nativeLocation = this.nativeUrlToNativeLocation(nativeUrl);
      return eluxLocationToEluxUrl(this.nativeLocationToEluxLocation(nativeLocation));
    },
    partialLocationStateToLocationState: function partialLocationStateToLocationState(partialLocationState) {
      var pagename = partialLocationState.pagename,
          params = partialLocationState.params;
      var def = _basic.routeMeta.defaultParams;
      var asyncLoadModules = Object.keys(params).filter(function (moduleName) {
        return def[moduleName] === undefined;
      });
      var modulesOrPromise = (0, _core.getModuleList)(asyncLoadModules);

      if ((0, _core.isPromise)(modulesOrPromise)) {
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
    partialLocationStateToMinData: function partialLocationStateToMinData(partialLocationState) {
      var params = (0, _deepExtend.excludeDefault)(partialLocationState.params, _basic.routeMeta.defaultParams, true);
      var pathParams;
      var pathname;
      var pagename = ("/" + partialLocationState.pagename + "/").replace(/^\/+|\/+$/g, '/');

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

      params = (0, _deepExtend.excludeDefault)(params, pathParams, false);
      return {
        pathname: "/" + pathname.replace(/^\/+|\/+$/g, ''),
        params: params,
        pathParams: pathParams
      };
    },
    payloadToPartialLocationState: function payloadToPartialLocationState(payload) {
      var params = payload.params,
          extendParams = payload.extendParams,
          pagename = payload.pagename,
          pathname = payload.pathname;
      var newParams;

      if (extendParams && params) {
        newParams = (0, _core.deepMerge)({}, extendParams, params);
      } else {
        newParams = extendParams || {};
      }

      if (pathname) {
        return this.eluxLocationToPartialLocationState({
          pathname: pathname,
          params: newParams
        });
      } else {
        return {
          pagename: pagename || '/',
          params: newParams
        };
      }
    }
  };
}