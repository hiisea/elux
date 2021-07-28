import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { nativeLocationToNativeUrl, BaseRouter, BaseNativeRouter, setRouteConfig } from '@elux/route';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: false
  }
});
export var MPNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(MPNativeRouter, _BaseNativeRouter);

  function MPNativeRouter(routeENV, tabPages) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "_unlistenHistory", void 0);

    _this.routeENV = routeENV;
    _this.tabPages = tabPages;
    _this._unlistenHistory = routeENV.onRouteChange(function (pathname, searchData, action) {
      var key = searchData ? searchData['__key__'] : '';

      if (action === 'POP' && !key) {
        key = _this.router.history.findRecord(-1).key;
      }

      var nativeLocation = {
        pathname: pathname,
        searchData: searchData
      };

      var changed = _this.onChange(key);

      if (changed) {
        var index = -1;

        if (action === 'POP') {
          index = _this.router.findHistoryIndexByKey(key);
        }

        if (index > -1) {
          _this.router.back(index + 1, true, true, true);
        } else if (action === 'REPLACE') {
          _this.router.replace(nativeLocation, true, true);
        } else if (action === 'PUSH') {
          _this.router.push(nativeLocation, true, true);
        } else {
          _this.router.relaunch(nativeLocation, true, true);
        }
      }
    });
    return _this;
  }

  var _proto = MPNativeRouter.prototype;

  _proto.getLocation = function getLocation() {
    return this.routeENV.getLocation();
  };

  _proto.toUrl = function toUrl(url, key) {
    return url.indexOf('?') > -1 ? url + "&__key__=" + key : url + "?__key__=" + key;
  };

  _proto.push = function push(getNativeData, key) {
    var nativeData = getNativeData();

    if (this.tabPages[nativeData.nativeUrl]) {
      throw "Replacing 'push' with 'relaunch' for TabPage: " + nativeData.nativeUrl;
    }

    return this.routeENV.navigateTo({
      url: this.toUrl(nativeData.nativeUrl, key)
    }).then(function () {
      return nativeData;
    });
  };

  _proto.replace = function replace(getNativeData, key) {
    var nativeData = getNativeData();

    if (this.tabPages[nativeData.nativeUrl]) {
      throw "Replacing 'push' with 'relaunch' for TabPage: " + nativeData.nativeUrl;
    }

    return this.routeENV.redirectTo({
      url: this.toUrl(nativeData.nativeUrl, key)
    }).then(function () {
      return nativeData;
    });
  };

  _proto.relaunch = function relaunch(getNativeData, key) {
    var nativeData = getNativeData();

    if (this.tabPages[nativeData.nativeUrl]) {
      return this.routeENV.switchTab({
        url: nativeData.nativeUrl
      }).then(function () {
        return nativeData;
      });
    }

    return this.routeENV.reLaunch({
      url: this.toUrl(nativeData.nativeUrl, key)
    }).then(function () {
      return nativeData;
    });
  };

  _proto.back = function back(getNativeData, n, key) {
    var nativeData = getNativeData();
    return this.routeENV.navigateBack({
      delta: n
    }).then(function () {
      return nativeData;
    });
  };

  _proto.toOutside = function toOutside(url) {};

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  return MPNativeRouter;
}(BaseNativeRouter);
export var Router = function (_BaseRouter) {
  _inheritsLoose(Router, _BaseRouter);

  function Router(mpNativeRouter, locationTransform) {
    return _BaseRouter.call(this, nativeLocationToNativeUrl(mpNativeRouter.getLocation()), mpNativeRouter, locationTransform) || this;
  }

  return Router;
}(BaseRouter);
export function createRouter(locationTransform, routeENV, tabPages) {
  var mpNativeRouter = new MPNativeRouter(routeENV, tabPages);
  var router = new Router(mpNativeRouter, locationTransform);
  return router;
}