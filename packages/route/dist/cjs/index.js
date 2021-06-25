"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.BaseRouter = exports.BaseNativeRouter = exports.ModuleWithRouteHandlers = exports.RouteActionTypes = exports.createRouteModule = exports.routeMiddleware = exports.nativeUrlToNativeLocation = exports.createLocationTransform = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@elux/core");

var _basic = require("./basic");

exports.routeConfig = _basic.routeConfig;
exports.setRouteConfig = _basic.setRouteConfig;

var _history = require("./history");

var _module = require("./module");

exports.routeMiddleware = _module.routeMiddleware;
exports.createRouteModule = _module.createRouteModule;
exports.RouteActionTypes = _module.RouteActionTypes;
exports.ModuleWithRouteHandlers = _module.ModuleWithRouteHandlers;

var _transform = require("./transform");

exports.createLocationTransform = _transform.createLocationTransform;
exports.nativeUrlToNativeLocation = _transform.nativeUrlToNativeLocation;

var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    (0, _defineProperty2.default)(this, "curTask", void 0);
    (0, _defineProperty2.default)(this, "taskList", []);
    (0, _defineProperty2.default)(this, "router", null);
  }

  var _proto = BaseNativeRouter.prototype;

  _proto.onChange = function onChange(key) {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }

    return key !== this.router.getCurKey();
  };

  _proto.setRouter = function setRouter(router) {
    this.router = router;
  };

  _proto.execute = function execute(method, getNativeData) {
    var _this = this;

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      var task = {
        resolve: resolve,
        reject: reject,
        nativeData: undefined
      };
      _this.curTask = task;

      var result = _this[method].apply(_this, [function () {
        var nativeData = getNativeData();
        task.nativeData = nativeData;
        return nativeData;
      }].concat(args));

      if (!result) {
        resolve(undefined);
        _this.curTask = undefined;
      } else if ((0, _core.isPromise)(result)) {
        result.catch(function (e) {
          reject(e);
          _this.curTask = undefined;
        });
      }
    });
  };

  return BaseNativeRouter;
}();

exports.BaseNativeRouter = BaseNativeRouter;

