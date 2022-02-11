import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseEluxRouter, BaseNativeRouter, setRouteConfig, routeConfig, urlParser } from '@elux/route';
import { env } from '@elux/core';
import { createBrowserHistory as _createBrowserHistory } from 'history';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: true
  }
});
export function createServerHistory(url) {
  var _url$split = url.split('?'),
      pathname = _url$split[0],
      search = _url$split[1];

  return {
    push: function push() {
      return undefined;
    },
    replace: function replace() {
      return undefined;
    },
    block: function block() {
      return function () {
        return undefined;
      };
    },
    location: {
      pathname: pathname,
      search: search
    }
  };
}
export function createBrowserHistory() {
  return _createBrowserHistory();
}
export var BrowserNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(_history) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "_unlistenHistory", void 0);

    _this._history = _history;
    var _routeConfig$notifyNa = routeConfig.notifyNativeRouter,
        root = _routeConfig$notifyNa.root,
        internal = _routeConfig$notifyNa.internal;

    if (root || internal) {
      _this._unlistenHistory = _this._history.block(function (locationData, action) {
        if (action === 'POP') {
          env.setTimeout(function () {
            return _this.eluxRouter.back(1);
          }, 100);
          return false;
        }

        return undefined;
      });
    }

    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.push = function push(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.replace = function replace(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.back = function back(location, index, key) {
    if (!env.isServer) {
      this._history.replace(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory && this._unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);
export function createRouter(browserHistory, nativeData) {
  var browserNativeRouter = new BrowserNativeRouter(browserHistory);
  var _browserHistory$locat = browserHistory.location,
      pathname = _browserHistory$locat.pathname,
      search = _browserHistory$locat.search;
  return new BaseEluxRouter(urlParser.getUrl('n', pathname, search), browserNativeRouter, nativeData);
}