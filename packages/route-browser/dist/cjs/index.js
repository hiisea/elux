"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createServerHistory = createServerHistory;
exports.createBrowserHistory = createBrowserHistory;
exports.createRouter = createRouter;
exports.EluxRouter = exports.BrowserNativeRouter = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _route = require("@elux/route");

var _core = require("@elux/core");

var _history2 = require("history");

(0, _route.setRouteConfig)({
  notifyNativeRouter: {
    root: true,
    internal: true
  }
});

function createServerHistory(url) {
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

function createBrowserHistory() {
  return (0, _history2.createBrowserHistory)();
}

var BrowserNativeRouter = function (_BaseNativeRouter) {
  (0, _inheritsLoose2.default)(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(_history) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_unlistenHistory", void 0);
    _this._history = _history;
    var _routeConfig$notifyNa = _route.routeConfig.notifyNativeRouter,
        root = _routeConfig$notifyNa.root,
        internal = _routeConfig$notifyNa.internal;

    if (root || internal) {
      _this._unlistenHistory = _this._history.block(function (locationData, action) {
        if (action === 'POP') {
          _core.env.setTimeout(function () {
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
    if (!_core.env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.replace = function replace(location, key) {
    if (!_core.env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.relaunch = function relaunch(location, key) {
    if (!_core.env.isServer) {
      this._history.push(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.back = function back(location, index, key) {
    if (!_core.env.isServer) {
      this._history.replace(location.getNativeUrl(true));
    }

    return undefined;
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory && this._unlistenHistory();
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

function createRouter(browserHistory, nativeData) {
  var browserNativeRouter = new BrowserNativeRouter(browserHistory);
  var _browserHistory$locat = browserHistory.location,
      pathname = _browserHistory$locat.pathname,
      search = _browserHistory$locat.search;
  var router = new EluxRouter(_route.urlParser.getUrl('n', pathname, search), browserNativeRouter, nativeData);
  return router;
}