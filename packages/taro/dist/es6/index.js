import { env, setCoreConfig, SingleDispatcher } from '@elux/core';
import Taro from '@tarojs/taro';
setCoreConfig({
  SetPageTitle: title => Taro.setNavigationBarTitle({
    title
  })
});
let TaroRouter;
let beforeOnShow;
let tabPages = undefined;
let curLocation;
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

export const taroHistory = {
  reLaunch: Taro.reLaunch,
  redirectTo: Taro.redirectTo,
  navigateTo: Taro.navigateTo,
  navigateBack: Taro.navigateBack,
  switchTab: Taro.switchTab,

  isTabPage(pathname) {
    if (!tabPages) {
      const tabConfig = env.__taroAppConfig.tabBar;

      if (tabConfig) {
        tabPages = (tabConfig.list || tabConfig.items).reduce((obj, item) => {
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
        TaroRouter.history.listen(({
          location: {
            pathname,
            search
          },
          action
        }) => {
          if (action !== 'POP' && taroHistory.isTabPage(pathname)) {
            action = 'RELAUNCH';
          }

          curLocation = {
            pathname,
            search: search.replace(/^\?/, ''),
            action
          };
        });
        const {
          pathname,
          search
        } = TaroRouter.history.location;
        curLocation = {
          pathname,
          search: search.replace(/^\?/, ''),
          action: 'RELAUNCH'
        };
      } else {
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

        if (!path) {
          return {
            pathname: '',
            search: '',
            action: 'RELAUNCH'
          };
        }

        curLocation = {
          pathname: routeToPathname(path),
          search: queryTosearch(query),
          action: 'RELAUNCH'
        };
      }
    }

    return curLocation;
  },

  onRouteChange(callback) {
    return eventBus.addListener(callback);
  }

};

if (process.env.TARO_ENV === 'h5') {
  TaroRouter = require('@tarojs/router');

  beforeOnShow = () => undefined;
} else {
  TaroRouter = {};
  let prevPageInfo;

  beforeOnShow = function () {
    const arr = Taro.getCurrentPages();
    const currentPage = arr[arr.length - 1];
    const currentPageInfo = {
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