var BaseRouter = function () {
  function BaseRouter(nativeLocationOrNativeUrl, nativeRouter, locationTransform) {
    var _this2 = this;

    (0, _defineProperty2.default)(this, "_tid", 0);
    (0, _defineProperty2.default)(this, "curTask", void 0);
    (0, _defineProperty2.default)(this, "taskList", []);
    (0, _defineProperty2.default)(this, "_nativeData", void 0);
    (0, _defineProperty2.default)(this, "routeState", void 0);
    (0, _defineProperty2.default)(this, "eluxUrl", void 0);
    (0, _defineProperty2.default)(this, "store", void 0);
    (0, _defineProperty2.default)(this, "history", void 0);
    (0, _defineProperty2.default)(this, "_lid", 0);
    (0, _defineProperty2.default)(this, "listenerMap", {});
    (0, _defineProperty2.default)(this, "initedPromise", void 0);
    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    nativeRouter.setRouter(this);
    var eluxLocation = typeof nativeLocationOrNativeUrl === 'string' ? locationTransform.nativeUrlToEluxLocation(nativeLocationOrNativeUrl) : locationTransform.nativeLocationToEluxLocation(nativeLocationOrNativeUrl);

    var callback = function callback(location) {
      var key = _this2._createKey();

      var routeState = (0, _extends2.default)({}, location, {
        action: 'RELAUNCH',
        key: key
      });
      _this2.routeState = routeState;
      _this2.eluxUrl = (0, _transform.eluxLocationToEluxUrl)({
        pathname: routeState.pagename,
        params: routeState.params
      });

      if (!_basic.routeConfig.indexUrl) {
        (0, _basic.setRouteConfig)({
          indexUrl: _this2.eluxUrl
        });
      }

      _this2.history = new _history.History({
        location: location,
        key: key
      });
      return routeState;
    };

    var locationOrPromise = locationTransform.eluxLocationtoLocation(eluxLocation);

    if ((0, _core.isPromise)(locationOrPromise)) {
      this.initedPromise = locationOrPromise.then(callback);
    } else {
      var routeState = callback(locationOrPromise);
      this.initedPromise = Promise.resolve(routeState);
    }
  }

  var _proto2 = BaseRouter.prototype;

  _proto2.addListener = function addListener(callback) {
    this._lid++;
    var id = "" + this._lid;
    var listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto2.dispatch = function dispatch(data) {
    var listenerMap = this.listenerMap;
    var arr = Object.keys(listenerMap).map(function (id) {
      return listenerMap[id](data);
    });
    return Promise.all(arr);
  };

  _proto2.getRouteState = function getRouteState() {
    return this.routeState;
  };

  _proto2.getPagename = function getPagename() {
    return this.routeState.pagename;
  };

  _proto2.getParams = function getParams() {
    return this.routeState.params;
  };

  _proto2.getEluxUrl = function getEluxUrl() {
    return this.eluxUrl;
  };

  _proto2.getNativeLocation = function getNativeLocation() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNative(this.routeState);
    }

    return this._nativeData.nativeLocation;
  };

  _proto2.getNativeUrl = function getNativeUrl() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNative(this.routeState);
    }

    return this._nativeData.nativeUrl;
  };

  _proto2.setStore = function setStore(_store) {
    this.store = _store;
  };

  _proto2.getCurKey = function getCurKey() {
    return this.routeState.key;
  };

  _proto2.findHistoryIndexByKey = function findHistoryIndexByKey(key) {
    return this.history.findIndex(key);
  };

  _proto2.locationToNative = function locationToNative(location) {
    var nativeLocation = this.locationTransform.locationtoNativeLocation(location);
    var nativeUrl = (0, _transform.nativeLocationToNativeUrl)(nativeLocation);
    return {
      nativeUrl: nativeUrl,
      nativeLocation: nativeLocation
    };
  };

  _proto2.urlToLocation = function urlToLocation(url) {
    var eluxLocation = this.locationTransform.urlToEluxLocation(url);
    return this.locationTransform.eluxLocationtoLocation(eluxLocation);
  };

  _proto2._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto2.preAdditions = function preAdditions(data) {
    var eluxLocation;

    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return null;
      }

      eluxLocation = this.locationTransform.urlToEluxLocation(data);
    } else {
      eluxLocation = (0, _transform.payloadToEluxLocation)(data, this.routeState);
    }

    return this.locationTransform.eluxLocationtoLocation(eluxLocation);
  };

  _proto2.relaunch = function relaunch(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  };

  _proto2._relaunch = function () {
    var _relaunch2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, internal, disableNative) {
      var _this3 = this;

      var preData, location, key, routeState, nativeData;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.preAdditions(data);

            case 2:
              preData = _context.sent;

              if (preData) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return");

            case 5:
              location = preData;
              key = this._createKey();
              routeState = (0, _extends2.default)({}, location, {
                action: 'RELAUNCH',
                key: key
              });
              _context.next = 10;
              return this.store.dispatch((0, _module.testRouteChangeAction)(routeState));

            case 10:
              _context.next = 12;
              return this.dispatch(routeState);

            case 12:
              if (!(!disableNative && !internal)) {
                _context.next = 16;
                break;
              }

              _context.next = 15;
              return this.nativeRouter.execute('relaunch', function () {
                return _this3.locationToNative(routeState);
              }, key);

            case 15:
              nativeData = _context.sent;

            case 16:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this.eluxUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });
              this.store.dispatch((0, _module.routeChangeAction)(routeState));

              if (internal) {
                this.history.getCurrentInternalHistory().relaunch(location, key);
              } else {
                this.history.relaunch(location, key);
              }

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function _relaunch(_x, _x2, _x3) {
      return _relaunch2.apply(this, arguments);
    }

    return _relaunch;
  }();

  _proto2.push = function push(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._push.bind(this, data, internal, disableNative));
  };

  _proto2._push = function () {
    var _push2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(data, internal, disableNative) {
      var _this4 = this;

      var preData, location, key, routeState, nativeData;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return this.preAdditions(data);

            case 2:
              preData = _context2.sent;

              if (preData) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt("return");

            case 5:
              location = preData;
              key = this._createKey();
              routeState = (0, _extends2.default)({}, location, {
                action: 'PUSH',
                key: key
              });
              _context2.next = 10;
              return this.store.dispatch((0, _module.testRouteChangeAction)(routeState));

            case 10:
              _context2.next = 12;
              return this.dispatch(routeState);

            case 12:
              if (!(!disableNative && !internal)) {
                _context2.next = 16;
                break;
              }

              _context2.next = 15;
              return this.nativeRouter.execute('push', function () {
                return _this4.locationToNative(routeState);
              }, key);

            case 15:
              nativeData = _context2.sent;

            case 16:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.eluxUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (internal) {
                this.history.getCurrentInternalHistory().push(location, key);
              } else {
                this.history.push(location, key);
              }

              this.store.dispatch((0, _module.routeChangeAction)(routeState));

            case 21:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function _push(_x4, _x5, _x6) {
      return _push2.apply(this, arguments);
    }

    return _push;
  }();

  _proto2.replace = function replace(data, internal, disableNative) {
    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._replace.bind(this, data, internal, disableNative));
  };

  _proto2._replace = function () {
    var _replace2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(data, internal, disableNative) {
      var _this5 = this;

      var preData, location, key, routeState, nativeData;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return this.preAdditions(data);

            case 2:
              preData = _context3.sent;

              if (preData) {
                _context3.next = 5;
                break;
              }

              return _context3.abrupt("return");

            case 5:
              location = preData;
              key = this._createKey();
              routeState = (0, _extends2.default)({}, location, {
                action: 'REPLACE',
                key: key
              });
              _context3.next = 10;
              return this.store.dispatch((0, _module.testRouteChangeAction)(routeState));

            case 10:
              _context3.next = 12;
              return this.dispatch(routeState);

            case 12:
              if (!(!disableNative && !internal)) {
                _context3.next = 16;
                break;
              }

              _context3.next = 15;
              return this.nativeRouter.execute('replace', function () {
                return _this5.locationToNative(routeState);
              }, key);

            case 15:
              nativeData = _context3.sent;

            case 16:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.eluxUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (internal) {
                this.history.getCurrentInternalHistory().replace(location, key);
              } else {
                this.history.replace(location, key);
              }

              this.store.dispatch((0, _module.routeChangeAction)(routeState));

            case 21:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function _replace(_x7, _x8, _x9) {
      return _replace2.apply(this, arguments);
    }

    return _replace;
  }();

  _proto2.back = function back(n, indexUrl, internal, disableNative) {
    if (n === void 0) {
      n = 1;
    }

    if (indexUrl === void 0) {
      indexUrl = 'index';
    }

    if (internal === void 0) {
      internal = false;
    }

    if (disableNative === void 0) {
      disableNative = _basic.routeConfig.disableNativeRoute;
    }

    this.addTask(this._back.bind(this, n, indexUrl === 'index' ? _basic.routeConfig.indexUrl : indexUrl, internal, disableNative));
  };

  _proto2._back = function () {
    var _back2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(n, indexUrl, internal, disableNative) {
      var _this6 = this;

      var stack, uri, _uriToLocation, key, location, routeState, nativeData;

      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              stack = internal ? this.history.getCurrentInternalHistory().getRecord(n - 1) : this.history.getRecord(n - 1);

              if (stack) {
                _context4.next = 6;
                break;
              }

              if (!indexUrl) {
                _context4.next = 5;
                break;
              }

              return _context4.abrupt("return", this._relaunch(indexUrl || _basic.routeConfig.indexUrl, internal, disableNative));

            case 5:
              throw {
                code: '1',
                message: 'history not found'
              };

            case 6:
              uri = stack.uri;
              _uriToLocation = (0, _history.uriToLocation)(uri), key = _uriToLocation.key, location = _uriToLocation.location;
              routeState = (0, _extends2.default)({}, location, {
                action: 'BACK',
                key: key
              });
              _context4.next = 11;
              return this.store.dispatch((0, _module.testRouteChangeAction)(routeState));

            case 11:
              _context4.next = 13;
              return this.dispatch(routeState);

            case 13:
              if (!(!disableNative && !internal)) {
                _context4.next = 17;
                break;
              }

              _context4.next = 16;
              return this.nativeRouter.execute('back', function () {
                return _this6.locationToNative(routeState);
              }, n, key);

            case 16:
              nativeData = _context4.sent;

            case 17:
              this._nativeData = nativeData || undefined;
              this.routeState = routeState;
              this.eluxUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (internal) {
                this.history.getCurrentInternalHistory().back(n);
              } else {
                this.history.back(n);
              }

              this.store.dispatch((0, _module.routeChangeAction)(routeState));
              return _context4.abrupt("return", undefined);

            case 23:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function _back(_x10, _x11, _x12, _x13) {
      return _back2.apply(this, arguments);
    }

    return _back;
  }();

  _proto2.taskComplete = function taskComplete() {
    var task = this.taskList.shift();

    if (task) {
      this.executeTask(task);
    } else {
      this.curTask = undefined;
    }
  };

  _proto2.executeTask = function executeTask(task) {
    this.curTask = task;
    task().finally(this.taskComplete.bind(this));
  };

  _proto2.addTask = function addTask(task) {
    if (this.curTask) {
      this.taskList.push(task);
    } else {
      this.executeTask(task);
    }
  };

  _proto2.destroy = function destroy() {
    this.nativeRouter.destroy();
  };

  return BaseRouter;
}();

exports.BaseRouter = BaseRouter;