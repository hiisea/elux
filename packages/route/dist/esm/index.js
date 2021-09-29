import _regeneratorRuntime from "@babel/runtime/regenerator";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { isPromise, deepMerge, routeChangeAction, coreConfig, deepClone, MultipleDispatcher, env, reinitApp } from '@elux/core';
import { routeConfig } from './basic';
import { RootStack, HistoryStack, HistoryRecord } from './history';
import { location as createLocationTransform } from './transform';
export { setRouteConfig, routeConfig, routeMeta, safeJsonParse } from './basic';
export { location, createRouteModule } from './transform';
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

    _defineProperty(_assertThisInitialized(_this2), "name", routeConfig.RouteModuleName);

    _defineProperty(_assertThisInitialized(_this2), "initialize", void 0);

    _defineProperty(_assertThisInitialized(_this2), "injectedModules", {});

    _defineProperty(_assertThisInitialized(_this2), "rootStack", new RootStack());

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
        action: 'RELAUNCH',
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
    var historyStack = new HistoryStack(this.rootStack, store);
    var historyRecord = new HistoryRecord(this.location, historyStack);
    historyStack.startup(historyRecord);
    this.rootStack.startup(historyStack);
    this.routeState.key = historyRecord.key;
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

  _proto2.getHistoryLength = function getHistoryLength(root) {
    return root ? this.rootStack.getLength() : this.rootStack.getCurrentItem().getLength();
  };

  _proto2.findRecordByKey = function findRecordByKey(key) {
    return this.rootStack.findRecordByKey(key);
  };

  _proto2.findRecordByStep = function findRecordByStep(delta, rootOnly) {
    return this.rootStack.testBack(delta, rootOnly);
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
                action: 'RELAUNCH',
                key: key
              };
              _context.next = 9;
              return this.getCurrentStore().dispatch(testRouteChangeAction(routeState));

            case 9:
              _context.next = 11;
              return this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));

            case 11:
              if (root) {
                key = this.rootStack.relaunch(location).key;
              } else {
                key = this.rootStack.getCurrentItem().relaunch(location).key;
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
                action: 'PUSH',
                key: key
              };
              _context2.next = 9;
              return this.getCurrentStore().dispatch(testRouteChangeAction(routeState));

            case 9:
              _context2.next = 11;
              return this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));

            case 11:
              if (root) {
                key = this.rootStack.push(location).key;
              } else {
                key = this.rootStack.getCurrentItem().push(location).key;
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
                action: 'REPLACE',
                key: key
              };
              _context3.next = 9;
              return this.getCurrentStore().dispatch(testRouteChangeAction(routeState));

            case 9:
              _context3.next = 11;
              return this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));

            case 11:
              if (root) {
                key = this.rootStack.replace(location).key;
              } else {
                key = this.rootStack.getCurrentItem().replace(location).key;
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
    var _back2 = _asyncToGenerator(_regeneratorRuntime.mark(function _callee4(n, root, options, nativeCaller) {
      var _this3 = this;

      var _this$rootStack$testB, record, overflow, steps, url, key, location, pagename, params, routeState, notifyNativeRouter, cloneState;

      return _regeneratorRuntime.wrap(function _callee4$(_context4) {
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

              url = options.overflowRedirect || routeConfig.indexUrl;
              env.setTimeout(function () {
                return _this3.relaunch(url, root);
              }, 0);
              return _context4.abrupt("return");

            case 8:
              key = record.key;
              location = record.location;
              pagename = location.getPagename();
              params = deepMerge({}, location.getParams(), options.payload);
              routeState = {
                key: key,
                pagename: pagename,
                params: params,
                action: 'BACK'
              };
              _context4.next = 15;
              return this.getCurrentStore().dispatch(testRouteChangeAction(routeState));

            case 15:
              _context4.next = 17;
              return this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));

            case 17:
              if (steps[0]) {
                root = true;
                this.rootStack.back(steps[0]);
              }

              if (steps[1]) {
                this.rootStack.getCurrentItem().back(steps[1]);
              }

              notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

              if (!(!nativeCaller && notifyNativeRouter)) {
                _context4.next = 23;
                break;
              }

              _context4.next = 23;
              return this.nativeRouter.execute('back', location, n, key);

            case 23:
              this.location = location;
              this.routeState = routeState;
              cloneState = deepClone(routeState);
              this.getCurrentStore().dispatch(routeChangeAction(cloneState));
              _context4.next = 29;
              return this.dispatch('change', {
                routeState: routeState,
                root: root
              });

            case 29:
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
export var RouteActionTypes = {
  TestRouteChange: "" + routeConfig.RouteModuleName + coreConfig.NSP + "TestRouteChange",
  BeforeRouteChange: "" + routeConfig.RouteModuleName + coreConfig.NSP + "BeforeRouteChange"
};
export function beforeRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState]
  };
}
export function testRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState]
  };
}