import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { BaseRouter, BaseNativeRouter, setRouteConfig } from '@elux/route';
import { createBrowserHistory, createHashHistory, createMemoryHistory } from 'history';
import { env } from '@elux/core';
setRouteConfig({
  notifyNativeRouter: {
    root: true,
    internal: true
  }
});
export var BrowserNativeRouter = function (_BaseNativeRouter) {
  _inheritsLoose(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(createHistory) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "_unlistenHistory", void 0);

    _defineProperty(_assertThisInitialized(_this), "history", void 0);

    _defineProperty(_assertThisInitialized(_this), "serverSide", false);

    if (createHistory === 'Hash') {
      _this.history = createHashHistory();
    } else if (createHistory === 'Memory') {
      _this.history = createMemoryHistory();
    } else if (createHistory === 'Browser') {
      _this.history = createBrowserHistory();
    } else {
      _this.serverSide = true;

      var _createHistory$split = createHistory.split('?'),
          pathname = _createHistory$split[0],
          _createHistory$split$ = _createHistory$split[1],
          search = _createHistory$split$ === void 0 ? '' : _createHistory$split$;

      _this.history = {
        action: 'PUSH',
        length: 0,
        listen: function listen() {
          return function () {
            return undefined;
          };
        },
        createHref: function createHref() {
          return '';
        },
        push: function push() {
          return undefined;
        },
        replace: function replace() {
          return undefined;
        },
        go: function go() {
          return undefined;
        },
        goBack: function goBack() {
          return undefined;
        },
        goForward: function goForward() {
          return undefined;
        },
        block: function block() {
          return function () {
            return undefined;
          };
        },
        location: {
          pathname: pathname,
          search: search && "?" + search,
          hash: ''
        }
      };
    }

    _this._unlistenHistory = _this.history.block(function (location, action) {
      var _location$pathname = location.pathname,
          pathname = _location$pathname === void 0 ? '' : _location$pathname,
          _location$search = location.search,
          search = _location$search === void 0 ? '' : _location$search,
          _location$hash = location.hash,
          hash = _location$hash === void 0 ? '' : _location$hash;
      var url = [pathname, search, hash].join('');

      var key = _this.getKey(location);

      var changed = _this.onChange(key);

      if (changed) {
        var index = 0;
        var callback;

        if (action === 'POP') {
          index = _this.router.getHistory().findIndex(key);
        }

        if (index > 0) {
          callback = function callback() {
            return _this.router.back(index);
          };
        } else if (action === 'REPLACE') {
          callback = function callback() {
            return _this.router.replace(url);
          };
        } else if (action === 'PUSH') {
          callback = function callback() {
            return _this.router.push(url);
          };
        } else {
          callback = function callback() {
            return _this.router.relaunch(url);
          };
        }

        callback && env.setTimeout(callback, 50);
        return false;
      }

      return undefined;
    });
    return _this;
  }

  var _proto = BrowserNativeRouter.prototype;

  _proto.getUrl = function getUrl() {
    var _this$history$locatio = this.history.location,
        _this$history$locatio2 = _this$history$locatio.pathname,
        pathname = _this$history$locatio2 === void 0 ? '' : _this$history$locatio2,
        _this$history$locatio3 = _this$history$locatio.search,
        search = _this$history$locatio3 === void 0 ? '' : _this$history$locatio3,
        _this$history$locatio4 = _this$history$locatio.hash,
        hash = _this$history$locatio4 === void 0 ? '' : _this$history$locatio4;
    return [pathname, search, hash].join('');
  };

  _proto.getKey = function getKey(location) {
    return location.state || '';
  };

  _proto.passive = function passive(url, key, action) {
    return true;
  };

  _proto.refresh = function refresh() {
    this.history.go(0);
  };

  _proto.push = function push(getNativeData, key) {
    if (!this.serverSide) {
      var nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  };

  _proto.replace = function replace(getNativeData, key) {
    if (!this.serverSide) {
      var nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(getNativeData, key) {
    if (!this.serverSide) {
      var nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  };

  _proto.back = function back(getNativeData, n, key) {
    if (!this.serverSide) {
      var nativeData = getNativeData();
      this.history.go(-n);
      return nativeData;
    }

    return undefined;
  };

  _proto.toOutside = function toOutside(url) {
    this.history.push(url);
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  return BrowserNativeRouter;
}(BaseNativeRouter);
export var Router = function (_BaseRouter) {
  _inheritsLoose(Router, _BaseRouter);

  function Router(browserNativeRouter, locationTransform) {
    return _BaseRouter.call(this, browserNativeRouter.getUrl(), browserNativeRouter, locationTransform) || this;
  }

  return Router;
}(BaseRouter);
export function createRouter(createHistory, locationTransform) {
  var browserNativeRouter = new BrowserNativeRouter(createHistory);
  var router = new Router(browserNativeRouter, locationTransform);
  return router;
}