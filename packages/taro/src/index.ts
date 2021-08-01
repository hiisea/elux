/// <reference path="../runtime/runtime.d.ts" />

import Taro from '@tarojs/taro';
import {env, SingleDispatcher} from '@elux/core';
import {RouteENV} from '@elux/route-mp';
import {nativeUrlToNativeLocation} from '@elux/route';

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
  searchData?: {
    [key: string]: string;
  };
  action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
};

export const eventBus = new SingleDispatcher<RouteChangeEventData>();
export const tabPages: {[path: string]: boolean} = {};

function queryToData(query: any = {}): {[key: string]: string} | undefined {
  return Object.keys(query).reduce((params: any, key) => {
    if (!params) {
      params = {};
    }
    params[key] = decodeURIComponent(query[key]);
    return params;
  }, undefined);
}
function routeToUrl(path: string, query: any = {}) {
  path = `/${path.replace(/^\/+|\/+$/g, '')}`;
  const parts: string[] = [];
  Object.keys(query).forEach((key) => {
    parts.push(`${key}=${query[key]}`);
  });

  const queryString = parts.join('&');
  return queryString ? `${path}?${queryString}` : path;
}
let prevPagesInfo: {
  count: number;
  lastPageUrl: string;
};
function patchPageOptions(pageOptions: PageConfig) {
  const onShow = pageOptions.onShow;
  pageOptions.onShow = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    const currentPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options),
    };
    if (prevPagesInfo) {
      // 仅处理不能使用elux路由的原生交互：原生导航后退、原生TAB
      let action: 'POP' | 'PUSH' | 'REPLACE' | 'RELAUNCH' = 'PUSH';
      const curPathname = `/${currentPage.route.replace(/^\/+|\/+$/g, '')}`;
      if (currentPagesInfo.count < prevPagesInfo.count) {
        action = 'POP';
      } else if (currentPagesInfo.count === prevPagesInfo.count) {
        // const prevPathname = `/${currentPage.route.replace(/^\/+|\/+$/g, '')}`;
        // tabPages[curPathname] && tabPages[prevPathname];
        if (currentPagesInfo.count === 1) {
          action = 'RELAUNCH';
        } else {
          action = 'REPLACE';
        }
      }
      eventBus.dispatch({pathname: curPathname, searchData: queryToData(currentPage.options), action});
    }
    return onShow?.call(this);
  };

  const onHide = pageOptions.onHide;
  pageOptions.onHide = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options),
    };
    return onHide?.call(this);
  };

  const onUnload = pageOptions.onUnload;
  pageOptions.onUnload = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    prevPagesInfo = {
      count: arr.length,
      lastPageUrl: routeToUrl(currentPage.route, currentPage.options),
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
      pathname: `/${path.replace(/^\/+|\/+$/g, '')}`,
      searchData: queryToData(query),
    };
  },
  onRouteChange(callback) {
    return eventBus.addListener((data) => {
      const {pathname, searchData, action} = data;
      callback(pathname, searchData, action);
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
    const nativeLocation = nativeUrlToNativeLocation(pathname + search);
    return {pathname: nativeLocation.pathname, searchData: nativeLocation.searchData};
  };
  routeENV.onRouteChange = (callback) => {
    const unhandle = taroRouter.history.listen(({location, action}) => {
      const nativeLocation = nativeUrlToNativeLocation([location.pathname, location.search].join(''));
      let routeAction: 'POP' | 'PUSH' | 'REPLACE' | 'RELAUNCH' = action;
      if (action !== 'POP' && tabPages[nativeLocation.pathname]) {
        routeAction = 'RELAUNCH';
      }
      callback(nativeLocation.pathname, nativeLocation.searchData, routeAction);
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
      tabPages[`/${pagePath.replace(/^\/+|\/+$/g, '')}`] = true;
    });
  }
  return tabPages;
}
