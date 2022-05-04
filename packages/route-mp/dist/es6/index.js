import { BaseNativeRouter, nativeUrlToUrl, routeConfig, setRouteConfig } from '@elux/route';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: false
  }
});
export class MPNativeRouter extends BaseNativeRouter {
  constructor(history) {
    super();
    this.unlistenHistory = void 0;
    this.history = history;
    const {
      window,
      page
    } = routeConfig.NotifyNativeRouter;

    if (window || page) {
      this.unlistenHistory = history.onRouteChange(({
        pathname,
        search,
        action
      }) => {
        let key = this.routeKey;

        if (!key) {
          const nativeUrl = [pathname, search].filter(Boolean).join('?');
          const url = nativeUrlToUrl(nativeUrl);

          if (action === 'POP') {
            const arr = search.match(/__=(\w+)/);
            key = arr ? arr[1] : '';

            if (!key) {
              this.router.back(-1, 'page', null, '', true);
            } else {
              this.router.back(key, 'page', null, '', true);
            }
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
        } else {
          this.onSuccess();
        }
      });
    }
  }

  addKey(url, key) {
    return url.indexOf('?') > -1 ? `${url}&__=${key}` : `${url}?__=${key}`;
  }

  init(location, key) {
    return true;
  }

  _push(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  push(location, key) {
    this.history.navigateTo({
      url: this.addKey(location.url, key)
    });
    return true;
  }

  _replace(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw `Replacing 'replace' with 'relaunch' for TabPage: ${location.pathname}`;
    }
  }

  replace(location, key) {
    this.history.redirectTo({
      url: this.addKey(location.url, key)
    });
    return true;
  }

  relaunch(location, key) {
    if (this.history.isTabPage(location.pathname)) {
      this.history.switchTab({
        url: location.url
      });
    } else {
      this.history.reLaunch({
        url: this.addKey(location.url, key)
      });
    }

    return true;
  }

  back(location, key, index) {
    this.history.navigateBack({
      delta: index[0]
    });
    return true;
  }

  destroy() {
    this.unlistenHistory && this.unlistenHistory();
  }

}
export function createRouter(history) {
  const mpNativeRouter = new MPNativeRouter(history);
  return mpNativeRouter.router;
}