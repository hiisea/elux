import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import { env } from '@elux/core';
import { BaseNativeRouter, locationToUrl, routeConfig, setRouteConfig } from '@elux/route';
import { createBrowserHistory } from 'history';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory(url) {
  var _url$split = url.split(/[?#]/),
      pathname = _url$split[0],
      _url$split$ = _url$split[1],
      search = _url$split$ === void 0 ? '' : _url$split$,
      _url$split$2 = _url$split[2],
      hash = _url$split$2 === void 0 ? '' : _url$split$2;

  return {
    push: function push() {
      return;
    },
    replace: function replace() {
      return;
    },
    block: function block() {
      return function () {
        return undefined;
      };
    },
    location: {
      pathname: pathname,
      search: search,
      hash: hash
    }
  };
}

var BrowserNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(history) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    _this.unlistenHistory = void 0;
    _this.history = history;
    var _routeConfig$NotifyNa = routeConfig.NotifyNativeRouter,
        window = _routeConfig$NotifyNa.window,
        page = _routeConfig$NotifyNa.page;

    if (window || page) {
      _this.unlistenHistory = history.block(function (locationData, action) {
        if (action === 'POP') {
          env.setTimeout(function () {
            return _this.router.back(1, 'page');
          }, 300);
          return false;
        }

        return undefined;
      });
    }

    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.init = function init(location, key) {
    return false;
  };

  _proto.push = function push(location, key) {
    this.history.push(location.url);
    return false;
  };

  _proto.replace = function replace(location, key) {
    this.history.push(location.url);
    return false;
  };

  _proto.relaunch = function relaunch(location, key) {
    this.history.push(location.url);
    return false;
  };

  _proto.back = function back(location, key, index) {
    this.history.replace(location.url);
    return false;
  };

  _proto.destroy = function destroy() {
    this.unlistenHistory && this.unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);

export function createClientRouter() {
  var history = createBrowserHistory();
  var browserNativeRouter = new BrowserNativeRouter(history);
  return {
    router: browserNativeRouter.router,
    url: locationToUrl(history.location)
  };
}
export function createServerRouter(url) {
  var history = createServerHistory(url);
  var browserNativeRouter = new BrowserNativeRouter(history);
  return browserNativeRouter.router;
}