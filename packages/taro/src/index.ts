/// <reference path="../runtime/runtime.d.ts" />

import Taro from '@tarojs/taro';
import {env, SingleDispatcher} from '@elux/core';
import {RouteENV} from '@elux/route-mp';

declare const window: any;

export interface PageConfig {
  dispatch?(action: {type: string}): any;
  onLoad?(options: any): void;
  onUnload?(): void;
  onShow?(): void;
  onHide?(): void;
}

type RouteChangeEventData = {
  pathname: string;
  search: string;
  action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
};

export const eventBus = new SingleDispatcher<RouteChangeEventData>();
export const tabPages: {[path: string]: boolean} = {};

function routeToPathname(route: string) {
  return `/${route.replace(/^\/+|\/+$/g, '')}`;
}
function queryTosearch(query: any = {}) {
  const parts: string[] = [];
  Object.keys(query).forEach((key) => {
    parts.push(`${key}=${query[key]}`);
  });
  return parts.join('&');
}
let prevPageInfo: {
  count: number;
  pathname: string;
  search: string;
};
function patchPageOptions(pageOptions: PageConfig) {
  const onShow = pageOptions.onShow;
  pageOptions.onShow = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    const currentPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options),
    };
    if (prevPageInfo) {
      // 仅处理不能使用elux路由的原生交互：原生导航后退、原生TAB
      let action: 'POP' | 'PUSH' | 'REPLACE' | 'RELAUNCH' = 'PUSH';
      if (currentPageInfo.count < prevPageInfo.count) {
        action = 'POP';
      } else if (currentPageInfo.count === prevPageInfo.count) {
        // const prevPathname = `/${currentPage.route.replace(/^\/+|\/+$/g, '')}`;
        // tabPages[curPathname] && tabPages[prevPathname];
        if (currentPageInfo.count === 1) {
          action = 'RELAUNCH';
        } else {
          action = 'REPLACE';
        }
      }
      eventBus.dispatch({pathname: currentPageInfo.pathname, search: currentPageInfo.search, action});
    }
    return onShow?.call(this);
  };

  const onHide = pageOptions.onHide;
  pageOptions.onHide = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options),
    };
    return onHide?.call(this);
  };

  const onUnload = pageOptions.onUnload;
  pageOptions.onUnload = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPageInfo = {
      count: arr.length,
      pathname: routeToPathname(currentPage.route),
      search: queryTosearch(currentPage.options),
    };

    return onUnload?.call(this);
  };
}

export const routeENV: RouteENV = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,
  getLocation: () => {
    const arr = Taro.getCurrentPages();
    let path: string;
    let query;
    if (arr.length === 0) {
      ({path, query} = Taro.getLaunchOptionsSync());
    } else {
      const current = arr[arr.length - 1];
      path = current.route;
      query = current.options;
    }
    return {
      pathname: routeToPathname(path),
      search: queryTosearch(query),
    };
  },
  onRouteChange(callback) {
    return eventBus.addListener((data) => {
      const {pathname, search, action} = data;
      callback(pathname, search, action);
    });
  },
};

if (process.env.TARO_ENV === 'h5') {
  const taroRouter: {
    history: {
      location: {pathname: string; search: string};
      listen: (callback: (data: {location: {pathname: string; search: string}; action: 'POP' | 'PUSH' | 'REPLACE'}) => void) => () => void;
    };
  } = require('@tarojs/router');
  routeENV.getLocation = () => {
    const {pathname, search} = taroRouter.history.location;
    return {pathname, search: search.replace(/^\?/, '')};
  };
  routeENV.onRouteChange = (callback) => {
    const unhandle = taroRouter.history.listen(({location, action}) => {
      let routeAction: 'POP' | 'PUSH' | 'REPLACE' | 'RELAUNCH' = action;
      if (action !== 'POP' && tabPages[location.pathname]) {
        routeAction = 'RELAUNCH';
      }
      callback(location.pathname, location.search.replace(/^\?/, ''), routeAction);
    });
    return unhandle;
  };
  Taro.onUnhandledRejection = (callback) => {
    window.addEventListener('unhandledrejection', callback, false);
  };
  Taro.onError = (callback) => {
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

export function getTabPages(): {[path: string]: boolean} {
  if (env.__taroAppConfig.tabBar) {
    env.__taroAppConfig.tabBar.list.forEach(({pagePath}) => {
      tabPages[routeToPathname(pagePath)] = true;
    });
  }
  return tabPages;
}
