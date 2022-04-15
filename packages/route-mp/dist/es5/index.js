import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import { BaseNativeRouter, locationToUrl, routeConfig, setRouteConfig } from '@elux/route';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: false
  }
});
export var MPNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(MPNativeRouter, _BaseNativeRouter);

  function MPNativeRouter(history, nativeRequest) {
    var _this;

    _this = _BaseNativeRouter.call(this, nativeRequest) || this;
    _this.unlistenHistory = void 0;
    _this.history = history;
    var _routeConfig$NotifyNa = routeConfig.NotifyNativeRouter,
        window = _routeConfig$NotifyNa.window,
        page = _routeConfig$NotifyNa.page;

    if (window || page) {
      _this.unlistenHistory = history.onRouteChange(function (pathname, search, action) {
        var url = [pathname, search].filter(Boolean).join('?');
        var arr = search.match(/__key__=(\w+)/);
        var key = arr ? arr[1] : '';

        if (action === 'POP' && !key) {
          var _this$router$findReco = _this.router.findRecordByStep(-1, false),
              record = _this$router$findReco.record;

          key = record.key;
        }

        if (key !== _this.router.routeKey) {
          if (action === 'POP') {
            _this.router.back(key, 'window', null, '', true);
          } else if (action === 'REPLACE') {
            _this.router.replace({
              url: url
            }, 'window', null, true);
          } else if (action === 'PUSH') {
            _this.router.push({
              url: url
            }, 'window', null, true);
          } else {
            _this.router.relaunch({
              url: url
            }, 'window', null, true);
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

  _proto._push = function _push(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw "Replacing 'push' with 'relaunch' for TabPage: " + location.pathname;
    }
  };

  _proto.push = function push(location, key) {
    return this.history.navigateTo({
      url: this.addKey(location.url, key)
    });
  };

  _proto._replace = function _replace(location) {
    if (this.history.isTabPage(location.pathname)) {
      throw "Replacing 'replace' with 'relaunch' for TabPage: " + location.pathname;
    }
  };

  _proto.replace = function replace(location, key) {
    return this.history.redirectTo({
      url: this.addKey(location.url, key)
    });
  };

  _proto.relaunch = function relaunch(location, key) {
    if (this.history.isTabPage(location.pathname)) {
      return this.history.switchTab({
        url: location.url
      });
    }

    return this.history.reLaunch({
      url: this.addKey(location.url, key)
    });
  };

  _proto.back = function back(location, key, index) {
    return this.history.navigateBack({
      delta: index[0]
    });
  };

  _proto.destroy = function destroy() {
    this.unlistenHistory && this.unlistenHistory();
  };

  return MPNativeRouter;
}(BaseNativeRouter);
export function createRouter(history) {
  var nativeRequest = {
    request: {
      url: locationToUrl(history.getLocation())
    },
    response: {}
  };
  var mpNativeRouter = new MPNativeRouter(history, nativeRequest);
  return mpNativeRouter.router;
}