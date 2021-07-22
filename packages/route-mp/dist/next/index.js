import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { nativeLocationToNativeUrl, BaseRouter, BaseNativeRouter } from '@elux/route';
export class MPNativeRouter extends BaseNativeRouter {
  constructor(routeENV, tabPages) {
    super();

    _defineProperty(this, "_unlistenHistory", void 0);

    this.routeENV = routeENV;
    this.tabPages = tabPages;
    this._unlistenHistory = routeENV.onRouteChange((pathname, searchData, action) => {
      let key = searchData ? searchData['__key__'] : '';

      if (action === 'POP' && !key) {
        key = this.router.history.getRecord(-1).key;
      }

      const nativeLocation = {
        pathname,
        searchData
      };
      const changed = this.onChange(key);

      if (changed) {
        let index = -1;

        if (action === 'POP') {
          index = this.router.findHistoryIndexByKey(key);
        }

        if (index > -1) {
          this.router.back(index + 1, '', false, true);
        } else if (action === 'REPLACE') {
          this.router.replace(nativeLocation, false, true);
        } else if (action === 'PUSH') {
          this.router.push(nativeLocation, false, true);
        } else {
          this.router.relaunch(nativeLocation, false, true);
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