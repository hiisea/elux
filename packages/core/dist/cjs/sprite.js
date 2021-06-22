"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.isPlainObject = isPlainObject;
exports.deepMerge = deepMerge;
exports.warn = warn;
exports.isPromise = isPromise;
exports.isServer = isServer;
exports.serverSide = serverSide;
exports.clientSide = clientSide;
exports.delayPromise = delayPromise;
exports.TaskCounter = exports.MultipleDispatcher = exports.SingleDispatcher = exports.LoadingState = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _env = require("./env");

var LoadingState;
exports.LoadingState = LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (exports.LoadingState = LoadingState = {}));

var SingleDispatcher = function () {
  function SingleDispatcher() {
    (0, _defineProperty2.default)(this, "listenerId", 0);
    (0, _defineProperty2.default)(this, "listenerMap", {});
  }

  var _proto = SingleDispatcher.prototype;

  _proto.addListener = function addListener(callback) {
    this.listenerId++;
    var id = "" + this.listenerId;
    var listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto.dispatch = function dispatch(data) {
    var listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach(function (id) {
      listenerMap[id](data);
    });
  };

  return SingleDispatcher;
}();

exports.SingleDispatcher = SingleDispatcher;

var MultipleDispatcher = function () {
  function MultipleDispatcher() {
    (0, _defineProperty2.default)(this, "listenerId", 0);
    (0, _defineProperty2.default)(this, "listenerMap", {});
  }

  var _proto2 = MultipleDispatcher.prototype;

  _proto2.addListener = function addListener(name, callback) {
    this.listenerId++;
    var id = "" + this.listenerId;

    if (!this.listenerMap[name]) {
      this.listenerMap[name] = {};
    }

    var listenerMap = this.listenerMap[name];
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto2.dispatch = function dispatch(name, data) {
    var listenerMap = this.listenerMap[name];

    if (listenerMap) {
      Object.keys(listenerMap).forEach(function (id) {
        listenerMap[id](data);
      });
    }
  };

  return MultipleDispatcher;
}();

exports.MultipleDispatcher = MultipleDispatcher;

var TaskCounter = function (_SingleDispatcher) {
  (0, _inheritsLoose2.default)(TaskCounter, _SingleDispatcher);

  function TaskCounter(deferSecond) {
    var _this;

    _this = _SingleDispatcher.call(this) || this;
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "list", []);
    (0, _defineProperty2.default)((0, _assertThisInitialized2.default)(_this), "ctimer", 0);
    _this.deferSecond = deferSecond;
    return _this;
  }

  var _proto3 = TaskCounter.prototype;

  _proto3.addItem = function addItem(promise, note) {
    var _this2 = this;

    if (note === void 0) {
      note = '';
    }

    if (!this.list.some(function (item) {
      return item.promise === promise;
    })) {
      this.list.push({
        promise: promise,
        note: note
      });
      promise.finally(function () {
        return _this2.completeItem(promise);
      });

      if (this.list.length === 1 && !this.ctimer) {
        this.dispatch(LoadingState.Start);
        this.ctimer = _env.env.setTimeout(function () {
          _this2.ctimer = 0;

          if (_this2.list.length > 0) {
            _this2.dispatch(LoadingState.Depth);
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  };

  _proto3.completeItem = function completeItem(promise) {
    var i = this.list.findIndex(function (item) {
      return item.promise === promise;
    });

    if (i > -1) {
      this.list.splice(i, 1);

      if (this.list.length === 0) {
        if (this.ctimer) {
          _env.env.clearTimeout.call(null, this.ctimer);

          this.ctimer = 0;
        }

        this.dispatch(LoadingState.Stop);
      }
    }

    return this;
  };

  return TaskCounter;
}(SingleDispatcher);

exports.TaskCounter = TaskCounter;

function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize, target, inject) {
  Object.keys(inject).forEach(function (key) {
    var src = target[key];
    var val = inject[key];

    if (isPlainObject(val)) {
      if (isPlainObject(src)) {
        target[key] = __deepMerge(optimize, src, val);
      } else {
        target[key] = optimize ? val : __deepMerge(optimize, {}, val);
      }
    } else {
      target[key] = val;
    }
  });
  return target;
}

function deepMerge(target) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (!isPlainObject(target)) {
    target = {};
  }

  args = args.filter(function (item) {
    return isPlainObject(item) && Object.keys(item).length;
  });

  if (args.length < 1) {
    return target;
  }

  args.forEach(function (inject, index) {
    if (isPlainObject(inject)) {
      var lastArg = false;
      var last2Arg = null;

      if (index === args.length - 1) {
        lastArg = true;
      } else if (index === args.length - 2) {
        last2Arg = args[index + 1];
      }

      Object.keys(inject).forEach(function (key) {
        var src = target[key];
        var val = inject[key];

        if (isPlainObject(val)) {
          if (isPlainObject(src)) {
            target[key] = __deepMerge(lastArg, src, val);
          } else {
            target[key] = lastArg || last2Arg && !last2Arg[key] ? val : __deepMerge(lastArg, {}, val);
          }
        } else {
          target[key] = val;
        }
      });
    }
  });
  return target;
}

function warn(str) {
  if (process.env.NODE_ENV === 'development') {
    _env.env.console.warn(str);
  }
}

function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}

function isServer() {
  return _env.env.isServer;
}

function serverSide(callback) {
  if (_env.env.isServer) {
    return callback();
  }

  return undefined;
}

function clientSide(callback) {
  if (!_env.env.isServer) {
    return callback();
  }

  return undefined;
}

function delayPromise(second) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    descriptor.value = function () {
      var delay = new Promise(function (resolve) {
        _env.env.setTimeout(function () {
          resolve(true);
        }, second * 1000);
      });

      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return Promise.all([delay, fun.apply(target, args)]).then(function (items) {
        return items[1];
      });
    };
  };
}