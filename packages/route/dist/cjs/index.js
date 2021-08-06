"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.BaseRouter = exports.BaseNativeRouter = exports.ModuleWithRouteHandlers = exports.RouteActionTypes = exports.createRouteModule = exports.routeMiddleware = exports.nativeLocationToNativeUrl = exports.nativeUrlToNativeLocation = exports.createLocationTransform = exports.routeMeta = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _core = require("@elux/core");

var _basic = require("./basic");

exports.routeConfig = _basic.routeConfig;
exports.setRouteConfig = _basic.setRouteConfig;
exports.routeMeta = _basic.routeMeta;

var _history = require("./history");

var _module = require("./module");

exports.routeMiddleware = _module.routeMiddleware;
exports.createRouteModule = _module.createRouteModule;
exports.RouteActionTypes = _module.RouteActionTypes;
exports.ModuleWithRouteHandlers = _module.ModuleWithRouteHandlers;

var _transform = require("./transform");

exports.createLocationTransform = _transform.createLocationTransform;
exports.nativeUrlToNativeLocation = _transform.nativeUrlToNativeLocation;
exports.nativeLocationToNativeUrl = _transform.nativeLocationToNativeUrl;

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

var BaseRouter = function (_MultipleDispatcher) {
  (0, _inheritsLoose2.default)(BaseRouter, _MultipleDispatcher);

  function BaseRouter(url, nativeRouter, locationTransform) {
    var _this2;

    _this2 = _MultipleDispatcher.call(this) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_tid", 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "curTask", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "taskList", []);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_nativeData", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "routeState", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "internalUrl", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "history", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "initRouteState", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "injectedModules", {});
    _this2.nativeRouter = nativeRouter;
    _this2.locationTransform = locationTransform;
    nativeRouter.setRouter((0, _assertThisInitialized2.default)(_this2));
    _this2.history = new _history.History();
    var locationOrPromise = locationTransform.urlToLocation(url);

    var callback = function callback(location) {
      var key = _this2._createKey();

      var routeState = (0, _extends2.default)({}, location, {
        action: 'RELAUNCH',
        key: key
      });
      _this2.routeState = routeState;
      _this2.internalUrl = (0, _transform.eluxLocationToEluxUrl)({
        pathname: routeState.pagename,
        params: routeState.params
      });

      if (!_basic.routeConfig.indexUrl) {
        (0, _basic.setRouteConfig)({
          indexUrl: _this2.internalUrl
        });
      }

      return routeState;
    };

    if ((0, _core.isPromise)(locationOrPromise)) {
      _this2.initRouteState = locationOrPromise.then(callback);
    } else {
      _this2.initRouteState = callback(locationOrPromise);
    }

    return _this2;
  }

  var _proto2 = BaseRouter.prototype;

  _proto2.getRouteState = function getRouteState() {
    return this.routeState;
  };

  _proto2.getPagename = function getPagename() {
    return this.routeState.pagename;
  };

  _proto2.getParams = function getParams() {
    return this.routeState.params;
  };

  _proto2.getInternalUrl = function getInternalUrl() {
    return this.internalUrl;
  };

  _proto2.getNativeLocation = function getNativeLocation() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNativeData(this.routeState);
    }

    return this._nativeData.nativeLocation;
  };

  _proto2.getNativeUrl = function getNativeUrl() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNativeData(this.routeState);
    }

    return this._nativeData.nativeUrl;
  };

  _proto2.init = function init(store) {
    var historyRecord = new _history.HistoryRecord(this.routeState, this.routeState.key, this.history, store);
    this.history.init(historyRecord);
  };

  _proto2.getCurrentStore = function getCurrentStore() {
    return this.history.getCurrentRecord().getStore();
  };

  _proto2.getCurKey = function getCurKey() {
    return this.routeState.key;
  };

  _proto2.getHistory = function getHistory(root) {
    return root ? this.history : this.history.getCurrentSubHistory();
  };

  _proto2.getHistoryLength = function getHistoryLength(root) {
    return root ? this.history.getLength() : this.history.getCurrentSubHistory().getLength();
  };

  _proto2.locationToNativeData = function locationToNativeData(location) {
    var nativeLocation = this.locationTransform.partialLocationToNativeLocation(location);
    var nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
    return {
      nativeUrl: nativeUrl,
      nativeLocation: nativeLocation
    };
  };

  _proto2.urlToLocation = function urlToLocation(url) {
    return this.locationTransform.urlToLocation(url);
  };

  _proto2.payloadLocationToEluxUrl = function payloadLocationToEluxUrl(data) {
    var eluxLocation = this.payloadToEluxLocation(data);
    return (0, _transform.eluxLocationToEluxUrl)(eluxLocation);
  };

  _proto2.payloadLocationToNativeUrl = function payloadLocationToNativeUrl(data) {
    var eluxLocation = this.payloadToEluxLocation(data);
    var nativeLocation = this.locationTransform.eluxLocationToNativeLocation(eluxLocation);
    return this.nativeLocationToNativeUrl(nativeLocation);
  };

  _proto2.nativeLocationToNativeUrl = function nativeLocationToNativeUrl(nativeLocation) {
    return (0, _transform.nativeLocationToNativeUrl)(nativeLocation);
  };

  _proto2._createKey = function _createKey() {
    this._tid++;
    return "" + this._tid;
  };

  _proto2.payloadToEluxLocation = function payloadToEluxLocation(payload) {
    var params = payload.params || {};
    var extendParams = payload.extendParams === 'current' ? this.routeState.params : payload.extendParams;

    if (extendParams && params) {
      params = (0, _core.deepMerge)({}, extendParams, params);
    } else if (extendParams) {
      params = extendParams;
    }

    return {
      pathname: payload.pathname || this.routeState.pagename,
      params: params
    };
  };

  _proto2.preAdditions = function preAdditions(data) {
    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return null;
      }

      return this.locationTransform.urlToLocation(data);
    }

    var eluxLocation = this.payloadToEluxLocation(data);
    return this.locationTransform.eluxLocationToLocation(eluxLocation);
  };

  _proto2.relaunch = function relaunch(data, root, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    this.addTask(this._relaunch.bind(this, data, root, nativeCaller));
  };

  _proto2._relaunch = function () {
    var _relaunch2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, root, nativeCaller) {
      var _this3 = this;

      var preData, location, key, routeState, nativeData, notifyNativeRouter;
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
              this.dispatch('test', {
                routeState: routeState,
                root: root
              });
              _context.next = 11;
              return this.getCurrentStore().dispatch((0, _module.beforeRouteChangeAction)(routeState));

            case 11:
              notifyNativeRouter = _basic.routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context.next = 16;
                break;
              }

              _context.next = 15;
              return this.nativeRouter.execute('relaunch', function () {
                return _this3.locationToNativeData(routeState);
              }, key);

            case 15:
              nativeData = _context.sent;

            case 16:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this.internalUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (root) {
                this.history.relaunch(location, key);
              } else {
                this.history.getCurrentSubHistory().relaunch(location, key);
              }

              this.dispatch('change', {
                routeState: routeState,
                root: root
              });
              this.getCurrentStore().dispatch((0, _module.routeChangeAction)(routeState));

            case 22:
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

  _proto2.push = function push(data, root, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    this.addTask(this._push.bind(this, data, root, nativeCaller));
  };

  _proto2._push = function () {
    var _push2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(data, root, nativeCaller) {
      var _this4 = this;

      var preData, location, key, routeState, nativeData, notifyNativeRouter;
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
              this.dispatch('test', {
                routeState: routeState,
                root: root
              });
              _context2.next = 11;
              return this.getCurrentStore().dispatch((0, _module.beforeRouteChangeAction)(routeState));

            case 11:
              notifyNativeRouter = _basic.routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context2.next = 16;
                break;
              }

              _context2.next = 15;
              return this.nativeRouter.execute('push', function () {
                return _this4.locationToNativeData(routeState);
              }, key);

            case 15:
              nativeData = _context2.sent;

            case 16:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this.internalUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (root) {
                this.history.push(location, key);
              } else {
                this.history.getCurrentSubHistory().push(location, key);
              }

              this.dispatch('change', {
                routeState: routeState,
                root: root
              });
              this.getCurrentStore().dispatch((0, _module.routeChangeAction)(routeState));

            case 22:
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

  _proto2.replace = function replace(data, root, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    this.addTask(this._replace.bind(this, data, root, nativeCaller));
  };

  _proto2._replace = function () {
    var _replace2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(data, root, nativeCaller) {
      var _this5 = this;

      var preData, location, key, routeState, nativeData, notifyNativeRouter;
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
              this.dispatch('test', {
                routeState: routeState,
                root: root
              });
              _context3.next = 11;
              return this.getCurrentStore().dispatch((0, _module.beforeRouteChangeAction)(routeState));

            case 11:
              notifyNativeRouter = _basic.routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context3.next = 16;
                break;
              }

              _context3.next = 15;
              return this.nativeRouter.execute('replace', function () {
                return _this5.locationToNativeData(routeState);
              }, key);

            case 15:
              nativeData = _context3.sent;

            case 16:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this.internalUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (root) {
                this.history.replace(location, key);
              } else {
                this.history.getCurrentSubHistory().replace(location, key);
              }

              this.dispatch('change', {
                routeState: routeState,
                root: root
              });
              this.getCurrentStore().dispatch((0, _module.routeChangeAction)(routeState));

            case 22:
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

  _proto2.back = function back(n, root, options, nativeCaller) {
    if (n === void 0) {
      n = 1;
    }

    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    this.addTask(this._back.bind(this, n, root, options || {}, nativeCaller));
  };

  _proto2._back = function () {
    var _back2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(n, root, options, nativeCaller) {
      var _this6 = this;

      var didOverflowRedirect, overflowRedirectUrl, historyRecord, key, pagename, params, routeState, prevRootState, nativeData, notifyNativeRouter;
      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              if (n === void 0) {
                n = 1;
              }

              if (!(n < 1)) {
                _context4.next = 3;
                break;
              }

              return _context4.abrupt("return", undefined);

            case 3:
              didOverflowRedirect = !!options.overflowRedirect;
              overflowRedirectUrl = typeof options.overflowRedirect === 'string' ? options.overflowRedirect : _basic.routeConfig.indexUrl;
              historyRecord = root ? this.history.preBack(n, didOverflowRedirect) : this.history.getCurrentSubHistory().preBack(n, didOverflowRedirect);

              if (historyRecord) {
                _context4.next = 8;
                break;
              }

              return _context4.abrupt("return", this.relaunch(overflowRedirectUrl, root));

            case 8:
              key = historyRecord.key, pagename = historyRecord.pagename;
              params = (0, _core.deepMerge)(historyRecord.getParams(), options.payload);
              routeState = {
                key: key,
                pagename: pagename,
                params: params,
                action: 'BACK'
              };
              prevRootState = this.getCurrentStore().getState();
              this.dispatch('test', {
                routeState: routeState,
                root: root
              });
              _context4.next = 15;
              return this.getCurrentStore().dispatch((0, _module.beforeRouteChangeAction)(routeState));

            case 15:
              notifyNativeRouter = _basic.routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context4.next = 20;
                break;
              }

              _context4.next = 19;
              return this.nativeRouter.execute('back', function () {
                return _this6.locationToNativeData(routeState);
              }, n, key);

            case 19:
              nativeData = _context4.sent;

            case 20:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this.internalUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });

              if (root) {
                this.history.back(n);
              } else {
                this.history.getCurrentSubHistory().back(n);
              }

              this.dispatch('change', {
                routeState: routeState,
                root: root
              });
              this.getCurrentStore().dispatch((0, _module.routeChangeAction)(routeState, prevRootState));

            case 26:
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
}(_core.MultipleDispatcher);

exports.BaseRouter = BaseRouter;