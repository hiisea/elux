import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { env } from './env';
export var LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (LoadingState = {}));

export var SingleDispatcher = function () {
  function SingleDispatcher() {
    _defineProperty(this, "listenerId", 0);

    _defineProperty(this, "listenerMap", {});
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
export var MultipleDispatcher = function () {
  function MultipleDispatcher() {
    _defineProperty(this, "listenerId", 0);

    _defineProperty(this, "listenerMap", {});
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
export var TaskCounter = function (_SingleDispatcher) {
  _inheritsLoose(TaskCounter, _SingleDispatcher);

  function TaskCounter(deferSecond) {
    var _this;

    _this = _SingleDispatcher.call(this) || this;

    _defineProperty(_assertThisInitialized(_this), "list", []);

    _defineProperty(_assertThisInitialized(_this), "ctimer", 0);

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
        this.ctimer = env.setTimeout(function () {
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
          env.clearTimeout.call(null, this.ctimer);
          this.ctimer = 0;
        }

        this.dispatch(LoadingState.Stop);
      }
    }

    return this;
  };

  return TaskCounter;
}(SingleDispatcher);
export function isPlainObject(obj) {
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

export function deepMerge(target) {
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
export function warn(str) {
  if (process.env.NODE_ENV === 'development') {
    env.console.warn(str);
  }
}
export function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}
export function isServer() {
  return env.isServer;
}
export function serverSide(callback) {
  if (env.isServer) {
    return callback();
  }

  return undefined;
}
export function clientSide(callback) {
  if (!env.isServer) {
    return callback();
  }

  return undefined;
}
export function delayPromise(second) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    descriptor.value = function () {
      var delay = new Promise(function (resolve) {
        env.setTimeout(function () {
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