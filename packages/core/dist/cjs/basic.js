"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.coreConfig = exports.TaskCounter = exports.MetaData = exports.LoadingState = void 0;
exports.deepMergeState = deepMergeState;
exports.isEluxComponent = isEluxComponent;
exports.isServer = isServer;
exports.mergeState = mergeState;
exports.setCoreConfig = void 0;

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _env = _interopRequireDefault(require("./env"));

var _utils = require("./utils");

var coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  RouteModuleName: '',
  AppModuleName: 'stage'
};
exports.coreConfig = coreConfig;
var setCoreConfig = (0, _utils.buildConfigSetter)(coreConfig);
exports.setCoreConfig = setCoreConfig;
var LoadingState;
exports.LoadingState = LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (exports.LoadingState = LoadingState = {}));

function isEluxComponent(data) {
  return data['__elux_component__'];
}

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

  var _proto = TaskCounter.prototype;

  _proto.addItem = function addItem(promise, note) {
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
        this.ctimer = _env.default.setTimeout(function () {
          _this2.ctimer = 0;

          if (_this2.list.length > 0) {
            _this2.dispatch(LoadingState.Depth);
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  };

  _proto.completeItem = function completeItem(promise) {
    var i = this.list.findIndex(function (item) {
      return item.promise === promise;
    });

    if (i > -1) {
      this.list.splice(i, 1);

      if (this.list.length === 0) {
        if (this.ctimer) {
          _env.default.clearTimeout.call(null, this.ctimer);

          this.ctimer = 0;
        }

        this.dispatch(LoadingState.Stop);
      }
    }

    return this;
  };

  return TaskCounter;
}(_utils.SingleDispatcher);

exports.TaskCounter = TaskCounter;
var MetaData = {
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  moduleMap: null,
  moduleGetter: null,
  moduleExists: null,
  currentRouter: null
};
exports.MetaData = MetaData;

function deepMergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (coreConfig.MutableData) {
    return _utils.deepMerge.apply(void 0, [target].concat(args));
  }

  return _utils.deepMerge.apply(void 0, [{}, target].concat(args));
}

function mergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  if (coreConfig.MutableData) {
    return Object.assign.apply(Object, [target].concat(args));
  }

  return Object.assign.apply(Object, [{}, target].concat(args));
}

function isServer() {
  return _env.default.isServer;
}