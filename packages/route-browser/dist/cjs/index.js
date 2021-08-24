"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createRouter = createRouter;
exports.Router = exports.BrowserNativeRouter = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _route = require("@elux/route");

var _history = require("history");

var _core = require("@elux/core");

(0, _route.setRouteConfig)({
  notifyNativeRouter: {
    root: true,
    internal: true
  }
});

var BrowserNativeRouter = function (_NativeRouter) {
  (0, _inheritsLoose2.default)(BrowserNativeRouter, _NativeRouter);

  function BrowserNativeRouter(createHistory) {
    var _this;

    _this = _NativeRouter.call(this) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_unlistenHistory", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "history", void 0);

    if (createHistory === 'Hash') {
      _this.history = (0, _history.createHashHistory)();
    } else if (createHistory === 'Memory') {
      _this.history = (0, _history.createMemoryHistory)();
    } else if (createHistory === 'Browser') {
      _this.history = (0, _history.createBrowserHistory)();
    } else {
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
      if (action === 'POP') {
        _core.env.setTimeout(function () {
          return _this.eluxRouter.back(1);
        }, 100);

        return false;
      }

      var key = _this.getKey(location);

      var changed = _this.onChange(key);

      if (changed) {
        var _location$pathname = location.pathname,
            _pathname = _location$pathname === void 0 ? '' : _location$pathname,
            _location$search = location.search,
            _search = _location$search === void 0 ? '' : _location$search,
            _location$hash = location.hash,
            hash = _location$hash === void 0 ? '' : _location$hash;

        var url = [_pathname, _search, hash].join('');
        var callback;

        if (action === 'REPLACE') {
          callback = function callback() {
            return _this.eluxRouter.replace(url);
          };
        } else if (action === 'PUSH') {
          callback = function callback() {
            return _this.eluxRouter.push(url);
          };
        } else {
          callback = function callback() {
            return _this.eluxRouter.relaunch(url);
          };
        }

        _core.env.setTimeout(callback, 100);

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
    if (!_core.env.isServer) {
      var nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  };

  _proto.replace = function replace(getNativeData, key) {
    if (!_core.env.isServer) {
      var nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(getNativeData, key) {
    if (!_core.env.isServer) {
      var nativeData = getNativeData();
      this.history.push(nativeData.nativeUrl, key);
      return nativeData;
    }

    return undefined;
  };

  _proto.back = function back(getNativeData, n, key) {
    if (!_core.env.isServer) {
      var nativeData = getNativeData();
      this.history.replace(nativeData.nativeUrl, key);
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
}(_route.NativeRouter);

exports.BrowserNativeRouter = BrowserNativeRouter;

var Router = function (_EluxRouter) {
  (0, _inheritsLoose2.default)(Router, _EluxRouter);

  function Router(browserNativeRouter, locationTransform) {
    return _EluxRouter.call(this, browserNativeRouter.getUrl(), browserNativeRouter, locationTransform) || this;
  }

  return Router;
}(_route.EluxRouter);

exports.Router = Router;

function createRouter(createHistory, locationTransform) {
  var browserNativeRouter = new BrowserNativeRouter(createHistory);
  var router = new Router(browserNativeRouter, locationTransform);
  return router;
}