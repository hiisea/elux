import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import env from './env';
import { buildConfigSetter, SingleDispatcher, deepMerge } from './utils';
export var coreConfig = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  RouteModuleName: 'route',
  AppModuleName: 'stage'
};
export var setCoreConfig = buildConfigSetter(coreConfig);
export var LoadingState;

(function (LoadingState) {
  LoadingState["Start"] = "Start";
  LoadingState["Stop"] = "Stop";
  LoadingState["Depth"] = "Depth";
})(LoadingState || (LoadingState = {}));

export function isEluxComponent(data) {
  return data['__elux_component__'];
}
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

  _proto.completeItem = function completeItem(promise) {
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
export var MetaData = {
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
export function deepMergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (coreConfig.MutableData) {
    return deepMerge.apply(void 0, [target].concat(args));
  }

  return deepMerge.apply(void 0, [{}, target].concat(args));
}
export function mergeState(target) {
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
export function isServer() {
  return env.isServer;
}