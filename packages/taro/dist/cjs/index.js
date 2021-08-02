"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.getTabPages = getTabPages;
exports.routeENV = exports.tabPages = exports.eventBus = void 0;

var _taro = _interopRequireDefault(require("@tarojs/taro"));

var _core = require("@elux/core");

var eventBus = new _core.SingleDispatcher();
exports.eventBus = eventBus;
var tabPages = {};
exports.tabPages = tabPages;

function routeToPathname(route) {
  return "/" + route.replace(/^\/+|\/+$/g, '');
}

function queryTosearch(query) {
  if (query === void 0) {
    query = {};
  }

  var parts = [];
  Object.keys(query).forEach(function (key) {
    parts.push(key + "=" + query[key]);
  });
  return parts.join('&');
}

var prevPageInfo;

function patchPageOptions(pageOptions) {
  var onShow = pageOptions.onShow;

  pageOptions.onShow = function () {
    var arr = _taro.default.getCurrentPages();

    var currentPage = arr[arr.length - 1];
    var currentPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
    };

    if (prevPageInfo) {
      var _action = 'PUSH';

      if (currentPageInfo.count < prevPageInfo.count) {
        _action = 'POP';
      } else if (currentPageInfo.count === prevPageInfo.count) {
        if (currentPageInfo.count === 1) {
          _action = 'RELAUNCH';
        } else {
          _action = 'REPLACE';
        }
      }

      eventBus.dispatch({
        pathname: currentPageInfo.pathname,
        search: currentPageInfo.search,
        action: _action
      });
    }

    return onShow == null ? void 0 : onShow.call(this);
  };

  var onHide = pageOptions.onHide;

  pageOptions.onHide = function () {
    var arr = _taro.default.getCurrentPages();

    var currentPage = arr[arr.length - 1];
    prevPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
    };
    return onHide == null ? void 0 : onHide.call(this);
  };

  var onUnload = pageOptions.onUnload;

  pageOptions.onUnload = function () {
    var arr = _taro.default.getCurrentPages();

    var currentPage = arr[arr.length - 1];
    prevPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
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
      pathname: routeToPathname(path),
      search: queryTosearch(query)
    };
  },
  onRouteChange: function onRouteChange(callback) {
    return eventBus.addListener(function (data) {
      var pathname = data.pathname,
          search = data.search,
          action = data.action;
      callback(pathname, search, action);
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
    return {
      pathname: pathname,
      search: search.replace(/^\?/, '')
    };
  };

  routeENV.onRouteChange = function (callback) {
    var unhandle = taroRouter.history.listen(function (_ref) {
      var location = _ref.location,
          action = _ref.action;
      var routeAction = action;

      if (action !== 'POP' && tabPages[location.pathname]) {
        routeAction = 'RELAUNCH';
      }

      callback(location.pathname, location.search.replace(/^\?/, ''), routeAction);
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

function getTabPages() {
  if (_core.env.__taroAppConfig.tabBar) {
    _core.env.__taroAppConfig.tabBar.list.forEach(function (_ref2) {
      var pagePath = _ref2.pagePath;
      tabPages[routeToPathname(pagePath)] = true;
    });
  }

  return tabPages;
}