"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.setRouteConfig = exports.nativeLocationToLocation = exports.Router = exports.BaseNativeRouter = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _core = require("@elux/core");

var _basic = require("./basic");

exports.ErrorCodes = _basic.ErrorCodes;
exports.urlToLocation = _basic.urlToLocation;
exports.routeConfig = _basic.routeConfig;
exports.urlToNativeUrl = _basic.urlToNativeUrl;
exports.locationToUrl = _basic.locationToUrl;
exports.nativeUrlToUrl = _basic.nativeUrlToUrl;
exports.locationToNativeLocation = _basic.locationToNativeLocation;
exports.setRouteConfig = _basic.setRouteConfig;
exports.nativeLocationToLocation = _basic.nativeLocationToLocation;

var _history = require("./history");

var BaseNativeRouter = function () {
  function BaseNativeRouter(nativeRequest) {
    this.curTask = void 0;
    this.nativeRequest = nativeRequest;
  }

  var _proto = BaseNativeRouter.prototype;

  _proto.onSuccess = function onSuccess(key) {
    var _this$curTask;

    (_this$curTask = this.curTask) == null ? void 0 : _this$curTask.resolve();
  };

  _proto.onError = function onError(key) {
    var _this$curTask2;

    (_this$curTask2 = this.curTask) == null ? void 0 : _this$curTask2.reject();
  };

  _proto.execute = function execute(method, location, key, backIndex) {
    var _this = this;

    var result = this[method]((0, _basic.locationToNativeLocation)(location), key, backIndex);

    if (result) {
      return new Promise(function (resolve, reject) {
        _this.curTask = {
          resolve: resolve,
          reject: reject
        };
      });
    }
  };

  return BaseNativeRouter;
}();

exports.BaseNativeRouter = BaseNativeRouter;

