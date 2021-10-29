"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.MPNativeRouter = exports.EluxRouter = void 0;
exports.createRouter = createRouter;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _route = require("@elux/route");

(0, _route.setRouteConfig)({
  notifyNativeRouter: {
    root: true,
    internal: false
  }
});

var MPNativeRouter = function (_BaseNativeRouter) {
  (0, _inheritsLoose2.default)(MPNativeRouter, _BaseNativeRouter);

  function MPNativeRouter(_history, tabPages) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_unlistenHistory", void 0);
    _this._history = _history;
    _this.tabPages = tabPages;
    var _routeConfig$notifyNa = _route.routeConfig.notifyNativeRouter,
        root = _routeConfig$notifyNa.root,
        internal = _routeConfig$notifyNa.internal;

    if (root || internal) {
      _this._unlistenHistory = _history.onRouteChange(function (pathname, search, action) {
        var nativeUrl = [pathname, search].filter(Boolean).join('?');
        var arr = search.match(/__key__=(\w+)/);
        var key = arr ? arr[1] : '';

        if (action === 'POP' && !key) {
          var _this$router$findReco = _this.router.findRecordByStep(-1, false),
              record = _this$router$findReco.record;

          key = record.key;
        }

        var changed = _this.onChange(key);

        if (changed) {
          if (action === 'POP') {
            _this.router.back(key, true, {}, true, true);
          } else if (action === 'REPLACE') {
            _this.router.replace(nativeUrl, true, true, true);
          } else if (action === 'PUSH') {
            _this.router.push(nativeUrl, true, true, true);
          } else {
            _this.router.relaunch(nativeUrl, true, true, true);
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

  _proto.push = function push(location, key) {
    var nativeUrl = location.getNativeUrl(true);

    var _nativeUrl$split = nativeUrl.split('?'),
        pathname = _nativeUrl$split[0];

    if (this.tabPages[pathname]) {
      return Promise.reject("Replacing 'push' with 'relaunch' for TabPage: " + pathname);
    }

    return this._history.navigateTo({
      url: this.addKey(nativeUrl, key)
    });
  };

  _proto.replace = function replace(location, key) {
    var nativeUrl = location.getNativeUrl(true);

    var _nativeUrl$split2 = nativeUrl.split('?'),
        pathname = _nativeUrl$split2[0];

    if (this.tabPages[pathname]) {
      return Promise.reject("Replacing 'replace' with 'relaunch' for TabPage: " + pathname);
    }

    return this._history.redirectTo({
      url: this.addKey(nativeUrl, key)
    });
  };

  _proto.relaunch = function relaunch(location, key) {
    var nativeUrl = location.getNativeUrl(true);

    var _nativeUrl$split3 = nativeUrl.split('?'),
        pathname = _nativeUrl$split3[0];

    if (this.tabPages[pathname]) {
      return this._history.switchTab({
        url: pathname
      });
    }

    return this._history.reLaunch({
      url: this.addKey(nativeUrl, key)
    });
  };

  _proto.back = function back(location, index, key) {
    return this._history.navigateBack({
      delta: index[0]
    });
  };

  _proto.destroy = function destroy() {
    this._unlistenHistory && this._unlistenHistory();
  };

  return MPNativeRouter;
}(_route.BaseNativeRouter);

exports.MPNativeRouter = MPNativeRouter;

var EluxRouter = function (_BaseEluxRouter) {
  (0, _inheritsLoose2.default)(EluxRouter, _BaseEluxRouter);

  function EluxRouter(nativeUrl, mpNativeRouter) {
    return _BaseEluxRouter.call(this, nativeUrl, mpNativeRouter, {}) || this;
  }

  return EluxRouter;
}(_route.BaseEluxRouter);

exports.EluxRouter = EluxRouter;

function createRouter(mpHistory, tabPages) {
  var mpNativeRouter = new MPNativeRouter(mpHistory, tabPages);

  var _mpHistory$getLocatio = mpHistory.getLocation(),
      pathname = _mpHistory$getLocatio.pathname,
      search = _mpHistory$getLocatio.search;

  var router = new EluxRouter(_route.urlParser.getUrl('n', pathname, search), mpNativeRouter);
  return router;
}