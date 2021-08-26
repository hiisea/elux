"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.beforeRouteChangeAction = beforeRouteChangeAction;
exports.testRouteChangeAction = testRouteChangeAction;
exports.createRouteModule = createRouteModule;
exports.RouteActionTypes = exports.BaseEluxRouter = exports.BaseNativeRouter = exports.nativeLocationToNativeUrl = exports.nativeUrlToNativeLocation = exports.routeMeta = void 0;

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

var _transform = require("./transform");

exports.createLocationTransform = _transform.createLocationTransform;
exports.nativeUrlToNativeLocation = _transform.nativeUrlToNativeLocation;
exports.nativeLocationToNativeUrl = _transform.nativeLocationToNativeUrl;

var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    (0, _defineProperty2.default)(this, "curTask", void 0);
    (0, _defineProperty2.default)(this, "eluxRouter", void 0);
  }

  var _proto = BaseNativeRouter.prototype;

  _proto.onChange = function onChange(key) {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }

    return key !== this.eluxRouter.routeState.key;
  };

  _proto.startup = function startup(router) {
    this.eluxRouter = router;
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

var BaseEluxRouter = function (_MultipleDispatcher) {
  (0, _inheritsLoose2.default)(BaseEluxRouter, _MultipleDispatcher);

  function BaseEluxRouter(url, nativeRouter, locationTransform, nativeData) {
    var _this2;

    _this2 = _MultipleDispatcher.call(this) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_curTask", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_taskList", []);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_nativeData", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_internalUrl", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "routeState", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "name", _basic.routeConfig.RouteModuleName);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "initialize", void 0);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "injectedModules", {});
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "rootStack", new _history.RootStack());
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "latestState", {});
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this2), "_taskComplete", function () {
      var task = _this2._taskList.shift();

      if (task) {
        _this2.executeTask(task);
      } else {
        _this2._curTask = undefined;
      }
    });
    _this2.nativeRouter = nativeRouter;
    _this2.locationTransform = locationTransform;
    _this2.nativeData = nativeData;
    nativeRouter.startup((0, _assertThisInitialized2.default)(_this2));
    var locationOrPromise = locationTransform.urlToLocation(url);

    var callback = function callback(location) {
      var routeState = (0, _extends2.default)({}, location, {
        action: 'RELAUNCH',
        key: ''
      });
      _this2.routeState = routeState;
      _this2._internalUrl = (0, _transform.eluxLocationToEluxUrl)({
        pathname: routeState.pagename,
        params: routeState.params
      });

      if (!_basic.routeConfig.indexUrl) {
        (0, _basic.setRouteConfig)({
          indexUrl: _this2._internalUrl
        });
      }

      return routeState;
    };

    if ((0, _core.isPromise)(locationOrPromise)) {
      _this2.initialize = locationOrPromise.then(callback);
    } else {
      _this2.initialize = Promise.resolve(callback(locationOrPromise));
    }

    return _this2;
  }

  var _proto2 = BaseEluxRouter.prototype;

  _proto2.startup = function startup(store) {
    var historyStack = new _history.HistoryStack(this.rootStack, store);
    var historyRecord = new _history.HistoryRecord(this.routeState, historyStack);
    historyStack.startup(historyRecord);
    this.rootStack.startup(historyStack);
    this.routeState.key = historyRecord.getKey();
  };

  _proto2.getCurrentPages = function getCurrentPages() {
    return this.rootStack.getCurrentPages();
  };

  _proto2.getCurrentStore = function getCurrentStore() {
    return this.rootStack.getCurrentItem().store;
  };

  _proto2.getStoreList = function getStoreList() {
    return this.rootStack.getItems().map(function (_ref) {
      var store = _ref.store;
      return store;
    });
  };

  _proto2.getInternalUrl = function getInternalUrl() {
    return this._internalUrl;
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

  _proto2.getHistoryLength = function getHistoryLength(root) {
    return root ? this.rootStack.getLength() : this.rootStack.getCurrentItem().getLength();
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

  _proto2.findRecordByKey = function findRecordByKey(key) {
    return this.rootStack.findRecordByKey(key);
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

  _proto2.relaunch = function relaunch(data, root, nonblocking, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._relaunch.bind(this, data, root, nativeCaller), nonblocking);
  };

  _proto2._relaunch = function () {
    var _relaunch2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(data, root, nativeCaller) {
      var _this3 = this;

      var preData, key, location, routeState, nativeData, notifyNativeRouter, cloneState;
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
              key = '';
              location = preData;
              routeState = (0, _extends2.default)({}, location, {
                action: 'RELAUNCH',
                key: key
              });
              _context.next = 10;
              return this.getCurrentStore().dispatch(testRouteChangeAction(routeState));

            case 10:
              _context.next = 12;
              return this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));

            case 12:
              if (root) {
                key = this.rootStack.relaunch(routeState).getKey();
              } else {
                key = this.rootStack.getCurrentItem().relaunch(routeState).getKey();
              }

              routeState.key = key;
              notifyNativeRouter = _basic.routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context.next = 19;
                break;
              }

              _context.next = 18;
              return this.nativeRouter.execute('relaunch', function () {
                return _this3.locationToNativeData(routeState);
              }, key);

            case 18:
              nativeData = _context.sent;

            case 19:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this._internalUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });
              cloneState = (0, _core.deepClone)(routeState);
              this.getCurrentStore().dispatch((0, _core.routeChangeAction)(cloneState));
              _context.next = 26;
              return this.dispatch('change', {
                routeState: cloneState,
                root: root
              });

            case 26:
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

  _proto2.push = function push(data, root, nonblocking, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._push.bind(this, data, root, nativeCaller), nonblocking);
  };

  _proto2._push = function () {
    var _push2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(data, root, nativeCaller) {
      var _this4 = this;

      var preData, key, location, routeState, nativeData, notifyNativeRouter, cloneState;
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
              key = '';
              location = preData;
              routeState = (0, _extends2.default)({}, location, {
                action: 'PUSH',
                key: key
              });
              _context2.next = 10;
              return this.getCurrentStore().dispatch(testRouteChangeAction(routeState));

            case 10:
              _context2.next = 12;
              return this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));

            case 12:
              if (root) {
                key = this.rootStack.push(routeState).getKey();
              } else {
                key = this.rootStack.getCurrentItem().push(routeState).getKey();
              }

              routeState.key = key;
              notifyNativeRouter = _basic.routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context2.next = 19;
                break;
              }

              _context2.next = 18;
              return this.nativeRouter.execute('push', function () {
                return _this4.locationToNativeData(routeState);
              }, key);

            case 18:
              nativeData = _context2.sent;

            case 19:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this._internalUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });
              cloneState = (0, _core.deepClone)(routeState);

              if (!root) {
                _context2.next = 28;
                break;
              }

              _context2.next = 26;
              return (0, _core.reinitApp)(this.getCurrentStore());

            case 26:
              _context2.next = 29;
              break;

            case 28:
              this.getCurrentStore().dispatch((0, _core.routeChangeAction)(cloneState));

            case 29:
              _context2.next = 31;
              return this.dispatch('change', {
                routeState: cloneState,
                root: root
              });

            case 31:
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

  _proto2.replace = function replace(data, root, nonblocking, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._replace.bind(this, data, root, nativeCaller), nonblocking);
  };

  _proto2._replace = function () {
    var _replace2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(data, root, nativeCaller) {
      var _this5 = this;

      var preData, location, key, routeState, nativeData, notifyNativeRouter, cloneState;
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
              key = '';
              routeState = (0, _extends2.default)({}, location, {
                action: 'REPLACE',
                key: key
              });
              _context3.next = 10;
              return this.getCurrentStore().dispatch(testRouteChangeAction(routeState));

            case 10:
              _context3.next = 12;
              return this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));

            case 12:
              if (root) {
                key = this.rootStack.replace(routeState).getKey();
              } else {
                key = this.rootStack.getCurrentItem().replace(routeState).getKey();
              }

              routeState.key = key;
              notifyNativeRouter = _basic.routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context3.next = 19;
                break;
              }

              _context3.next = 18;
              return this.nativeRouter.execute('replace', function () {
                return _this5.locationToNativeData(routeState);
              }, key);

            case 18:
              nativeData = _context3.sent;

            case 19:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this._internalUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });
              cloneState = (0, _core.deepClone)(routeState);
              this.getCurrentStore().dispatch((0, _core.routeChangeAction)(cloneState));
              _context3.next = 26;
              return this.dispatch('change', {
                routeState: cloneState,
                root: root
              });

            case 26:
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

  _proto2.back = function back(n, root, options, nonblocking, nativeCaller) {
    if (n === void 0) {
      n = 1;
    }

    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._back.bind(this, n, root, options || {}, nativeCaller), nonblocking);
  };

  _proto2._back = function () {
    var _back2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(n, root, options, nativeCaller) {
      var _this6 = this;

      var _this$rootStack$testB, record, overflow, steps, _url, key, pagename, params, routeState, nativeData, notifyNativeRouter, cloneState;

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

              return _context4.abrupt("return");

            case 3:
              _this$rootStack$testB = this.rootStack.testBack(n, root), record = _this$rootStack$testB.record, overflow = _this$rootStack$testB.overflow, steps = _this$rootStack$testB.steps;

              if (!overflow) {
                _context4.next = 8;
                break;
              }

              _url = options.overflowRedirect || _basic.routeConfig.indexUrl;

              _core.env.setTimeout(function () {
                return _this6.relaunch(_url, root);
              }, 0);

              return _context4.abrupt("return");

            case 8:
              key = record.getKey();
              pagename = record.pagename;
              params = (0, _core.deepMerge)({}, record.params, options.payload);
              routeState = {
                key: key,
                pagename: pagename,
                params: params,
                action: 'BACK'
              };
              _context4.next = 14;
              return this.getCurrentStore().dispatch(testRouteChangeAction(routeState));

            case 14:
              _context4.next = 16;
              return this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));

            case 16:
              if (steps[0]) {
                root = true;
                this.rootStack.back(steps[0]);
              }

              if (steps[1]) {
                this.rootStack.getCurrentItem().back(steps[1]);
              }

              notifyNativeRouter = _basic.routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context4.next = 23;
                break;
              }

              _context4.next = 22;
              return this.nativeRouter.execute('back', function () {
                return _this6.locationToNativeData(routeState);
              }, n, key);

            case 22:
              nativeData = _context4.sent;

            case 23:
              this._nativeData = nativeData;
              this.routeState = routeState;
              this._internalUrl = (0, _transform.eluxLocationToEluxUrl)({
                pathname: routeState.pagename,
                params: routeState.params
              });
              cloneState = (0, _core.deepClone)(routeState);
              this.getCurrentStore().dispatch((0, _core.routeChangeAction)(cloneState));
              _context4.next = 30;
              return this.dispatch('change', {
                routeState: routeState,
                root: root
              });

            case 30:
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

  _proto2.executeTask = function executeTask(task) {
    this._curTask = task;
    task().finally(this._taskComplete);
  };

  _proto2.addTask = function addTask(execute, nonblocking) {
    var _this7 = this;

    if (_core.env.isServer) {
      return;
    }

    if (this._curTask && !nonblocking) {
      return;
    }

    return new Promise(function (resolve, reject) {
      var task = function task() {
        return execute().then(resolve, reject);
      };

      if (_this7._curTask) {
        _this7._taskList.push(task);
      } else {
        _this7.executeTask(task);
      }
    });
  };

  _proto2.destroy = function destroy() {
    this.nativeRouter.destroy();
  };

  return BaseEluxRouter;
}(_core.MultipleDispatcher);

