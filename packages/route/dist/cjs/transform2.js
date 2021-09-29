"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createLocationTransform = createLocationTransform;
exports.createRouteModule = createRouteModule;
exports.LocationTransform = exports.urlParser = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@elux/core");

var _basic = require("./basic");

var _deepExtend = require("./deep-extend");

var locationCaches = {
  getItem: function getItem(url) {
    return;
  },
  setItem: function setItem(url, item) {
    return;
  },
  updateItem: function updateItem(url, data) {
    return;
  }
};
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
    return url.substr(3).split('?')[0];
  },
  getSearch: function getSearch(url) {
    return url.replace(/^.+?(\?|$)/, '');
  },
  stringifySearch: function stringifySearch(data) {
    return Object.keys(data).length ? JSON.stringify(data) : '';
  },
  parseSearch: function parseSearch(search) {
    if (!search || search === '{}' || search.charAt(0) !== '{' || search.charAt(search.length - 1) !== '}') {
      return {};
    }

    return JSON.parse(search);
  },
  checkUrl: function checkUrl(url) {
    var type = this.type[url.charAt(0)] || 'n';
    var path, search;
    var arr = url.split('://');

    if (arr.length > 1) {
      arr.shift();
    }

    path = arr[0].split('?')[0];
    path = this.checkPath(path);

    if (type === 'e' || type === 's') {
      search = url.replace(/^.+?(\?|$)/, '');

      if (search === '{}' || search.charAt(0) !== '{' || search.charAt(search.length - 1) !== '}') {
        search = '';
      }
    } else {
      var _arr = url.split(_basic.routeConfig.paramsKey + "=");

      if (_arr[1]) {
        _arr = _arr[1].split('&');
        search = _arr[0] || '';
      } else {
        search = '';
      }
    }

    return this.getUrl(type, path, search);
  },
  checkPath: function checkPath(path) {
    path = "/" + path.replace(/^\/+|\/+$/g, '');
    path === '/' ? '/index' : path;
    return path;
  }
};
exports.urlParser = urlParser;

