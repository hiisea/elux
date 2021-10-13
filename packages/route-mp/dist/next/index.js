import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseEluxRouter, BaseNativeRouter, setRouteConfig, routeConfig, urlParser } from '@elux/route';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: false
  }
});
export class MPNativeRouter extends BaseNativeRouter {
  constructor(_history, tabPages) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    this._history = _history;
    this.tabPages = tabPages;
    const {
      root,
      internal
    } = routeConfig.notifyNativeRouter;

    if (root || internal) {
      this._unlistenHistory = _history.onRouteChange((pathname, search, action) => {
        const nativeUrl = [pathname, search].filter(Boolean).join('?');
        const arr = search.match(/__key__=(\w+)/);
        let key = arr ? arr[1] : '';

        if (action === 'POP' && !key) {
          const {
            record
          } = this.router.findRecordByStep(-1, false);
          key = record.key;
        }

        const changed = this.onChange(key);

        if (changed) {
          if (action === 'POP') {
            this.router.back(key, true, {}, true, true);
          } else if (action === 'REPLACE') {
            this.router.replace(nativeUrl, true, true, true);
          } else if (action === 'PUSH') {
            this.router.push(nativeUrl, true, true, true);
          } else {
            this.router.relaunch(nativeUrl, true, true, true);
          }
        }
      });
    }
  }

  addKey(url, key) {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  push(location, key) {
    const nativeUrl = location.getNativeUrl(true);
    const [pathname] = nativeUrl.split('?');

    if (this.tabPages[pathname]) {
      return Promise.reject(`Replacing 'push' with 'relaunch' for TabPage: ${pathname}`);
    }

    return this._history.navigateTo({
      url: this.addKey(nativeUrl, key)
    });
  }

  replace(location, key) {
    const nativeUrl = location.getNativeUrl(true);
    const [pathname] = nativeUrl.split('?');

    if (this.tabPages[pathname]) {
      return Promise.reject(`Replacing 'replace' with 'relaunch' for TabPage: ${pathname}`);
    }

    return this._history.redirectTo({
      url: this.addKey(nativeUrl, key)
    });
  }

  relaunch(location, key) {
    const nativeUrl = location.getNativeUrl(true);
    const [pathname] = nativeUrl.split('?');

    if (this.tabPages[pathname]) {
      return this._history.switchTab({
        url: pathname
      });
    }

    return this._history.reLaunch({
      url: this.addKey(nativeUrl, key)
    });
  }

  back(location, index, key) {
    return this._history.navigateBack({
      delta: index[0]
    });
  }

  destroy() {
    this._unlistenHistory && this._unlistenHistory();
  }

}
export class EluxRouter extends BaseEluxRouter {
  constructor(nativeUrl, mpNativeRouter) {
    super(nativeUrl, mpNativeRouter, {});
  }

}
export function createRouter(mpHistory, tabPages) {
  const mpNativeRouter = new MPNativeRouter(mpHistory, tabPages);
  const {
    pathname,
    search
  } = mpHistory.getLocation();
  const router = new EluxRouter(urlParser.getUrl('n', pathname, search), mpNativeRouter);
  return router;
}