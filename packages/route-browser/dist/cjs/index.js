"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createRouter = createRouter;
exports.EluxRouter = exports.BrowserNativeRouter = void 0;

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

var BrowserNativeRouter = function (_BaseNativeRouter) {
  (0, _inheritsLoose2.default)(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter() {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_unlistenHistory", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_history", void 0);

    if (_core.env.isServer) {
      _this._history = createServerHistory();
    } else {
      _this._history = (0, _history.createBrowserHistory)();
    }

    _this._unlistenHistory = _this._history.block(function (locationData, action) {
      if (action === 'POP') {
        _core.env.setTimeout(function () {
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

        _core.env.setTimeout(_callback, 100);

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
    if (!_core.env.isServer) {
      this._history.push(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  };

  _proto.replace = function replace(location, key) {
    if (!_core.env.isServer) {
      this._history.push(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(location, key) {
    if (!_core.env.isServer) {
      this._history.push(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  };

  _proto.back = function back(location, n, key) {
    if (!_core.env.isServer) {
      this._history.replace(location.getNativeUrl(true), key);

      return true;
    }

    return undefined;
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  return BrowserNativeRouter;
}(_route.BaseNativeRouter);

exports.BrowserNativeRouter = BrowserNativeRouter;

var EluxRouter = function (_BaseEluxRouter) {
  (0, _inheritsLoose2.default)(EluxRouter, _BaseEluxRouter);

  function EluxRouter(nativeUrl, browserNativeRouter, nativeData) {
    return _BaseEluxRouter.call(this, nativeUrl, browserNativeRouter, nativeData) || this;
  }

  return EluxRouter;
}(_route.BaseEluxRouter);

exports.EluxRouter = EluxRouter;

function createRouter(nativeUrl, nativeData) {
  var browserNativeRouter = new BrowserNativeRouter();
  var router = new EluxRouter(nativeUrl, browserNativeRouter, nativeData);
  return router;
}