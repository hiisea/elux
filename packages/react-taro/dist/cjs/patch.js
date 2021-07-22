"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.routeENV = exports.tabPages = exports.eventBus = void 0;

var _taro = _interopRequireDefault(require("@tarojs/taro"));

var _core = require("@elux/core");

var _route = require("@elux/route");

var eventBus = new _core.SingleDispatcher();
exports.eventBus = eventBus;
var tabPages = {};
exports.tabPages = tabPages;

function queryToData(query) {
  if (query === void 0) {
    query = {};
  }

  return Object.keys(query).reduce(function (params, key) {
    if (!params) {
      params = {};
    }

    params[key] = decodeURIComponent(query[key]);
    return params;
  }, undefined);
}

function routeToUrl(path, query) {
  if (query === void 0) {
    query = {};
  }

  path = "/" + path.replace(/^\/+|\/+$/g, '');
  var parts = [];
  Object.keys(query).forEach(function (key) {
    parts.push(key + "=" + query[key]);
  });
  var queryString = parts.join('&');
  return queryString ? path + "?" + queryString : path;
}

var prevPagesInfo;

function patchPageOptions(pageOptions) {
  var onShow = pageOptions.onShow;

  pageOptions.onShow = function () {
    var arr = _taro.default.getCurrentPages();

    var currentPage = arr[arr.length - 1];
    var currentPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options)
    };

    if (prevPagesInfo) {
      var _action = 'PUSH';
      var curPathname = "/" + currentPage.route.replace(/^\/+|\/+$/g, '');

      if (currentPagesInfo.count < prevPagesInfo.count) {
        _action = 'POP';
      } else if (currentPagesInfo.count === prevPagesInfo.count) {
        if (currentPagesInfo.count === 1) {
          _action = 'RELAUNCH';
        } else {
          _action = 'REPLACE';
        }
      }

      eventBus.dispatch({
        pathname: curPathname,
        searchData: queryToData(currentPage.options),
        action: _action
      });
    }

    return onShow == null ? void 0 : onShow.call(this);
  };

  var onHide = pageOptions.onHide;

  pageOptions.onHide = function () {
    var arr = _taro.default.getCurrentPages();

    var currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options)
    };
    return onHide == null ? void 0 : onHide.call(this);
  };

  var onUnload = pageOptions.onUnload;

  pageOptions.onUnload = function () {
    var arr = _taro.default.getCurrentPages();

    var currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options)
    };
    return onUnload == null ? void 0 : onUnload.call(this);
  };
}

var routeENV = {
  reLaunch: _taro.default.reLaunch,
  redirectTo: _taro.default.redirectTo,
  navigateTo: _taro.default.navigateTo,
  navigateBack: _taro.default.navigateBack,
  switchTab: _taro.default.switchTab,
  getLocation: function getLocation() {
    var arr = _taro.default.getCurrentPages();

    var path;
    var query;

    if (arr.length === 0) {
      var _Taro$getLaunchOption = _taro.default.getLaunchOptionsSync();

      path = _Taro$getLaunchOption.path;
      query = _Taro$getLaunchOption.query;
    } else {
      var current = arr[arr.length - 1];
      path = current.route;
      query = current.options;
    }

    return {
      pathname: "/" + path.replace(/^\/+|\/+$/g, ''),
      searchData: queryToData(query)
    };
  },
  onRouteChange: function onRouteChange(callback) {
    return eventBus.addListener(function (data) {
      var pathname = data.pathname,
          searchData = data.searchData,
          action = data.action;
      callback(pathname, searchData, action);
    });
  }
};
exports.routeENV = routeENV;

if (process.env.TARO_ENV === 'h5') {
  var taroRouter = require('@tarojs/router');

  routeENV.getLocation = function () {
    var _taroRouter$history$l = taroRouter.history.location,
        pathname = _taroRouter$history$l.pathname,
        search = _taroRouter$history$l.search;
    var nativeLocation = (0, _route.nativeUrlToNativeLocation)(pathname + search);
    return {
      pathname: nativeLocation.pathname,
      searchData: nativeLocation.searchData
    };
  };

  routeENV.onRouteChange = function (callback) {
    var unhandle = taroRouter.history.listen(function (location, action) {
      var nativeLocation = (0, _route.nativeUrlToNativeLocation)([location.pathname, location.search].join(''));
      var routeAction = action;

      if (action !== 'POP' && tabPages[nativeLocation.pathname]) {
        routeAction = 'RELAUNCH';
      }

      callback(nativeLocation.pathname, nativeLocation.searchData, routeAction);
    });
    return unhandle;
  };

  _taro.default.onUnhandledRejection = function (callback) {
    window.addEventListener('unhandledrejection', callback, false);
  };

  _taro.default.onError = function (callback) {
    window.addEventListener('error', callback, false);
  };
} else {
  if (!_taro.default.onUnhandledRejection) {
    _taro.default.onUnhandledRejection = function () {
      return undefined;
    };
  }

  var originalPage = Page;

  Page = function Page(pageOptions) {
    patchPageOptions(pageOptions);
    return originalPage(pageOptions);
  };
}