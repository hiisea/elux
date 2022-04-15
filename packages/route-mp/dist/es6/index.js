import { BaseNativeRouter, locationToUrl, routeConfig, setRouteConfig } from '@elux/route';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: false
  }
});
export class MPNativeRouter extends BaseNativeRouter {
  constructor(history, nativeRequest) {
    super(nativeRequest);
    this.unlistenHistory = void 0;
    this.history = history;
    const {
      window,
      page
    } = routeConfig.NotifyNativeRouter;

    if (window || page) {
      this.unlistenHistory = history.onRouteChange((pathname, search, action) => {
        const url = [pathname, search].filter(Boolean).join('?');
        const arr = search.match(/__key__=(\w+)/);
        let key = arr ? arr[1] : '';

        if (action === 'POP' && !key) {
          const {
            record
          } = this.router.findRecordByStep(-1, false);
          key = record.key;
        }

        if (key !== this.router.routeKey) {
          if (action === 'POP') {
            this.router.back(key, 'window', null, '', true);
          } else if (action === 'REPLACE') {
            this.router.replace({
              url
            }, 'window', null, true);
          } else if (action === 'PUSH') {
            this.router.push({
              url
            }, 'window', null, true);
          } else {
            this.router.relaunch({
              url
            }, 'window', null, true);
          }
        }
      });
    }
  }

  addKey(url, key) {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  _push(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  push(location, key) {
    return this.history.navigateTo({
      url: this.addKey(location.url, key)
    });
  }

  _replace(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'replace' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  replace(location, key) {
    return this.history.redirectTo({
      url: this.addKey(location.url, key)
    });
  }

  relaunch(location, key) {
    if (this.history.isTabPage(location.pathname)) {
      return this.history.switchTab({
        url: location.url
      });
    }

    return this.history.reLaunch({
      url: this.addKey(location.url, key)
    });
  }

  back(location, key, index) {
    return this.history.navigateBack({
      delta: index[0]
    });
  }

  destroy() {
    this.unlistenHistory && this.unlistenHistory();
  }

}
export function createRouter(history) {
  const nativeRequest = {
    request: {
      url: locationToUrl(history.getLocation())
    },
    response: {}
  };
  const mpNativeRouter = new MPNativeRouter(history, nativeRequest);
  return mpNativeRouter.router;
}