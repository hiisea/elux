"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.createRouteModule = createRouteModule;
exports.location = location;
exports.urlParser = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@elux/core");

var _basic = require("./basic");

var _deepExtend = require("./deep-extend");

var LocationCaches = function () {
  function LocationCaches(limit) {
    (0, _defineProperty2.default)(this, "length", 0);
    (0, _defineProperty2.default)(this, "first", void 0);
    (0, _defineProperty2.default)(this, "last", void 0);
    (0, _defineProperty2.default)(this, "data", {});
    this.limit = limit;
  }

  var _proto = LocationCaches.prototype;

  _proto.getItem = function getItem(key) {
    var data = this.data;
    var cache = data[key];

    if (cache && cache.next) {
      var nextCache = cache.next;
      delete data[key];
      data[key] = cache;
      nextCache.prev = cache.prev;
      cache.prev = this.last;
      cache.next = undefined;
      this.last = cache;

      if (this.first === cache) {
        this.first = nextCache;
      }
    }

    return cache == null ? void 0 : cache.payload;
  };

  _proto.setItem = function setItem(key, item) {
    var data = this.data;

    if (data[key]) {
      data[key].payload = item;
      return;
    }

    var cache = {
      key: key,
      prev: this.last,
      next: undefined,
      payload: item
    };
    data[key] = cache;

    if (this.last) {
      this.last.next = cache;
    }

    this.last = cache;

    if (!this.first) {
      this.first = cache;
    }

    var length = this.length + 1;

    if (length > this.limit) {
      var firstCache = this.first;
      delete data[firstCache.key];
      this.first = firstCache.next;
    } else {
      this.length = length;
    }

    return;
  };

  return LocationCaches;
}();

