import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { nativeLocationToNativeUrl, BaseRouter, BaseNativeRouter, setRouteConfig, routeConfig } from '@elux/route';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: false
  }
});
export class MPNativeRouter extends BaseNativeRouter {
  constructor(routeENV, tabPages) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    this.routeENV = routeENV;
    this.tabPages = tabPages;
    this._unlistenHistory = routeENV.onRouteChange((pathname, search, action) => {
      const nativeUrl = [pathname, search].filter(Boolean).join('?');
      const arr = search.match(/__key__=(\w+)/);
      let key = arr ? arr[1] : '';

      if (action === 'POP' && !key) {
        key = this.router.getHistory(true).findRecord(-1).key;
      }

      const changed = this.onChange(key);

      if (changed) {
        let index = 0;

        if (action === 'POP') {
          index = this.router.getHistory(true).findIndex(key);
        }

        if (index > 0) {
          this.router.back(index, routeConfig.notifyNativeRouter.root, {
            overflowRedirect: true
          }, true);
        } else if (action === 'REPLACE') {
          this.router.replace(nativeUrl, routeConfig.notifyNativeRouter.root, true);
        } else if (action === 'PUSH') {
          this.router.push(nativeUrl, routeConfig.notifyNativeRouter.root, true);
        } else {
          this.router.relaunch(nativeUrl, routeConfig.notifyNativeRouter.root, true);
        }
      }
    });
  }

  getLocation() {
    return this.routeENV.getLocation();
  }

  toUrl(url, key) {
    return url.indexOf('?') > -1 ? `${url}&__key__=${key}` : `${url}?__key__=${key}`;
  }

  push(getNativeData, key) {
    const nativeData = getNativeData();

    if (this.tabPages[nativeData.nativeUrl]) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${nativeData.nativeUrl}`;
    }

    return this.routeENV.navigateTo({
      url: this.toUrl(nativeData.nativeUrl, key)
    }).then(() => nativeData);
  }

  replace(getNativeData, key) {
    const nativeData = getNativeData();

    if (this.tabPages[nativeData.nativeUrl]) {
      throw `Replacing 'push' with 'relaunch' for TabPage: ${nativeData.nativeUrl}`;
    }

    return this.routeENV.redirectTo({
      url: this.toUrl(nativeData.nativeUrl, key)
    }).then(() => nativeData);
  }

  relaunch(getNativeData, key) {
    const nativeData = getNativeData();

    if (this.tabPages[nativeData.nativeUrl]) {
      return this.routeENV.switchTab({
        url: nativeData.nativeUrl
      }).then(() => nativeData);
    }

    return this.routeENV.reLaunch({
      url: this.toUrl(nativeData.nativeUrl, key)
    }).then(() => nativeData);
  }

  back(getNativeData, n, key) {
    const nativeData = getNativeData();
    return this.routeENV.navigateBack({
      delta: n
    }).then(() => nativeData);
  }

  toOutside(url) {}

  destroy() {
    this._unlistenHistory();
  }

}
export class Router extends BaseRouter {
  constructor(mpNativeRouter, locationTransform) {
    super(nativeLocationToNativeUrl(mpNativeRouter.getLocation()), mpNativeRouter, locationTransform);
  }

}
export function createRouter(locationTransform, routeENV, tabPages) {
  const mpNativeRouter = new MPNativeRouter(routeENV, tabPages);
  const router = new Router(mpNativeRouter, locationTransform);
  return router;
}