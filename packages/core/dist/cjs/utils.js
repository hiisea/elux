"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.SingleDispatcher = exports.MultipleDispatcher = void 0;
exports.buildConfigSetter = buildConfigSetter;
exports.compose = compose;
exports.deepClone = deepClone;
exports.deepMerge = deepMerge;
exports.isPromise = isPromise;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

function buildConfigSetter(data) {
  return function (config) {
    return Object.keys(data).forEach(function (key) {
      config[key] !== undefined && (data[key] = config[key]);
    });
  };
}

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
      var hasPromise = false;
      var arr = Object.keys(listenerMap).map(function (id) {
        var result = listenerMap[id](data);

        if (!hasPromise && isPromise(result)) {
          hasPromise = true;
        }

        return result;
      });
      return hasPromise ? Promise.all(arr) : undefined;
    }
  };

  return MultipleDispatcher;
}();

exports.MultipleDispatcher = MultipleDispatcher;

function isObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize, target, inject) {
  Object.keys(inject).forEach(function (key) {
    var src = target[key];
    var val = inject[key];

    if (isObject(val)) {
      if (isObject(src)) {
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

  args = args.filter(function (item) {
    return isObject(item) && Object.keys(item).length;
  });

  if (args.length === 0) {
    return target;
  }

  if (!isObject(target)) {
    target = {};
  }

  args.forEach(function (inject, index) {
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

      if (isObject(val)) {
        if (isObject(src)) {
          target[key] = __deepMerge(lastArg, src, val);
        } else {
          target[key] = lastArg || last2Arg && !last2Arg[key] ? val : __deepMerge(lastArg, {}, val);
        }
      } else {
        target[key] = val;
      }
    });
  });
  return target;
}

function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}

function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}

function compose() {
  for (var _len2 = arguments.length, funcs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    funcs[_key2] = arguments[_key2];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}