var Router = function (_CoreRouter) {
  (0, _inheritsLoose2.default)(Router, _CoreRouter);

  function Router(nativeRouter) {
    var _this2;

    _this2 = _CoreRouter.call(this, (0, _basic.urlToLocation)((0, _basic.nativeUrlToUrl)(nativeRouter.nativeRequest.request.url)), 'relaunch', nativeRouter.nativeRequest) || this;
    _this2.curTask = void 0;
    _this2.taskList = [];
    _this2.windowStack = void 0;

    _this2.onTaskComplete = function () {
      var task = _this2.taskList.shift();

      if (task) {
        _this2.curTask = task;
        var onTaskComplete = _this2.onTaskComplete;

        _core.env.setTimeout(function () {
          return task[0]().finally(onTaskComplete).then(task[1], task[2]);
        }, 0);
      } else {
        _this2.curTask = undefined;
      }
    };

    _this2.nativeRouter = nativeRouter;
    _this2.windowStack = new _history.WindowStack(_this2.location, new _core.Store(0, (0, _assertThisInitialized2.default)(_this2)));
    return _this2;
  }

  var _proto2 = Router.prototype;

  _proto2.addTask = function addTask(execute) {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      var task = [function () {
        return (0, _core.setLoading)(execute(), _this3.getCurrentPage().store);
      }, resolve, reject];

      if (_this3.curTask) {
        _this3.taskList.push(task);
      } else {
        _this3.curTask = task;
        task[0]().finally(_this3.onTaskComplete).then(task[1], task[2]);
      }
    });
  };

  _proto2.getHistoryLength = function getHistoryLength(target) {
    if (target === void 0) {
      target = 'page';
    }

    return target === 'window' ? this.windowStack.getLength() : this.windowStack.getCurrentItem().getLength();
  };

  _proto2.findRecordByKey = function findRecordByKey(recordKey) {
    var _this$windowStack$fin = this.windowStack.findRecordByKey(recordKey),
        _this$windowStack$fin2 = _this$windowStack$fin.record,
        key = _this$windowStack$fin2.key,
        location = _this$windowStack$fin2.location,
        overflow = _this$windowStack$fin.overflow,
        index = _this$windowStack$fin.index;

    return {
      overflow: overflow,
      index: index,
      record: {
        key: key,
        location: location
      }
    };
  };

  _proto2.findRecordByStep = function findRecordByStep(delta, rootOnly) {
    var _this$windowStack$tes = this.windowStack.testBack(delta, rootOnly),
        _this$windowStack$tes2 = _this$windowStack$tes.record,
        key = _this$windowStack$tes2.key,
        location = _this$windowStack$tes2.location,
        overflow = _this$windowStack$tes.overflow,
        index = _this$windowStack$tes.index;

    return {
      overflow: overflow,
      index: index,
      record: {
        key: key,
        location: location
      }
    };
  };

  _proto2.getCurrentPage = function getCurrentPage() {
    return this.windowStack.getCurrentWindowPage();
  };

  _proto2.getWindowPages = function getWindowPages() {
    return this.windowStack.getWindowPages();
  };

  _proto2.mountStore = function () {
    var _mountStore = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(payload, prevStore, newStore, historyStore) {
      var prevState;
      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              prevState = prevStore.getState();
              this.runtime = {
                timestamp: Date.now(),
                payload: payload,
                prevState: _core.coreConfig.MutableData ? (0, _core.deepClone)(prevState) : prevState,
                completed: false
              };

              if (!(newStore === historyStore)) {
                _context.next = 5;
                break;
              }

              this.runtime.completed = true;
              return _context.abrupt("return");

            case 5:
              _context.prev = 5;
              _context.next = 8;
              return newStore.mount(_core.coreConfig.StageModuleName, 'route');

            case 8:
              _context.next = 13;
              break;

            case 10:
              _context.prev = 10;
              _context.t0 = _context["catch"](5);

              _core.env.console.error(_context.t0);

            case 13:
              this.runtime.completed = true;

            case 14:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this, [[5, 10]]);
    }));

    function mountStore(_x, _x2, _x3, _x4) {
      return _mountStore.apply(this, arguments);
    }

    return mountStore;
  }();

  _proto2.init = function init(prevState) {
    var task = [this._init.bind(this, prevState), function () {
      return undefined;
    }, function () {
      return undefined;
    }];
    this.curTask = task;
    return task[0]().finally(this.onTaskComplete);
  };

  _proto2._init = function () {
    var _init2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2(prevState) {
      var store;
      return _regenerator.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              this.runtime = {
                timestamp: Date.now(),
                payload: null,
                prevState: prevState,
                completed: false
              };
              store = this.getCurrentPage().store;
              _context2.prev = 2;
              _context2.next = 5;
              return store.mount(_core.coreConfig.StageModuleName, 'init');

            case 5:
              _context2.next = 7;
              return store.dispatch((0, _basic.testChangeAction)(this.location, this.action));

            case 7:
              _context2.next = 15;
              break;

            case 9:
              _context2.prev = 9;
              _context2.t0 = _context2["catch"](2);

              if (!(_context2.t0.code === _basic.ErrorCodes.ROUTE_REDIRECT)) {
                _context2.next = 14;
                break;
              }

              this.taskList = [];
              throw _context2.t0;

            case 14:
              _core.env.console.error(_context2.t0);

            case 15:
              this.runtime.completed = true;

            case 16:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[2, 9]]);
    }));

    function _init(_x5) {
      return _init2.apply(this, arguments);
    }

    return _init;
  }();

  _proto2.redirectOnServer = function redirectOnServer(urlOrLocation) {
    if (_core.env.isServer) {
      var url = urlOrLocation.url || (0, _basic.locationToUrl)(urlOrLocation);
      var nativeUrl = (0, _basic.urlToNativeUrl)(url);
      var err = {
        code: _basic.ErrorCodes.ROUTE_REDIRECT,
        message: 'Route change in server is not allowed.',
        detail: nativeUrl
      };
      throw err;
    }
  };

  _proto2.relaunch = function relaunch(urlOrLocation, target, payload, _nativeCaller) {
    if (target === void 0) {
      target = 'page';
    }

    if (payload === void 0) {
      payload = null;
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._relaunch.bind(this, urlOrLocation, target, payload, _nativeCaller));
  };

  _proto2._relaunch = function () {
    var _relaunch2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee3(urlOrLocation, target, payload, _nativeCaller) {
      var action, location, prevStore, newStore, pageStack, newRecord, NotifyNativeRouter;
      return _regenerator.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              action = 'relaunch';
              location = (0, _basic.urlToLocation)(urlOrLocation.url || (0, _basic.locationToUrl)(urlOrLocation));
              prevStore = this.getCurrentPage().store;
              _context3.next = 5;
              return prevStore.dispatch((0, _basic.testChangeAction)(location, action));

            case 5:
              _context3.next = 7;
              return prevStore.dispatch((0, _basic.beforeChangeAction)(location, action));

            case 7:
              this.location = location;
              this.action = action;
              newStore = prevStore.clone();
              pageStack = this.windowStack.getCurrentItem();
              newRecord = new _history.RouteRecord(location, pageStack);

              if (target === 'window') {
                pageStack.relaunch(newRecord);
                this.windowStack.relaunch(pageStack);
              } else {
                pageStack.relaunch(newRecord);
              }

              pageStack.replaceStore(newStore);
              _context3.next = 16;
              return this.mountStore(payload, prevStore, newStore);

            case 16:
              NotifyNativeRouter = _basic.routeConfig.NotifyNativeRouter[target];

              if (!(!_nativeCaller && NotifyNativeRouter)) {
                _context3.next = 20;
                break;
              }

              _context3.next = 20;
              return this.nativeRouter.execute(action, location, newRecord.key);

            case 20:
              _context3.next = 22;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: prevStore,
                newStore: newStore,
                windowChanged: target === 'window'
              });

            case 22:
              newStore.dispatch((0, _basic.afterChangeAction)(location, action));

            case 23:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function _relaunch(_x6, _x7, _x8, _x9) {
      return _relaunch2.apply(this, arguments);
    }

    return _relaunch;
  }();

  _proto2.replace = function replace(urlOrLocation, target, payload, _nativeCaller) {
    if (target === void 0) {
      target = 'page';
    }

    if (payload === void 0) {
      payload = null;
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._replace.bind(this, urlOrLocation, target, payload, _nativeCaller));
  };

  _proto2._replace = function () {
    var _replace2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee4(urlOrLocation, target, payload, _nativeCaller) {
      var action, location, prevStore, newStore, pageStack, newRecord, NotifyNativeRouter;
      return _regenerator.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              action = 'replace';
              location = (0, _basic.urlToLocation)(urlOrLocation.url || (0, _basic.locationToUrl)(urlOrLocation));
              prevStore = this.getCurrentPage().store;
              _context4.next = 5;
              return prevStore.dispatch((0, _basic.testChangeAction)(location, action));

            case 5:
              _context4.next = 7;
              return prevStore.dispatch((0, _basic.beforeChangeAction)(location, action));

            case 7:
              this.location = location;
              this.action = action;
              newStore = prevStore.clone();
              pageStack = this.windowStack.getCurrentItem();
              newRecord = new _history.RouteRecord(location, pageStack);

              if (target === 'window') {
                pageStack.relaunch(newRecord);
              } else {
                pageStack.replace(newRecord);
              }

              pageStack.replaceStore(newStore);
              _context4.next = 16;
              return this.mountStore(payload, prevStore, newStore);

            case 16:
              NotifyNativeRouter = _basic.routeConfig.NotifyNativeRouter[target];

              if (!(!_nativeCaller && NotifyNativeRouter)) {
                _context4.next = 20;
                break;
              }

              _context4.next = 20;
              return this.nativeRouter.execute(action, location, newRecord.key);

            case 20:
              _context4.next = 22;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: prevStore,
                newStore: newStore,
                windowChanged: target === 'window'
              });

            case 22:
              newStore.dispatch((0, _basic.afterChangeAction)(location, action));

            case 23:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function _replace(_x10, _x11, _x12, _x13) {
      return _replace2.apply(this, arguments);
    }

    return _replace;
  }();

  _proto2.push = function push(urlOrLocation, target, payload, _nativeCaller) {
    if (target === void 0) {
      target = 'page';
    }

    if (payload === void 0) {
      payload = null;
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._push.bind(this, urlOrLocation, target, payload, _nativeCaller));
  };

  _proto2._push = function () {
    var _push2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee5(urlOrLocation, target, payload, _nativeCaller) {
      var action, location, prevStore, newStore, pageStack, newRecord, newPageStack, NotifyNativeRouter;
      return _regenerator.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              action = 'push';
              location = (0, _basic.urlToLocation)(urlOrLocation.url || (0, _basic.locationToUrl)(urlOrLocation));
              prevStore = this.getCurrentPage().store;
              _context5.next = 5;
              return prevStore.dispatch((0, _basic.testChangeAction)(location, action));

            case 5:
              _context5.next = 7;
              return prevStore.dispatch((0, _basic.beforeChangeAction)(location, action));

            case 7:
              this.location = location;
              this.action = action;
              newStore = prevStore.clone();
              pageStack = this.windowStack.getCurrentItem();

              if (!(target === 'window')) {
                _context5.next = 19;
                break;
              }

              newPageStack = new _history.PageStack(this.windowStack, location, newStore);
              newRecord = newPageStack.getCurrentItem();
              this.windowStack.push(newPageStack);
              _context5.next = 17;
              return this.mountStore(payload, prevStore, newStore);

            case 17:
              _context5.next = 24;
              break;

            case 19:
              newRecord = new _history.RouteRecord(location, pageStack);
              pageStack.push(newRecord);
              pageStack.replaceStore(newStore);
              _context5.next = 24;
              return this.mountStore(payload, prevStore, newStore);

            case 24:
              NotifyNativeRouter = _basic.routeConfig.NotifyNativeRouter[target];

              if (!(!_nativeCaller && NotifyNativeRouter)) {
                _context5.next = 28;
                break;
              }

              _context5.next = 28;
              return this.nativeRouter.execute(action, location, newRecord.key);

            case 28:
              _context5.next = 30;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: prevStore,
                newStore: newStore,
                windowChanged: target === 'window'
              });

            case 30:
              newStore.dispatch((0, _basic.afterChangeAction)(location, action));

            case 31:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function _push(_x14, _x15, _x16, _x17) {
      return _push2.apply(this, arguments);
    }

    return _push;
  }();

  _proto2.back = function back(stepOrKey, target, payload, overflowRedirect, _nativeCaller) {
    if (stepOrKey === void 0) {
      stepOrKey = 1;
    }

    if (target === void 0) {
      target = 'page';
    }

    if (payload === void 0) {
      payload = null;
    }

    if (overflowRedirect === void 0) {
      overflowRedirect = '';
    }

    if (_nativeCaller === void 0) {
      _nativeCaller = false;
    }

    if (!stepOrKey) {
      return;
    }

    this.redirectOnServer({
      url: overflowRedirect || _basic.routeConfig.HomeUrl
    });
    return this.addTask(this._back.bind(this, stepOrKey, target, payload, overflowRedirect, _nativeCaller));
  };

  _proto2._back = function () {
    var _back2 = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee6(stepOrKey, target, payload, overflowRedirect, _nativeCaller) {
      var action, _this$windowStack$tes3, record, overflow, index, url, err, location, prevStore, NotifyNativeRouter, pageStack, historyStore, newStore;

      return _regenerator.default.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              action = 'back';
              _this$windowStack$tes3 = this.windowStack.testBack(stepOrKey, target === 'window'), record = _this$windowStack$tes3.record, overflow = _this$windowStack$tes3.overflow, index = _this$windowStack$tes3.index;

              if (!overflow) {
                _context6.next = 7;
                break;
              }

              url = overflowRedirect || _basic.routeConfig.HomeUrl;
              this.relaunch({
                url: url
              }, 'window');
              err = {
                code: _basic.ErrorCodes.ROUTE_BACK_OVERFLOW,
                message: 'Overflowed on route backward.',
                detail: stepOrKey
              };
              throw (0, _core.setProcessedError)(err, true);

            case 7:
              if (!(!index[0] && !index[1])) {
                _context6.next = 9;
                break;
              }

              throw 'Route backward invalid.';

            case 9:
              location = record.location;
              prevStore = this.getCurrentPage().store;
              _context6.next = 13;
              return prevStore.dispatch((0, _basic.testChangeAction)(location, action));

            case 13:
              _context6.next = 15;
              return prevStore.dispatch((0, _basic.beforeChangeAction)(location, action));

            case 15:
              this.location = location;
              this.action = action;
              NotifyNativeRouter = [];

              if (index[0]) {
                NotifyNativeRouter[0] = _basic.routeConfig.NotifyNativeRouter.window;
                this.windowStack.back(index[0]);
              }

              if (index[1]) {
                NotifyNativeRouter[1] = _basic.routeConfig.NotifyNativeRouter.page;
                this.windowStack.getCurrentItem().back(index[1]);
              }

              pageStack = this.windowStack.getCurrentItem();
              historyStore = pageStack.store;
              newStore = historyStore;

              if (index[1] !== 0) {
                newStore = prevStore.clone();
                pageStack.replaceStore(newStore);
              }

              _context6.next = 26;
              return this.mountStore(payload, prevStore, newStore);

            case 26:
              if (!(!_nativeCaller && NotifyNativeRouter.length)) {
                _context6.next = 29;
                break;
              }

              _context6.next = 29;
              return this.nativeRouter.execute(action, location, record.key, index);

            case 29:
              _context6.next = 31;
              return this.dispatch({
                location: location,
                action: action,
                prevStore: prevStore,
                newStore: newStore,
                windowChanged: !!index[0]
              });

            case 31:
              newStore.dispatch((0, _basic.afterChangeAction)(location, action));

            case 32:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6, this);
    }));

    function _back(_x18, _x19, _x20, _x21, _x22) {
      return _back2.apply(this, arguments);
    }

    return _back;
  }();

  return Router;
}(_core.CoreRouter);

exports.Router = Router;