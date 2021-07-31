import Taro from '@tarojs/taro';
import { SingleDispatcher } from '@elux/core';
import { nativeUrlToNativeLocation } from '@elux/route';
export const eventBus = new SingleDispatcher();
export const tabPages = {};

function queryToData(query = {}) {
  return Object.keys(query).reduce((params, key) => {
    if (!params) {
      params = {};
    }

    params[key] = decodeURIComponent(query[key]);
    return params;
  }, undefined);
}

function routeToUrl(path, query = {}) {
  path = `/${path.replace(/^\/+|\/+$/g, '')}`;
  const parts = [];
  Object.keys(query).forEach(key => {
    parts.push(`${key}=${query[key]}`);
  });
  const queryString = parts.join('&');
  return queryString ? `${path}?${queryString}` : path;
}

let prevPagesInfo;

function patchPageOptions(pageOptions) {
  const onShow = pageOptions.onShow;

  pageOptions.onShow = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    const currentPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options)
    };

    if (prevPagesInfo) {
      let action = 'PUSH';
      const curPathname = `/${currentPage.route.replace(/^\/+|\/+$/g, '')}`;

      if (currentPagesInfo.count < prevPagesInfo.count) {
        action = 'POP';
      } else if (currentPagesInfo.count === prevPagesInfo.count) {
        if (currentPagesInfo.count === 1) {
          action = 'RELAUNCH';
        } else {
          action = 'REPLACE';
        }
      }

      eventBus.dispatch({
        pathname: curPathname,
        searchData: queryToData(currentPage.options),
        action
      });
    }

    return onShow == null ? void 0 : onShow.call(this);
  };

  const onHide = pageOptions.onHide;

  pageOptions.onHide = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options)
    };
    return onHide == null ? void 0 : onHide.call(this);
  };

  const onUnload = pageOptions.onUnload;

  pageOptions.onUnload = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options)
    };
    return onUnload == null ? void 0 : onUnload.call(this);
  };
}

export const routeENV = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,
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
      pathname: `/${path.replace(/^\/+|\/+$/g, '')}`,
      searchData: queryToData(query)
    };
  },

  onRouteChange(callback) {
    return eventBus.addListener(data => {
      const {
        pathname,
        searchData,
        action
      } = data;
      callback(pathname, searchData, action);
    });
  }

};

if (process.env.TARO_ENV === 'h5') {
  const taroRouter = require('@tarojs/router');

  routeENV.getLocation = () => {
    const {
      pathname,
      search
    } = taroRouter.history.location;
    const nativeLocation = nativeUrlToNativeLocation(pathname + search);
    return {
      pathname: nativeLocation.pathname,
      searchData: nativeLocation.searchData
    };
  };

  routeENV.onRouteChange = callback => {
    const unhandle = taroRouter.history.listen(({
      location,
      action
    }) => {
      const nativeLocation = nativeUrlToNativeLocation([location.pathname, location.search].join(''));
      let routeAction = action;

      if (action !== 'POP' && tabPages[nativeLocation.pathname]) {
        routeAction = 'RELAUNCH';
      }

      callback(nativeLocation.pathname, nativeLocation.searchData, routeAction);
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