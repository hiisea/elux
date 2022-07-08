import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import { BaseNativeRouter, nativeUrlToUrl, routeConfig, setRouteConfig } from '@elux/route';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: false
  }
});
export var MPNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(MPNativeRouter, _BaseNativeRouter);

  function MPNativeRouter(history) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    _this.unlistenHistory = void 0;
    _this.history = history;
    var _routeConfig$NotifyNa = routeConfig.NotifyNativeRouter,
        window = _routeConfig$NotifyNa.window,
        page = _routeConfig$NotifyNa.page;

    if (window || page) {
      _this.unlistenHistory = history.onRouteChange(function (_ref) {
        var pathname = _ref.pathname,
            search = _ref.search,
            action = _ref.action;
        var key = _this.routeKey;

        if (!key) {
          var nativeUrl = [pathname, search].filter(Boolean).join('?');
          var url = nativeUrlToUrl(nativeUrl);

          if (action === 'POP') {
            var arr = ("?" + search).match(/[?&]__k=(\w+)/);
            key = arr ? arr[1] : '';

            if (!key) {
              _this.router.back(-1, 'page', undefined, undefined, true);
            } else {
              _this.router.back(key, 'page', undefined, undefined, true);
            }
          } else if (action === 'REPLACE') {
            _this.router.replace({
              url: url
            }, 'window', undefined, true);
          } else if (action === 'PUSH') {
            _this.router.push({
              url: url
            }, 'window', undefined, true);
          } else {
            _this.router.relaunch({
              url: url
            }, 'window', undefined, true);
          }
        } else {
          _this.onSuccess();
        }
      });
    }

    return _this;
  }

  var _proto = MPNativeRouter.prototype;

  _proto.addKey = function addKey(url, key) {
    return url.indexOf('?') > -1 ? url.replace(/[?&]__k=(\w+)/, '') + "&__k=" + key : url + "?__k=" + key;
  };

  _proto.init = function init(location, key) {
    return true;
  };

  _proto._push = function _push(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw "Replacing 'push' with 'relaunch' for TabPage: " + location.pathname;
    }
  };

  _proto.push = function push(location, key) {
    this.history.navigateTo({
      url: this.addKey(location.url, key)
    });
    return true;
  };

  _proto._replace = function _replace(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw "Replacing 'replace' with 'relaunch' for TabPage: " + location.pathname;
    }
  };

  _proto.replace = function replace(location, key) {
    this.history.redirectTo({
      url: this.addKey(location.url, key)
    });
    return true;
  };

  _proto.relaunch = function relaunch(location, key) {
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
  };

  _proto.back = function back(location, key, index) {
    this.history.navigateBack({
      delta: index[0]
    });
    return true;
  };

  _proto.destroy = function destroy() {
    this.unlistenHistory && this.unlistenHistory();
  };

  return MPNativeRouter;
}(BaseNativeRouter);
export function createRouter(history) {
  var mpNativeRouter = new MPNativeRouter(history);
  return mpNativeRouter.router;
}