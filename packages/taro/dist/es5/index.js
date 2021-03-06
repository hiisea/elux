import { env, setCoreConfig, SingleDispatcher } from '@elux/core';
import Taro from '@tarojs/taro';
setCoreConfig({
  SetPageTitle: function SetPageTitle(title) {
    return Taro.setNavigationBarTitle({
      title: title
    });
  }
});
var TaroRouter;
var beforeOnShow;
var tabPages = undefined;
var curLocation;
export var eventBus = new SingleDispatcher();

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

export var taroHistory = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,
  isTabPage: function isTabPage(pathname) {
    if (!tabPages) {
      var tabConfig = env.__taroAppConfig.tabBar;

      if (tabConfig) {
        tabPages = (tabConfig.list || tabConfig.items).reduce(function (obj, item) {
          obj[routeToPathname(item.pagePath)] = true;
          return obj;
        }, {});
      } else {
        tabPages = {};
      }
    }

    return !!tabPages[pathname];
  },
  getLocation: function getLocation() {
    if (!curLocation) {
      if (process.env.TARO_ENV === 'h5') {
        TaroRouter.history.listen(function (_ref) {
          var _ref$location = _ref.location,
              pathname = _ref$location.pathname,
              search = _ref$location.search,
              action = _ref.action;

          if (action !== 'POP' && taroHistory.isTabPage(pathname)) {
            action = 'RELAUNCH';
          }

          curLocation = {
            pathname: pathname,
            search: search.replace(/^\?/, ''),
            action: action
          };
        });
        var _TaroRouter$history$l = TaroRouter.history.location,
            pathname = _TaroRouter$history$l.pathname,
            search = _TaroRouter$history$l.search;
        curLocation = {
          pathname: pathname,
          search: search.replace(/^\?/, ''),
          action: 'RELAUNCH'
        };
      } else {
        var arr = Taro.getCurrentPages();

        var _path;

        var query;

        if (arr.length === 0) {
          var _Taro$getLaunchOption = Taro.getLaunchOptionsSync();

          _path = _Taro$getLaunchOption.path;
          query = _Taro$getLaunchOption.query;
        } else {
          var current = arr[arr.length - 1];
          _path = current.route;
          query = current.options;
        }

        if (!_path) {
          return {
            pathname: '',
            search: '',
            action: 'RELAUNCH'
          };
        }

        curLocation = {
          pathname: routeToPathname(_path),
          search: queryTosearch(query),
          action: 'RELAUNCH'
        };
      }
    }

    return curLocation;
  },
  onRouteChange: function onRouteChange(callback) {
    return eventBus.addListener(callback);
  }
};

if (process.env.TARO_ENV === 'h5') {
  TaroRouter = require('@tarojs/router');

  beforeOnShow = function beforeOnShow() {
    return undefined;
  };
} else {
  TaroRouter = {};
  var prevPageInfo;

  beforeOnShow = function beforeOnShow() {
    var arr = Taro.getCurrentPages();
    var currentPage = arr[arr.length - 1];
    var currentPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
    };
    curLocation = {
      pathname: currentPageInfo.pathname,
      search: currentPageInfo.search,
      action: 'RELAUNCH'
    };

    if (prevPageInfo) {
      var action = 'PUSH';

      if (currentPageInfo.count < prevPageInfo.count) {
        action = 'POP';
      } else if (currentPageInfo.count === prevPageInfo.count) {
        if (currentPageInfo.count === 1) {
          action = 'RELAUNCH';
        } else {
          action = 'REPLACE';
        }
      }

      curLocation.action = action;
    }

    prevPageInfo = {
      count: currentPageInfo.count
    };
  };
}

export function onShow() {
  beforeOnShow();
  eventBus.dispatch(taroHistory.getLocation());
}