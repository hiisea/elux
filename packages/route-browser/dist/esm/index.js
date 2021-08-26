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

  function BrowserNativeRouter(url) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "_unlistenHistory", void 0);

    _defineProperty(_assertThisInitialized(_this), "_history", void 0);

    if (env.isServer) {
      _this._history = createServerHistory();
    } else {
      _this._history = createBrowserHistory();
    }

    _this._unlistenHistory = _this._history.block(function (location, action) {
      if (action === 'POP') {
        env.setTimeout(function () {
          return _this.eluxRouter.back(1);
        }, 100);
        return false;
      }

      var key = _this.getKey(location);

      var changed = _this.onChange(key);

      if (changed) {
        var _location$pathname = location.pathname,
            pathname = _location$pathname === void 0 ? '' : _location$pathname,
            _location$search = location.search,
            search = _location$search === void 0 ? '' : _location$search,
            _location$hash = location.hash,
            hash = _location$hash === void 0 ? '' : _location$hash;

        var _url = [pathname, search, hash].join('');

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

  _proto.getKey = function getKey(location) {
    return location.state || '';
  };

  _proto.push = function push(getNativeData, key) {
    if (!env.isServer) {
      var nativeData = getNativeData();

      this._history.push(nativeData.nativeUrl, key);

      return nativeData;
    }

    return undefined;
  };

  _proto.replace = function replace(getNativeData, key) {
    if (!env.isServer) {
      var nativeData = getNativeData();

      this._history.push(nativeData.nativeUrl, key);

      return nativeData;
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(getNativeData, key) {
    if (!env.isServer) {
      var nativeData = getNativeData();

      this._history.push(nativeData.nativeUrl, key);

      return nativeData;
    }

    return undefined;
  };

  _proto.back = function back(getNativeData, n, key) {
    if (!env.isServer) {
      var nativeData = getNativeData();

      this._history.replace(nativeData.nativeUrl, key);

      return nativeData;
    }

    return undefined;
  };

  _proto.toOutside = function toOutside(url) {
    this._history.push(url, '');
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);
export var EluxRouter = function (_BaseEluxRouter) {
  _inheritsLoose(EluxRouter, _BaseEluxRouter);

  function EluxRouter(url, browserNativeRouter, locationTransform, nativeData) {
    return _BaseEluxRouter.call(this, url, browserNativeRouter, locationTransform, nativeData) || this;
  }

  return EluxRouter;
}(BaseEluxRouter);
export function createRouter(url, locationTransform, nativeData) {
  var browserNativeRouter = new BrowserNativeRouter(url);
  var router = new EluxRouter(url, browserNativeRouter, locationTransform, nativeData);
  return router;
}