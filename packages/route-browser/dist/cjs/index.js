"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.createClientRouter = createClientRouter;
exports.createServerRouter = createServerRouter;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _route = require("@elux/route");

var _core = require("@elux/core");

var _history = require("history");

(0, _route.setRouteConfig)({
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
  (0, _inheritsLoose2.default)(BrowserNativeRouter, _BaseNativeRouter);

  function BrowserNativeRouter(history, nativeRequest) {
    var _this;

    _this = _BaseNativeRouter.call(this, nativeRequest) || this;
    _this.unlistenHistory = void 0;
    _this.router = void 0;
    _this.history = history;
    _this.router = new _route.Router((0, _assertThisInitialized2.default)(_this));
    var _routeConfig$NotifyNa = _route.routeConfig.NotifyNativeRouter,
        window = _routeConfig$NotifyNa.window,
        page = _routeConfig$NotifyNa.page;

    if (window || page) {
      _this.unlistenHistory = _this.history.block(function (locationData, action) {
        if (action === 'POP') {
          _core.env.setTimeout(function () {
            return _this.router.back(1);
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
}(_route.BaseNativeRouter);

function createClientRouter() {
  var history = (0, _history.createBrowserHistory)();
  var nativeRequest = {
    request: {
      url: (0, _route.locationToUrl)(history.location)
    },
    response: {}
  };
  var browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}

function createServerRouter(nativeRequest) {
  var history = createServerHistory(nativeRequest);
  var browserNativeRouter = new BrowserNativeRouter(history, nativeRequest);
  return browserNativeRouter.router;
}