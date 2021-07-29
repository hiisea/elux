"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createRouter = createRouter;
exports.Router = exports.MPNativeRouter = void 0;

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

  function MPNativeRouter(routeENV, tabPages) {
    var _this;

    _this = _BaseNativeRouter.call(this) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "_unlistenHistory", void 0);
    _this.routeENV = routeENV;
    _this.tabPages = tabPages;
    _this._unlistenHistory = routeENV.onRouteChange(function (pathname, searchData, action) {
      var key = searchData ? searchData['__key__'] : '';

      if (action === 'POP' && !key) {
        key = _this.router.getHistory(true).findRecord(-1).key;
      }

      var nativeLocation = {
        pathname: pathname,
        searchData: searchData
      };

      var changed = _this.onChange(key);

      if (changed) {
        var index = -1;

        if (action === 'POP') {
          index = _this.router.getHistory(true).findIndex(key);
        }

        if (index > -1) {
          _this.router.back(index + 1, true, true, true);
        } else if (action === 'REPLACE') {
          _this.router.replace(nativeLocation, true, true);
        } else if (action === 'PUSH') {
          _this.router.push(nativeLocation, true, true);
        } else {
          _this.router.relaunch(nativeLocation, true, true);
        }
      }
    });
    return _this;
  }

  var _proto = MPNativeRouter.prototype;

  _proto.getLocation = function getLocation() {
    return this.routeENV.getLocation();
  };

  _proto.toUrl = function toUrl(url, key) {
    return url.indexOf('?') > -1 ? url + "&__key__=" + key : url + "?__key__=" + key;
  };

  _proto.push = function push(getNativeData, key) {
    var nativeData = getNativeData();

    if (this.tabPages[nativeData.nativeUrl]) {
      throw "Replacing 'push' with 'relaunch' for TabPage: " + nativeData.nativeUrl;
    }

    return this.routeENV.navigateTo({
      url: this.toUrl(nativeData.nativeUrl, key)
    }).then(function () {
      return nativeData;
    });
  };

  _proto.replace = function replace(getNativeData, key) {
    var nativeData = getNativeData();

    if (this.tabPages[nativeData.nativeUrl]) {
      throw "Replacing 'push' with 'relaunch' for TabPage: " + nativeData.nativeUrl;
    }

    return this.routeENV.redirectTo({
      url: this.toUrl(nativeData.nativeUrl, key)
    }).then(function () {
      return nativeData;
    });
  };

  _proto.relaunch = function relaunch(getNativeData, key) {
    var nativeData = getNativeData();

    if (this.tabPages[nativeData.nativeUrl]) {
      return this.routeENV.switchTab({
        url: nativeData.nativeUrl
      }).then(function () {
        return nativeData;
      });
    }

    return this.routeENV.reLaunch({
      url: this.toUrl(nativeData.nativeUrl, key)
    }).then(function () {
      return nativeData;
    });
  };

  _proto.back = function back(getNativeData, n, key) {
    var nativeData = getNativeData();
    return this.routeENV.navigateBack({
      delta: n
    }).then(function () {
      return nativeData;
    });
  };

  _proto.toOutside = function toOutside(url) {};

  _proto.destroy = function destroy() {
    this._unlistenHistory();
  };

  return MPNativeRouter;
}(_route.BaseNativeRouter);

exports.MPNativeRouter = MPNativeRouter;

var Router = function (_BaseRouter) {
  (0, _inheritsLoose2.default)(Router, _BaseRouter);

  function Router(mpNativeRouter, locationTransform) {
    return _BaseRouter.call(this, (0, _route.nativeLocationToNativeUrl)(mpNativeRouter.getLocation()), mpNativeRouter, locationTransform) || this;
  }

  return Router;
}(_route.BaseRouter);

exports.Router = Router;

function createRouter(locationTransform, routeENV, tabPages) {
  var mpNativeRouter = new MPNativeRouter(routeENV, tabPages);
  var router = new Router(mpNativeRouter, locationTransform);
  return router;
}