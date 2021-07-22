import Taro from '@tarojs/taro';
import { SingleDispatcher } from '@elux/core';
import { nativeUrlToNativeLocation } from '@elux/route';
export var eventBus = new SingleDispatcher();
export var tabPages = {};

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
    var arr = Taro.getCurrentPages();
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
    var arr = Taro.getCurrentPages();
    var currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options)
    };
    return onHide == null ? void 0 : onHide.call(this);
  };

  var onUnload = pageOptions.onUnload;

  pageOptions.onUnload = function () {
    var arr = Taro.getCurrentPages();
    var currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options)
    };
    return onUnload == null ? void 0 : onUnload.call(this);
  };
}

export var routeENV = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,
  getLocation: function getLocation() {
    var arr = Taro.getCurrentPages();
    var path;
    var query;

    if (arr.length === 0) {
      var _Taro$getLaunchOption = Taro.getLaunchOptionsSync();

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

if (process.env.TARO_ENV === 'h5') {
  var taroRouter = require('@tarojs/router');

  routeENV.getLocation = function () {
    var _taroRouter$history$l = taroRouter.history.location,
        pathname = _taroRouter$history$l.pathname,
        search = _taroRouter$history$l.search;
    var nativeLocation = nativeUrlToNativeLocation(pathname + search);
    return {
      pathname: nativeLocation.pathname,
      searchData: nativeLocation.searchData
    };
  };

  routeENV.onRouteChange = function (callback) {
    var unhandle = taroRouter.history.listen(function (location, action) {
      var nativeLocation = nativeUrlToNativeLocation([location.pathname, location.search].join(''));
      var routeAction = action;

      if (action !== 'POP' && tabPages[nativeLocation.pathname]) {
        routeAction = 'RELAUNCH';
      }

      callback(nativeLocation.pathname, nativeLocation.searchData, routeAction);
    });
    return unhandle;
  };

  Taro.onUnhandledRejection = function (callback) {
    window.addEventListener('unhandledrejection', callback, false);
  };

  Taro.onError = function (callback) {
    window.addEventListener('error', callback, false);
  };
} else {
  if (!Taro.onUnhandledRejection) {
    Taro.onUnhandledRejection = function () {
      return undefined;
    };
  }

  var originalPage = Page;

  Page = function Page(pageOptions) {
    patchPageOptions(pageOptions);
    return originalPage(pageOptions);
  };
}