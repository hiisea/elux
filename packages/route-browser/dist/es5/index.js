import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import { createBrowserHistory } from 'history';
import { env } from '@elux/core';
import { BaseNativeRouter, locationToUrl, routeConfig, setRouteConfig } from '@elux/route';
setRouteConfig({
  NotifyNativeRouter: {
    window: true,
    page: true
  }
});

function createServerHistory(nativeRequest) {
  var _nativeRequest$reques = nativeRequest.request.url.split(/[?#]/),
      pathname = _nativeRequest$reques[0],
      _nativeRequest$reques2 = _nativeRequest$reques[1],
      search = _nativeRequest$reques2 === void 0 ? '' : _nativeRequest$reques2,
      _nativeRequest$reques3 = _nativeRequest$reques[2],
      hash = _nativeRequest$reques3 === void 0 ? '' : _nativeRequest$reques3;

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

  function BrowserNativeRouter(history, nativeRequest) {
    var _this;

    _this = _BaseNativeRouter.call(this, nativeRequest) || this;
    _this.unlistenHistory = void 0;
    _this.history = history;
    var _routeConfig$NotifyNa = routeConfig.NotifyNativeRouter,
        window = _routeConfig$NotifyNa.window,
        page = _routeConfig$NotifyNa.page;

    if (window || page) {
      _this.unlistenHistory = history.block(function (locationData, action) {
        if (action === 'POP') {
          env.setTimeout(function () {
            return _this.router.back(1);
          }, 0);
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
    this.history.push(location);
    return false;
  };

  _proto.replace = function replace(location, key) {
    this.history.push(location);
    return false;
  };

  _proto.relaunch = function relaunch(location, key) {
    this.history.push(location);
    return false;
  };

  _proto.back = function back(location, key, index) {
    this.history.replace(location);
    return false;
  };

  _proto.destroy = function destroy() {
    this.unlistenHistory && this.unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);

export function createClientRouter() {
  var history = createBrowserHistory();
  var nativeRequest = {
    request: {
      url: locationToUrl(history.location)
    },
    response: {}
  };
  var browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}
export function createServerRouter(nativeRequest) {
  var history = createServerHistory(nativeRequest);
  var browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}