var locationCaches = new LocationCaches(_basic.routeConfig.maxLocationCache);
var urlParser = {
  type: {
    e: 'e',
    s: 's',
    n: 'n'
  },
  getNativeUrl: function getNativeUrl(pathname, query) {
    return this.getUrl('n', pathname, query ? _basic.routeConfig.paramsKey + "=" + encodeURIComponent(query) : '');
  },
  getEluxUrl: function getEluxUrl(pathmatch, args) {
    var search = this.stringifySearch(args);
    return this.getUrl('e', pathmatch, search);
  },
  getStateUrl: function getStateUrl(pagename, payload) {
    var search = this.stringifySearch(payload);
    return this.getUrl('s', pagename, search);
  },
  parseNativeUrl: function parseNativeUrl(nurl) {
    var pathname = this.getPath(nurl);
    var arr = nurl.split(_basic.routeConfig.paramsKey + "=");
    var query = arr[1] || '';
    return {
      pathname: pathname,
      query: decodeURIComponent(query)
    };
  },
  parseStateUrl: function parseStateUrl(surl) {
    var pagename = this.getPath(surl);
    var search = this.getSearch(surl);
    var payload = this.parseSearch(search);
    return {
      pagename: pagename,
      payload: payload
    };
  },
  getUrl: function getUrl(type, path, search) {
    return [type, ':/', path, search && search !== '{}' ? "?" + search : ''].join('');
  },
  getPath: function getPath(url) {
    return url.substr(3).split('?', 1)[0];
  },
  getSearch: function getSearch(url) {
    return url.replace(/^.+?(\?|$)/, '');
  },
  stringifySearch: function stringifySearch(data) {
    return Object.keys(data).length ? JSON.stringify(data) : '';
  },
  parseSearch: function parseSearch(search) {
    return (0, _basic.safeJsonParse)(search);
  },
  checkUrl: function checkUrl(url) {
    var type = this.type[url.charAt(0)] || 'e';
    var path, search;
    var arr = url.split('://', 2);

    if (arr.length > 1) {
      arr.shift();
    }

    path = arr[0].split('?', 1)[0];
    path = this.checkPath(path);

    if (type === 'e' || type === 's') {
      search = url.replace(/^.+?(\?|$)/, '');

      if (search === '{}' || search.charAt(0) !== '{' || search.charAt(search.length - 1) !== '}') {
        search = '';
      }
    } else {
      var _arr = url.split(_basic.routeConfig.paramsKey + "=", 2);

      if (_arr[1]) {
        _arr = _arr[1].split('&', 1);

        if (_arr[0]) {
          search = _basic.routeConfig.paramsKey + "=" + _arr[0];
        } else {
          search = '';
        }
      } else {
        search = '';
      }
    }

    return this.getUrl(type, path, search);
  },
  checkPath: function checkPath(path) {
    path = "/" + path.replace(/^\/+|\/+$/g, '');

    if (path === '/') {
      path = '/index';
    }

    return path;
  },
  withoutProtocol: function withoutProtocol(url) {
    return url.replace(/^[^/]+?:\//, '');
  }
};
exports.urlParser = urlParser;

var LocationTransform = function () {
  function LocationTransform(url, data) {
    (0, _defineProperty2.default)(this, "_pagename", void 0);
    (0, _defineProperty2.default)(this, "_payload", void 0);
    (0, _defineProperty2.default)(this, "_params", void 0);
    (0, _defineProperty2.default)(this, "_eurl", void 0);
    (0, _defineProperty2.default)(this, "_nurl", void 0);
    (0, _defineProperty2.default)(this, "_minData", void 0);
    this.url = url;
    data && this.update(data);
  }

  var _proto2 = LocationTransform.prototype;

  _proto2.getPayload = function getPayload() {
    if (!this._payload) {
      var search = urlParser.getSearch(this.url);
      var args = urlParser.parseSearch(search);
      var notfoundPagename = _basic.routeConfig.notfoundPagename;
      var pagenameMap = _basic.routeMeta.pagenameMap;
      var pagename = this.getPagename();
      var pathmatch = urlParser.getPath(this.url);

      var _pagename = pagename + "/";

      var arrArgs;

      if (pagename === notfoundPagename) {
        arrArgs = [pathmatch];
      } else {
        var _pathmatch = pathmatch + "/";

        arrArgs = _pathmatch.replace(_pagename, '').split('/').map(function (item) {
          return item ? decodeURIComponent(item) : undefined;
        });
      }

      var pathArgs = pagenameMap[_pagename] ? pagenameMap[_pagename].pathToParams(arrArgs) : {};
      this._payload = (0, _core.deepMerge)({}, pathArgs, args);
    }

    return this._payload;
  };

  _proto2.getMinData = function getMinData() {
    if (!this._minData) {
      var eluxUrl = this.getEluxUrl();

      if (!this._minData) {
        var pathmatch = urlParser.getPath(eluxUrl);
        var search = urlParser.getSearch(eluxUrl);
        this._minData = {
          pathmatch: pathmatch,
          args: urlParser.parseSearch(search)
        };
      }
    }

    return this._minData;
  };

  _proto2.toStringArgs = function toStringArgs(arr) {
    return arr.map(function (item) {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  };

  _proto2.update = function update(data) {
    var _this = this;

    Object.keys(data).forEach(function (key) {
      if (data[key] && !_this[key]) {
        _this[key] = data[key];
      }
    });
  };

  _proto2.getPagename = function getPagename() {
    if (!this._pagename) {
      var notfoundPagename = _basic.routeConfig.notfoundPagename;
      var pagenameList = _basic.routeMeta.pagenameList;
      var pathmatch = urlParser.getPath(this.url);

      var __pathmatch = pathmatch + "/";

      var __pagename = pagenameList.find(function (name) {
        return __pathmatch.startsWith(name);
      });

      this._pagename = __pagename ? __pagename.substr(0, __pagename.length - 1) : notfoundPagename;
    }

    return this._pagename;
  };

  _proto2.getEluxUrl = function getEluxUrl() {
    if (!this._eurl) {
      var payload = this.getPayload();
      var minPayload = (0, _deepExtend.excludeDefault)(payload, _basic.routeMeta.defaultParams, true);
      var pagename = this.getPagename();
      var pagenameMap = _basic.routeMeta.pagenameMap;

      var _pagename = pagename + "/";

      var pathmatch;
      var pathArgs;

      if (pagenameMap[_pagename]) {
        var pathArgsArr = this.toStringArgs(pagenameMap[_pagename].paramsToPath(minPayload));
        pathmatch = _pagename + pathArgsArr.map(function (item) {
          return item ? encodeURIComponent(item) : '';
        }).join('/');
        pathmatch = pathmatch.replace(/\/*$/, '');
        pathArgs = pagenameMap[_pagename].pathToParams(pathArgsArr);
      } else {
        pathmatch = '/index';
        pathArgs = {};
      }

      var args = (0, _deepExtend.excludeDefault)(minPayload, pathArgs, false);
      this._minData = {
        pathmatch: pathmatch,
        args: args
      };
      this._eurl = urlParser.getEluxUrl(pathmatch, args);
    }

    return this._eurl;
  };

  _proto2.getNativeUrl = function getNativeUrl(withoutProtocol) {
    if (!this._nurl) {
      var nativeLocationMap = _basic.routeMeta.nativeLocationMap;
      var minData = this.getMinData();

      var _nativeLocationMap$ou = nativeLocationMap.out(minData),
          pathname = _nativeLocationMap$ou.pathname,
          query = _nativeLocationMap$ou.query;

      this._nurl = urlParser.getNativeUrl(pathname, query);
    }

    return withoutProtocol ? urlParser.withoutProtocol(this._nurl) : this._nurl;
  };

  _proto2.getParams = function getParams() {
    var _this2 = this;

    if (!this._params) {
      var payload = this.getPayload();
      var def = _basic.routeMeta.defaultParams;
      var asyncLoadModules = Object.keys(payload).filter(function (moduleName) {
        return def[moduleName] === undefined;
      });
      var modulesOrPromise = (0, _core.getModuleList)(asyncLoadModules);

      if ((0, _core.isPromise)(modulesOrPromise)) {
        return modulesOrPromise.then(function (modules) {
          modules.forEach(function (module) {
            def[module.moduleName] = module.routeParams;
          });

          var _params = assignDefaultData(payload);

          var modulesMap = (0, _core.moduleExists)();
          Object.keys(_params).forEach(function (moduleName) {
            if (!modulesMap[moduleName]) {
              delete _params[moduleName];
            }
          });
          _this2._params = _params;
          return _params;
        });
      }

      var modules = modulesOrPromise;
      modules.forEach(function (module) {
        def[module.moduleName] = module.routeParams;
      });

      var _params = assignDefaultData(payload);

      var modulesMap = (0, _core.moduleExists)();
      Object.keys(_params).forEach(function (moduleName) {
        if (!modulesMap[moduleName]) {
          delete _params[moduleName];
        }
      });
      this._params = _params;
      return _params;
    } else {
      return this._params;
    }
  };

  return LocationTransform;
}();

function location(dataOrUrl) {
  if (typeof dataOrUrl === 'string') {
    var _url = urlParser.checkUrl(dataOrUrl);

    var type = _url.charAt(0);

    if (type === 'e') {
      return createFromElux(_url);
    } else if (type === 's') {
      return createFromState(_url);
    } else {
      return createFromNative(_url);
    }
  } else if (dataOrUrl['pathmatch']) {
    var _ref = dataOrUrl,
        pathmatch = _ref.pathmatch,
        args = _ref.args;
    var eurl = urlParser.getEluxUrl(urlParser.checkPath(pathmatch), args);
    return createFromElux(eurl);
  } else if (dataOrUrl['pagename']) {
    var data = dataOrUrl;
    var pagename = data.pagename,
        payload = data.payload;
    var surl = urlParser.getStateUrl(urlParser.checkPath(pagename), payload);
    return createFromState(surl, data);
  } else {
    var _data = dataOrUrl;
    var pathname = _data.pathname,
        query = _data.query;
    var nurl = urlParser.getNativeUrl(urlParser.checkPath(pathname), query);
    return createFromNative(nurl, _data);
  }
}

function createFromElux(eurl, data) {
  var item = locationCaches.getItem(eurl);

  if (!item) {
    item = new LocationTransform(eurl, {
      _eurl: eurl,
      _nurl: data == null ? void 0 : data.nurl
    });
    locationCaches.setItem(eurl, item);
  } else if (!item._eurl || !item._nurl) {
    item.update({
      _eurl: eurl,
      _nurl: data == null ? void 0 : data.nurl
    });
  }

  return item;
}

function createFromNative(nurl, data) {
  var eurl = locationCaches.getItem(nurl);

  if (!eurl) {
    var nativeLocationMap = _basic.routeMeta.nativeLocationMap;
    data = data || urlParser.parseNativeUrl(nurl);

    var _nativeLocationMap$in = nativeLocationMap.in(data),
        pathmatch = _nativeLocationMap$in.pathmatch,
        args = _nativeLocationMap$in.args;

    eurl = urlParser.getEluxUrl(pathmatch, args);
    locationCaches.setItem(nurl, eurl);
  }

  return createFromElux(eurl, {
    nurl: nurl
  });
}

function createFromState(surl, data) {
  var eurl = "e" + surl.substr(1);
  var item = locationCaches.getItem(eurl);

  if (!item) {
    data = data || urlParser.parseStateUrl(surl);
    item = new LocationTransform(eurl, {
      _pagename: data.pagename,
      _payload: data.payload
    });
    locationCaches.setItem(eurl, item);
  } else if (!item._pagename || !item._payload) {
    data = data || urlParser.parseStateUrl(surl);
    item.update({
      _pagename: data.pagename,
      _payload: data.payload
    });
  }

  return item;
}

function assignDefaultData(data) {
  var def = _basic.routeMeta.defaultParams;
  return Object.keys(data).reduce(function (params, moduleName) {
    if (def[moduleName]) {
      params[moduleName] = (0, _deepExtend.extendDefault)(data[moduleName], def[moduleName]);
    }

    return params;
  }, {});
}

var defaultNativeLocationMap = {
  in: function _in(nativeLocation) {
    var pathname = nativeLocation.pathname,
        query = nativeLocation.query;
    return {
      pathmatch: pathname,
      args: urlParser.parseSearch(query)
    };
  },
  out: function out(eluxLocation) {
    var pathmatch = eluxLocation.pathmatch,
        args = eluxLocation.args;
    return {
      pathname: pathmatch,
      query: urlParser.stringifySearch(args)
    };
  }
};

function createRouteModule(moduleName, pagenameMap, nativeLocationMap) {
  if (nativeLocationMap === void 0) {
    nativeLocationMap = defaultNativeLocationMap;
  }

  (0, _core.setCoreConfig)({
    RouteModuleName: moduleName
  });
  var pagenames = Object.keys(pagenameMap);

  var _pagenameMap = pagenames.sort(function (a, b) {
    return b.length - a.length;
  }).reduce(function (map, pagename) {
    var fullPagename = ("/" + pagename + "/").replace(/^\/+|\/+$/g, '/');
    var _pagenameMap$pagename = pagenameMap[pagename],
        pathToParams = _pagenameMap$pagename.pathToParams,
        paramsToPath = _pagenameMap$pagename.paramsToPath,
        pageData = _pagenameMap$pagename.pageData;
    map[fullPagename] = {
      pathToParams: pathToParams,
      paramsToPath: paramsToPath
    };
    _basic.routeMeta.pageDatas[pagename] = pageData;
    return map;
  }, {});

  _basic.routeMeta.pagenameMap = _pagenameMap;
  _basic.routeMeta.pagenameList = Object.keys(_pagenameMap);
  _basic.routeMeta.nativeLocationMap = nativeLocationMap;
  return (0, _core.exportModule)(moduleName, _core.RouteModel, {}, '/index');
}