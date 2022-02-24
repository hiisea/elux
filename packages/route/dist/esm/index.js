import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _regeneratorRuntime from "@babel/runtime/regenerator";
import { isPromise, deepMerge, routeChangeAction, routeBeforeChangeAction, routeTestChangeAction, coreConfig, deepClone, MultipleDispatcher, env, reinitApp, RouteHistoryAction } from '@elux/core';
import { routeConfig } from './basic';
import { WindowStack, PageStack, RouteRecord } from './history';
import { location as createLocationTransform } from './transform';
export { setRouteConfig, routeConfig, routeJsonParse } from './basic';
export { location, createRouteModule, urlParser } from './transform';
export var BaseNativeRouter = function () {
  function BaseNativeRouter() {
    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "eluxRouter", void 0);
  }

  var _proto = BaseNativeRouter.prototype;

  _proto.onChange = function onChange(key) {
    if (this.curTask) {
      this.curTask();
      this.curTask = undefined;
      return false;
    }

    return key !== this.eluxRouter.routeState.key;
  };

  _proto.startup = function startup(router) {
    this.eluxRouter = router;
  };

  _proto.execute = function execute(method, location) {
    var _this = this;

    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return new Promise(function (resolve, reject) {
      _this.curTask = resolve;

      var result = _this[method].apply(_this, [location].concat(args));

      if (!result) {
        resolve();
        _this.curTask = undefined;
      } else if (isPromise(result)) {
        result.catch(function (e) {
          reject(e);
          env.console.error(e);
          _this.curTask = undefined;
        });
      }
    });
  };

  return BaseNativeRouter;
}();
export var BaseEluxRouter = function (_MultipleDispatcher) {
  _inheritsLoose(BaseEluxRouter, _MultipleDispatcher);

  function BaseEluxRouter(nativeUrl, nativeRouter, nativeData) {
    var _this2;

    _this2 = _MultipleDispatcher.call(this) || this;

    _defineProperty(_assertThisInitialized(_this2), "_curTask", void 0);

    _defineProperty(_assertThisInitialized(_this2), "_taskList", []);

    _defineProperty(_assertThisInitialized(_this2), "location", void 0);

    _defineProperty(_assertThisInitialized(_this2), "routeState", void 0);

    _defineProperty(_assertThisInitialized(_this2), "name", coreConfig.RouteModuleName);

    _defineProperty(_assertThisInitialized(_this2), "initialize", void 0);

    _defineProperty(_assertThisInitialized(_this2), "windowStack", new WindowStack());

    _defineProperty(_assertThisInitialized(_this2), "latestState", {});

    _defineProperty(_assertThisInitialized(_this2), "_taskComplete", function () {
      var task = _this2._taskList.shift();

      if (task) {
        _this2.executeTask(task);
      } else {
        _this2._curTask = undefined;
      }
    });

    _this2.nativeRouter = nativeRouter;
    _this2.nativeData = nativeData;
    nativeRouter.startup(_assertThisInitialized(_this2));
    var location = createLocationTransform(nativeUrl);
    _this2.location = location;
    var pagename = location.getPagename();
    var paramsOrPromise = location.getParams();

    var callback = function callback(params) {
      var routeState = {
        pagename: pagename,
        params: params,
        action: RouteHistoryAction.RELAUNCH,
        key: ''
      };
      _this2.routeState = routeState;
      return routeState;
    };

    if (isPromise(paramsOrPromise)) {
      _this2.initialize = paramsOrPromise.then(callback);
    } else {
      _this2.initialize = Promise.resolve(callback(paramsOrPromise));
    }

    return _this2;
  }

  var _proto2 = BaseEluxRouter.prototype;

  _proto2.startup = function startup(store) {
    var pageStack = new PageStack(this.windowStack, store);
    var routeRecord = new RouteRecord(this.location, pageStack);
    pageStack.startup(routeRecord);
    this.windowStack.startup(pageStack);
    this.routeState.key = routeRecord.key;
  };

  _proto2.getCurrentPages = function getCurrentPages() {
    return this.windowStack.getCurrentPages();
  };

  _proto2.getCurrentStore = function getCurrentStore() {
    return this.windowStack.getCurrentItem().store;
  };

  _proto2.getStoreList = function getStoreList() {
    return this.windowStack.getItems().map(function (_ref) {
      var store = _ref.store;
      return store;
    });
  };

  _proto2.getHistoryLength = function getHistoryLength(root) {
    return root ? this.windowStack.getLength() : this.windowStack.getCurrentItem().getLength();
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

  _proto2.extendCurrent = function extendCurrent(params, pagename) {
    return {
      payload: deepMerge({}, this.routeState.params, params),
      pagename: pagename || this.routeState.pagename
    };
  };

  _proto2.relaunch = function relaunch(dataOrUrl, root, nonblocking, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._relaunch.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  };

  _proto2._relaunch = function () {
    var _relaunch2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee(dataOrUrl, root, nativeCaller) {
      var location, pagename, params, key, routeState, notifyNativeRouter, cloneState;
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              location = createLocationTransform(dataOrUrl);
              pagename = location.getPagename();
              _context.next = 4;
              return location.getParams();

            case 4:
              params = _context.sent;
              key = '';
              routeState = {
                pagename: pagename,
                params: params,
                action: RouteHistoryAction.RELAUNCH,
                key: key
              };
              _context.next = 9;
              return this.getCurrentStore().dispatch(routeTestChangeAction(routeState));

            case 9:
              _context.next = 11;
              return this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

            case 11:
              if (root) {
                key = this.windowStack.relaunch(location).key;
              } else {
                key = this.windowStack.getCurrentItem().relaunch(location).key;
              }

              routeState.key = key;
              notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context.next = 17;
                break;
              }

              _context.next = 17;
              return this.nativeRouter.execute('relaunch', location, key);

            case 17:
              this.location = location;
              this.routeState = routeState;
              cloneState = deepClone(routeState);
              this.getCurrentStore().dispatch(routeChangeAction(cloneState));
              _context.next = 23;
              return this.dispatch('change', {
                routeState: cloneState,
                root: root
              });

            case 23:
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

  _proto2.push = function push(dataOrUrl, root, nonblocking, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._push.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  };

  _proto2._push = function () {
    var _push2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee2(dataOrUrl, root, nativeCaller) {
      var location, pagename, params, key, routeState, notifyNativeRouter, cloneState;
      return _regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              location = createLocationTransform(dataOrUrl);
              pagename = location.getPagename();
              _context2.next = 4;
              return location.getParams();

            case 4:
              params = _context2.sent;
              key = '';
              routeState = {
                pagename: pagename,
                params: params,
                action: RouteHistoryAction.PUSH,
                key: key
              };
              _context2.next = 9;
              return this.getCurrentStore().dispatch(routeTestChangeAction(routeState));

            case 9:
              _context2.next = 11;
              return this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

            case 11:
              if (root) {
                key = this.windowStack.push(location).key;
              } else {
                key = this.windowStack.getCurrentItem().push(location).key;
              }

              routeState.key = key;
              notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context2.next = 17;
                break;
              }

              _context2.next = 17;
              return this.nativeRouter.execute('push', location, key);

            case 17:
              this.location = location;
              this.routeState = routeState;
              cloneState = deepClone(routeState);

              if (!root) {
                _context2.next = 25;
                break;
              }

              _context2.next = 23;
              return reinitApp(this.getCurrentStore());

            case 23:
              _context2.next = 26;
              break;

            case 25:
              this.getCurrentStore().dispatch(routeChangeAction(cloneState));

            case 26:
              _context2.next = 28;
              return this.dispatch('change', {
                routeState: cloneState,
                root: root
              });

            case 28:
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

  _proto2.replace = function replace(dataOrUrl, root, nonblocking, nativeCaller) {
    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    return this.addTask(this._replace.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  };

  _proto2._replace = function () {
    var _replace2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee3(dataOrUrl, root, nativeCaller) {
      var location, pagename, params, key, routeState, notifyNativeRouter, cloneState;
      return _regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              location = createLocationTransform(dataOrUrl);
              pagename = location.getPagename();
              _context3.next = 4;
              return location.getParams();

            case 4:
              params = _context3.sent;
              key = '';
              routeState = {
                pagename: pagename,
                params: params,
                action: RouteHistoryAction.REPLACE,
                key: key
              };
              _context3.next = 9;
              return this.getCurrentStore().dispatch(routeTestChangeAction(routeState));

            case 9:
              _context3.next = 11;
              return this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

            case 11:
              if (root) {
                key = this.windowStack.replace(location).key;
              } else {
                key = this.windowStack.getCurrentItem().replace(location).key;
              }

              routeState.key = key;
              notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context3.next = 17;
                break;
              }

              _context3.next = 17;
              return this.nativeRouter.execute('replace', location, key);

            case 17:
              this.location = location;
              this.routeState = routeState;
              cloneState = deepClone(routeState);
              this.getCurrentStore().dispatch(routeChangeAction(cloneState));
              _context3.next = 23;
              return this.dispatch('change', {
                routeState: cloneState,
                root: root
              });

            case 23:
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

  _proto2.back = function back(stepOrKey, root, options, nonblocking, nativeCaller) {
    if (stepOrKey === void 0) {
      stepOrKey = 1;
    }

    if (root === void 0) {
      root = false;
    }

    if (nativeCaller === void 0) {
      nativeCaller = false;
    }

    if (!stepOrKey) {
      return;
    }

    return this.addTask(this._back.bind(this, stepOrKey, root, options || {}, nativeCaller), nonblocking);
  };

  _proto2._back = function () {
    var _back2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(stepOrKey, root, options, nativeCaller) {
      var _this3 = this;

      var _this$windowStack$tes3, record, overflow, index, url, key, location, pagename, params, routeState, notifyNativeRouter, cloneState;

      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _this$windowStack$tes3 = this.windowStack.testBack(stepOrKey, root), record = _this$windowStack$tes3.record, overflow = _this$windowStack$tes3.overflow, index = _this$windowStack$tes3.index;

              if (!overflow) {
                _context4.next = 5;
                break;
              }

              url = options.overflowRedirect || routeConfig.indexUrl;
              env.setTimeout(function () {
                return _this3.relaunch(url, root);
              }, 0);
              return _context4.abrupt("return");

            case 5:
              if (!(!index[0] && !index[1])) {
                _context4.next = 7;
                break;
              }

              return _context4.abrupt("return");

            case 7:
              key = record.key;
              location = record.location;
              pagename = location.getPagename();
              params = deepMerge({}, location.getParams(), options.payload);
              routeState = {
                key: key,
                pagename: pagename,
                params: params,
                action: RouteHistoryAction.BACK
              };
              _context4.next = 14;
              return this.getCurrentStore().dispatch(routeTestChangeAction(routeState));

            case 14:
              _context4.next = 16;
              return this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

            case 16:
              if (index[0]) {
                root = true;
                this.windowStack.back(index[0]);
              }

              if (index[1]) {
                this.windowStack.getCurrentItem().back(index[1]);
              }

              notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context4.next = 22;
                break;
              }

              _context4.next = 22;
              return this.nativeRouter.execute('back', location, index, key);

            case 22:
              this.location = location;
              this.routeState = routeState;
              cloneState = deepClone(routeState);
              this.getCurrentStore().dispatch(routeChangeAction(cloneState));
              _context4.next = 28;
              return this.dispatch('change', {
                routeState: routeState,
                root: root
              });

            case 28:
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
    var _this4 = this;

    if (env.isServer) {
      return;
    }

    if (this._curTask && !nonblocking) {
      return;
    }

    return new Promise(function (resolve, reject) {
      var task = function task() {
        return execute().then(resolve, reject);
      };

      if (_this4._curTask) {
        _this4._taskList.push(task);
      } else {
        _this4.executeTask(task);
      }
    });
  };

  _proto2.destroy = function destroy() {
    this.nativeRouter.destroy();
  };

  return BaseEluxRouter;
}(MultipleDispatcher);
export function toURouter(router) {
  var nativeData = router.nativeData,
      location = router.location,
      routeState = router.routeState,
      initialize = router.initialize,
      addListener = router.addListener,
      getCurrentPages = router.getCurrentPages,
      findRecordByKey = router.findRecordByKey,
      findRecordByStep = router.findRecordByStep,
      getHistoryLength = router.getHistoryLength,
      extendCurrent = router.extendCurrent,
      relaunch = router.relaunch,
      push = router.push,
      replace = router.replace,
      back = router.back;
  return {
    nativeData: nativeData,
    location: location,
    routeState: routeState,
    initialize: initialize,
    addListener: addListener.bind(router),
    getCurrentPages: getCurrentPages.bind(router),
    findRecordByKey: findRecordByKey.bind(router),
    findRecordByStep: findRecordByStep.bind(router),
    extendCurrent: extendCurrent.bind(router),
    getHistoryLength: getHistoryLength.bind(router),
    relaunch: relaunch.bind(router),
    push: push.bind(router),
    replace: replace.bind(router),
    back: back.bind(router)
  };
}