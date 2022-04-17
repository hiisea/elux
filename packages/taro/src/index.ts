import Taro from '@tarojs/taro';
import {env, SingleDispatcher, setCoreConfig} from '@elux/core';
import {IHistory, MPLocation} from '@elux/route-mp';

setCoreConfig({SetPageTitle: (title) => Taro.setNavigationBarTitle({title})});

// export interface PageConfig {
//   dispatch?(action: {type: string}): any;
//   onLoad?(options: any): void;
//   onUnload?(): void;
//   onShow?(): void;
//   onHide?(): void;
// }

// type MPLocation = {
//   pathname: string;
//   search: string;
//   action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
// };

let TaroRouter: {
  history: {
    location: {pathname: string; search: string};
    listen: (callback: (data: {location: {pathname: string; search: string}; action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH'}) => void) => () => void;
  };
};
let prevPageInfo: {
  count: number;
  pathname: string;
  search: string;
};
let tabPages: {[path: string]: boolean} | undefined = undefined;
let curLocation: MPLocation | undefined;
export const eventBus = new SingleDispatcher<MPLocation>();

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

export const taroHistory: IHistory = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,
  isTabPage(pathname) {
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
  getLocation() {
    if (!curLocation) {
      if (process.env.TARO_ENV === 'h5') {
        TaroRouter.history.listen(({location: {pathname, search}, action}) => {
          if (action !== 'POP' && taroHistory.isTabPage(pathname)) {
            action = 'RELAUNCH';
          }
          curLocation = {pathname, search: search.replace(/^\?/, ''), action};
        });
        const {pathname, search} = TaroRouter.history.location;
        curLocation = {pathname, search: search.replace(/^\?/, ''), action: 'RELAUNCH'};
      } else {
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
        curLocation = {
          pathname: routeToPathname(path),
          search: queryTosearch(query),
          action: 'RELAUNCH',
        };
      }
    }
    return curLocation;
  },
  onRouteChange(callback) {
    return eventBus.addListener(callback);
  },
};

if (process.env.TARO_ENV === 'h5') {
  TaroRouter = require('@tarojs/router');
} else {
  const originalPage = Page;
  Page = function (pageOptions) {
    const onShow = pageOptions.onShow;
    const onHide = pageOptions.onHide;
    const onUnload = pageOptions.onUnload;
    pageOptions.onShow = function () {
      const arr = Taro.getCurrentPages();
      const currentPage = arr[arr.length - 1];
      const currentPageInfo = {
        count: arr.length,
        pathname: routeToPathname(currentPage.route),
        search: queryTosearch(currentPage.options),
      };
      curLocation = {pathname: currentPageInfo.pathname, search: currentPageInfo.search, action: 'RELAUNCH'};
      if (prevPageInfo) {
        // 仅处理不能使用elux路由的原生交互：原生导航后退、原生TAB
        let action: 'POP' | 'PUSH' | 'REPLACE' | 'RELAUNCH' = 'PUSH';
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
      return onShow?.call(this);
    };
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
    return originalPage(pageOptions);
  };
}

export function onShow(): void {
  eventBus.dispatch(taroHistory.getLocation());
  //setTimout保证onChange事件发生在useDidShow钩子之后
  //env.setTimeout(() => eventBus.dispatch(taroHistory.getLocation()), 0);
}
