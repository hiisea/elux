import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseEluxRouter, BaseNativeRouter, setRouteConfig, routeConfig, urlParser } from '@elux/route';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: false
  }
});
export var MPNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(MPNativeRouter, _BaseNativeRouter);

  function MPNativeRouter(_history, tabPages) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "_unlistenHistory", void 0);

    _this._history = _history;
    _this.tabPages = tabPages;
    var _routeConfig$notifyNa = routeConfig.notifyNativeRouter,
        root = _routeConfig$notifyNa.root,
        internal = _routeConfig$notifyNa.internal;

    if (root || internal) {
      _this._unlistenHistory = _history.onRouteChange(function (pathname, search, action) {
        var nativeUrl = [pathname, search].filter(Boolean).join('?');
        var arr = search.match(/__key__=(\w+)/);
        var key = arr ? arr[1] : '';

        if (action === 'POP' && !key) {
          var _this$router$findReco = _this.router.findRecordByStep(-1, false),
              record = _this$router$findReco.record;

          key = record.key;
        }

        var changed = _this.onChange(key);

        if (changed) {
          if (action === 'POP') {
            _this.router.back(key, true, {}, true, true);
          } else if (action === 'REPLACE') {
            _this.router.replace(nativeUrl, true, true, true);
          } else if (action === 'PUSH') {
            _this.router.push(nativeUrl, true, true, true);
          } else {
            _this.router.relaunch(nativeUrl, true, true, true);
          }
        }
      });
    }

    return _this;
  }

  var _proto = MPNativeRouter.prototype;

  _proto.addKey = function addKey(url, key) {
    return url.indexOf('?') > -1 ? url + "&__key__=" + key : url + "?__key__=" + key;
  };

  _proto.push = function push(location, key) {
    var nativeUrl = location.getNativeUrl(true);

    var _nativeUrl$split = nativeUrl.split('?'),
        pathname = _nativeUrl$split[0];

    if (this.tabPages[pathname]) {
      return Promise.reject("Replacing 'push' with 'relaunch' for TabPage: " + pathname);
    }

    return this._history.navigateTo({
      url: this.addKey(nativeUrl, key)
    });
  };

  _proto.replace = function replace(location, key) {
    var nativeUrl = location.getNativeUrl(true);

    var _nativeUrl$split2 = nativeUrl.split('?'),
        pathname = _nativeUrl$split2[0];

    if (this.tabPages[pathname]) {
      return Promise.reject("Replacing 'replace' with 'relaunch' for TabPage: " + pathname);
    }

    return this._history.redirectTo({
      url: this.addKey(nativeUrl, key)
    });
  };

  _proto.relaunch = function relaunch(location, key) {
    var nativeUrl = location.getNativeUrl(true);

    var _nativeUrl$split3 = nativeUrl.split('?'),
        pathname = _nativeUrl$split3[0];

    if (this.tabPages[pathname]) {
      return this._history.switchTab({
        url: pathname
      });
    }

    return this._history.reLaunch({
      url: this.addKey(nativeUrl, key)
    });
  };

  _proto.back = function back(location, index, key) {
    return this._history.navigateBack({
      delta: index[0]
    });
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory && this._unlistenHistory();
  };

  return MPNativeRouter;
}(BaseNativeRouter);
export var EluxRouter = function (_BaseEluxRouter) {
  _inheritsLoose(EluxRouter, _BaseEluxRouter);

  function EluxRouter(nativeUrl, mpNativeRouter) {
    return _BaseEluxRouter.call(this, nativeUrl, mpNativeRouter, {}) || this;
  }

  return EluxRouter;
}(BaseEluxRouter);
export function createRouter(mpHistory, tabPages) {
  var mpNativeRouter = new MPNativeRouter(mpHistory, tabPages);

  var _mpHistory$getLocatio = mpHistory.getLocation(),
      pathname = _mpHistory$getLocatio.pathname,
      search = _mpHistory$getLocatio.search;

  var router = new EluxRouter(urlParser.getUrl('n', pathname, search), mpNativeRouter);
  return router;
}