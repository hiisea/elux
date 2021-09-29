import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseEluxRouter, BaseNativeRouter, setRouteConfig } from '@elux/route';
import { createBrowserHistory } from 'history';
import { env } from '@elux/core';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: true
  }
});

function createServerHistory() {
  return {
    push: function push() {
      return undefined;
    },
    replace: function replace() {
      return undefined;
    },
    go: function go() {
      return undefined;
    },
    block: function block() {
      return function () {
        return undefined;
      };
    }
  };
}

export var BrowserNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter() {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "_unlistenHistory", void 0);

    _defineProperty(_assertThisInitialized(_this), "_history", void 0);

    if (env.isServer) {
      _this._history = createServerHistory();
    } else {
      _this._history = createBrowserHistory();
    }

    _this._unlistenHistory = _this._history.block(function (locationData, action) {
      if (action === 'POP') {
        env.setTimeout(function () {
          return _this.eluxRouter.back(1);
        }, 100);
        return false;
      }

      var key = _this.getKey(locationData);

      var changed = _this.onChange(key);

      if (changed) {
        var _locationData$pathnam = locationData.pathname,
            pathname = _locationData$pathnam === void 0 ? '' : _locationData$pathnam,
            _locationData$search = locationData.search,
            search = _locationData$search === void 0 ? '' : _locationData$search;

        var _url = ['n:/', pathname, search].join('');

        var _callback;

        if (action === 'REPLACE') {
          _callback = function _callback() {
            return _this.eluxRouter.replace(_url);
          };
        } else if (action === 'PUSH') {
          _callback = function _callback() {
            return _this.eluxRouter.push(_url);
          };
        } else {
          _callback = function _callback() {
            return _this.eluxRouter.relaunch(_url);
          };
        }

        env.setTimeout(_callback, 100);
        return false;
      }

      return undefined;
    });
    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.getKey = function getKey(locationData) {
    return locationData.state || '';
  };

  _proto.push = function push(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  };

  _proto.replace = function replace(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(location, key) {
    if (!env.isServer) {
      this._history.push(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  };

  _proto.back = function back(location, n, key) {
    if (!env.isServer) {
      this._history.replace(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);
export var EluxRouter = function (_BaseEluxRouter) {
  _inheritsLoose(EluxRouter, _BaseEluxRouter);

  function EluxRouter(nativeUrl, browserNativeRouter, nativeData) {
    return _BaseEluxRouter.call(this, nativeUrl, browserNativeRouter, nativeData) || this;
  }

  return EluxRouter;
}(BaseEluxRouter);
export function createRouter(nativeUrl, nativeData) {
  var browserNativeRouter = new BrowserNativeRouter();
  var router = new EluxRouter(nativeUrl, browserNativeRouter, nativeData);
  return router;
}