import Taro from '@tarojs/taro';
import { env, SingleDispatcher } from '@elux/core';
export var eventBus = new SingleDispatcher();
export var tabPages = {};

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
    var arr = Taro.getCurrentPages();
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
    var arr = Taro.getCurrentPages();
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
    var arr = Taro.getCurrentPages();
    var currentPage = arr[arr.length - 1];
    prevPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
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

export function getTabPages() {
  if (env.__taroAppConfig.tabBar) {
    env.__taroAppConfig.tabBar.list.forEach(function (_ref2) {
      var pagePath = _ref2.pagePath;
      tabPages[routeToPathname(pagePath)] = true;
    });
  }

  return tabPages;
}