var LocationTransform = function () {
  function LocationTransform(url, data) {
    (0, _defineProperty2.default)(this, "_eurl", void 0);
    (0, _defineProperty2.default)(this, "_nurl", void 0);
    (0, _defineProperty2.default)(this, "_pagename", void 0);
    (0, _defineProperty2.default)(this, "_payload", void 0);
    (0, _defineProperty2.default)(this, "_params", void 0);
    (0, _defineProperty2.default)(this, "_pathmatch", void 0);
    (0, _defineProperty2.default)(this, "_search", void 0);
    (0, _defineProperty2.default)(this, "_pathArgs", void 0);
    (0, _defineProperty2.default)(this, "_args", void 0);
    (0, _defineProperty2.default)(this, "_minData", void 0);
    this.url = url;
    Object.assign(this, data);
  }

  var _proto = LocationTransform.prototype;

  _proto.update = function update(payload) {
    Object.assign(this, payload);
    locationCaches.updateItem(this.url, payload);
  };

  _proto.getPathmatch = function getPathmatch() {
    if (!this._pathmatch) {
      this._pathmatch = urlParser.getPath(this.url);
    }

    return this._pathmatch;
  };

  _proto.getSearch = function getSearch() {
    if (!this._search) {
      this._search = urlParser.getSearch(this.url);
    }

    return this._search;
  };

  _proto.getArgs = function getArgs() {
    if (!this._args) {
      var search = this.getSearch();
      this._args = urlParser.parseSearch(search);
    }

    return this._args;
  };

  _proto.getPathArgs = function getPathArgs() {
    if (!this._pathArgs) {
      var notfoundPagename = _basic.routeConfig.notfoundPagename;
      var pagenameMap = _basic.routeMeta.pagenameMap;
      var pagename = this.getPagename();
      var pathmatch = this.getPathmatch();

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

      this._pathArgs = pagenameMap[_pagename] ? pagenameMap[_pagename].argsToParams(arrArgs) : {};
    }
  };

  _proto.getPayload = function getPayload() {
    if (!this._payload) {
      var pathArgs = this.getPathArgs();
      var args = this.getArgs();

      var _payload = (0, _core.deepMerge)({}, pathArgs, args);

      this.update({
        _payload: _payload
      });
    }

    return this._payload;
  };

  _proto.getMinData = function getMinData() {
    if (!this._minData) {
      var minUrl = this.getEluxUrl();

      if (!this._minData) {
        var pathmatch = urlParser.getPath(minUrl);
        var search = urlParser.getSearch(minUrl);
        this._minData = {
          pathmatch: pathmatch,
          args: urlParser.parseSearch(search)
        };
      }
    }

    return this._minData;
  };

  _proto.toStringArgs = function toStringArgs(arr) {
    return arr.map(function (item) {
      if (item === null || item === undefined) {
        return undefined;
      }

      return item.toString();
    });
  };

  _proto.getPagename = function getPagename() {
    if (!this._pagename) {
      var notfoundPagename = _basic.routeConfig.notfoundPagename;
      var pagenameList = _basic.routeMeta.pagenameList;
      var pathmatch = this.getPathmatch();

      var __pathmatch = pathmatch + "/";

      var __pagename = pagenameList.find(function (name) {
        return __pathmatch.startsWith(name);
      });

      var _pagename = __pagename ? __pagename.substr(0, __pagename.length - 1) : notfoundPagename;

      this.update({
        _pagename: _pagename
      });
    }

    return this._pagename;
  };

  _proto.getFastUrl = function getFastUrl() {
    return this.url;
  };

  _proto.getEluxUrl = function getEluxUrl() {
    if (!this._eurl) {
      var payload = this.getPayload();
      var minPayload = (0, _deepExtend.excludeDefault)(payload, _basic.routeMeta.defaultParams, true);
      var pagename = this.getPagename();
      var pagenameMap = _basic.routeMeta.pagenameMap;

      var _pagename = pagename + "/";

      var pathmatch;
      var pathArgs;

      if (pagenameMap[_pagename]) {
        var pathArgsArr = this.toStringArgs(pagenameMap[_pagename].paramsToArgs(minPayload));
        pathmatch = _pagename + pathArgsArr.map(function (item) {
          return item ? encodeURIComponent(item) : '';
        }).join('/').replace(/\/*$/, '');
        pathArgs = pagenameMap[_pagename].argsToParams(pathArgsArr);
      } else {
        pathmatch = '/index';
        pathArgs = {};
      }

      var args = (0, _deepExtend.excludeDefault)(minPayload, pathArgs, false);
      this._minData = {
        pathmatch: pathmatch,
        args: args
      };
      this.update({
        _eurl: urlParser.getEluxUrl(pathmatch, args)
      });
    }

    return this._eurl;
  };

  _proto.getNativeUrl = function getNativeUrl() {
    if (!this._nurl) {
      var nativeLocationMap = _basic.routeMeta.nativeLocationMap;
      var minData = this.getMinData();

      var _nativeLocationMap$ou = nativeLocationMap.out(minData),
          pathname = _nativeLocationMap$ou.pathname,
          query = _nativeLocationMap$ou.query;

      this.update({
        _nurl: urlParser.getNativeUrl(pathname, query)
      });
    }

    return this._nurl;
  };

  _proto.getParams = function getParams() {
    var _this = this;

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
            def[module.moduleName] = module.params;
          });

          var _params = assignDefaultData(payload);

          var modulesMap = (0, _core.moduleExists)();
          Object.keys(_params).forEach(function (moduleName) {
            if (!modulesMap[moduleName]) {
              delete _params[moduleName];
            }
          });

          _this.update({
            _params: _params
          });

          return _params;
        });
      }

      var modules = modulesOrPromise;
      modules.forEach(function (module) {
        def[module.moduleName] = module.params;
      });

      var _params = assignDefaultData(payload);

      var modulesMap = (0, _core.moduleExists)();
      Object.keys(_params).forEach(function (moduleName) {
        if (!modulesMap[moduleName]) {
          delete _params[moduleName];
        }
      });
      this.update({
        _params: _params
      });
      return _params;
    } else {
      return this._params;
    }
  };

  return LocationTransform;
}();

exports.LocationTransform = LocationTransform;

function createLocationTransform(dataOrUrl) {
  if (typeof dataOrUrl === 'string') {
    var _url = urlParser.checkUrl(dataOrUrl);

    var type = _url.charAt(0);

    if (type === 'e') {
      return createEluxLocationFromElux(_url);
    } else if (type === 's') {
      return createEluxLocationFromState(_url);
    } else {
      return createEluxLocationFromNative(_url);
    }
  } else if (dataOrUrl['pathmatch']) {
    var _ref = dataOrUrl,
        pathmatch = _ref.pathmatch,
        args = _ref.args;
    var eurl = urlParser.getEluxUrl(urlParser.checkPath(pathmatch), args);
    return createEluxLocationFromElux(eurl);
  } else if (dataOrUrl['pagename']) {
    var data = dataOrUrl;
    var pagename = data.pagename,
        payload = data.payload;
    var surl = urlParser.getStateUrl(urlParser.checkPath(pagename), payload);
    return createEluxLocationFromState(surl, data);
  } else {
    var _data = dataOrUrl;
    var pathname = _data.pathname,
        query = _data.query;
    var nurl = urlParser.getNativeUrl(urlParser.checkPath(pathname), query);
    return createEluxLocationFromNative(nurl, _data);
  }
}

function createEluxLocationFromElux(eurl) {
  var locationData = locationCaches.getItem(eurl);

  if (!locationData) {
    locationData = {};
    locationCaches.setItem(eurl, locationData);
  }

  return new LocationTransform(eurl, locationData);
}

function createEluxLocationFromNative(nurl, data) {
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

  var locationData = locationCaches.getItem(eurl);

  if (!locationData) {
    locationData = {};
    locationCaches.setItem(eurl, locationData);
  }

  return new LocationTransform(eurl, locationData);
}

function createEluxLocationFromState(surl, data) {
  var eurl = "e" + surl.substr(1);
  var locationData = locationCaches.getItem(eurl);

  if (!locationData) {
    data = data || urlParser.parseStateUrl(surl);
    locationData = {
      _pagename: data.pagename,
      _payload: data.payload
    };
    locationCaches.setItem(eurl, locationData);
  } else if (!locationData._pagename || !locationData._payload) {
    data = data || urlParser.parseStateUrl(surl);
    locationCaches.updateItem(eurl, {
      _pagename: data.pagename,
      _payload: data.payload
    });
  }

  return new LocationTransform(eurl, locationData);
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

  var pagenames = Object.keys(pagenameMap);

  var _pagenameMap = pagenames.sort(function (a, b) {
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

  _basic.routeMeta.pagenameMap = _pagenameMap;
  _basic.routeMeta.pagenameList = Object.keys(_pagenameMap);
  _basic.routeMeta.nativeLocationMap = nativeLocationMap;
  return (0, _core.exportModule)(moduleName, _core.RouteModuleHandlers, {}, {});
}