exports.BaseEluxRouter = BaseEluxRouter;
var RouteActionTypes = {
  TestRouteChange: "" + _basic.routeConfig.RouteModuleName + _core.coreConfig.NSP + "TestRouteChange",
  BeforeRouteChange: "" + _basic.routeConfig.RouteModuleName + _core.coreConfig.NSP + "BeforeRouteChange"
};
exports.RouteActionTypes = RouteActionTypes;

function beforeRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState]
  };
}

function testRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState]
  };
}

var defaultNativeLocationMap = {
  in: function _in(nativeLocation) {
    return nativeLocation;
  },
  out: function out(nativeLocation) {
    return nativeLocation;
  }
};

function createRouteModule(moduleName, pagenameMap, nativeLocationMap, notfoundPagename, paramsKey) {
  if (nativeLocationMap === void 0) {
    nativeLocationMap = defaultNativeLocationMap;
  }

  if (notfoundPagename === void 0) {
    notfoundPagename = '/404';
  }

  if (paramsKey === void 0) {
    paramsKey = '_';
  }

  var locationTransform = (0, _transform.createLocationTransform)(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  var routeModule = (0, _core.exportModule)(moduleName, _core.RouteModuleHandlers, {}, {});
  return (0, _extends2.default)({}, routeModule, {
    locationTransform: locationTransform
  });
}