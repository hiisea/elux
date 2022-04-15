import Taro from '@tarojs/taro';
import { env, SingleDispatcher, setCoreConfig } from '@elux/core';
setCoreConfig({
  SetPageTitle: title => Taro.setNavigationBarTitle({
    title
  })
});
export const eventBus = new SingleDispatcher();

function routeToPathname(route) {
  return `/${route.replace(/^\/+|\/+$/g, '')}`;
}

function queryTosearch(query = {}) {
  const parts = [];
  Object.keys(query).forEach(key => {
    parts.push(`${key}=${query[key]}`);
  });
  return parts.join('&');
}

let prevPageInfo;

function patchPageOptions(pageOptions) {
  const onShow = pageOptions.onShow;

  pageOptions.onShow = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    const currentPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
    };

    if (prevPageInfo) {
      let action = 'PUSH';

      if (currentPageInfo.count < prevPageInfo.count) {
        action = 'POP';
      } else if (currentPageInfo.count === prevPageInfo.count) {
        if (currentPageInfo.count === 1) {
          action = 'RELAUNCH';
        } else {
          action = 'REPLACE';
        }
      }

      eventBus.dispatch({
        pathname: currentPageInfo.pathname,
        search: currentPageInfo.search,
        action
      });
    }

    return onShow == null ? void 0 : onShow.call(this);
  };

  const onHide = pageOptions.onHide;

  pageOptions.onHide = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
    };
    return onHide == null ? void 0 : onHide.call(this);
  };

  const onUnload = pageOptions.onUnload;

  pageOptions.onUnload = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options)
    };
    return onUnload == null ? void 0 : onUnload.call(this);
  };
}

let tabPages = undefined;
export const taroHistory = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,
  isTabPage: pathname => {
    if (!tabPages) {
      if (env.__taroAppConfig.tabBar) {
        tabPages = env.__taroAppConfig.tabBar.list.reduce((obj, item) => {
          obj[routeToPathname(item.pagePath)] = true;
          return obj;
        }, {});
      } else {
        tabPages = {};
      }
    }

    return !!tabPages[pathname];
  },
  getLocation: () => {
    const arr = Taro.getCurrentPages();
    let path;
    let query;

    if (arr.length === 0) {
      ({
        path,
        query
      } = Taro.getLaunchOptionsSync());
    } else {
      const current = arr[arr.length - 1];
      path = current.route;
      query = current.options;
    }

    return {
      pathname: routeToPathname(path),
      search: queryTosearch(query)
    };
  },

  onRouteChange(callback) {
    return eventBus.addListener(data => {
      const {
        pathname,
        search,
        action
      } = data;
      callback(pathname, search, action);
    });
  }

};

if (process.env.TARO_ENV === 'h5') {
  const taroRouter = require('@tarojs/router');

  taroHistory.getLocation = () => {
    const {
      pathname,
      search
    } = taroRouter.history.location;
    return {
      pathname,
      search: search.replace(/^\?/, '')
    };
  };

  taroHistory.onRouteChange = callback => {
    const unhandle = taroRouter.history.listen(({
      location,
      action
    }) => {
      let routeAction = action;

      if (action !== 'POP' && taroHistory.isTabPage(location.pathname)) {
        routeAction = 'RELAUNCH';
      }

      callback(location.pathname, location.search.replace(/^\?/, ''), routeAction);
    });
    return unhandle;
  };

  Taro.onUnhandledRejection = callback => {
    window.addEventListener('unhandledrejection', callback, false);
  };

  Taro.onError = callback => {
    window.addEventListener('error', callback, false);
  };
} else {
  if (!Taro.onUnhandledRejection) {
    Taro.onUnhandledRejection = () => undefined;
  }

  const originalPage = Page;

  Page = function (pageOptions) {
    patchPageOptions(pageOptions);
    return originalPage(pageOptions);
  };
}