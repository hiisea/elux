"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.EmptyModel = exports.AppModel = void 0;
exports.effect = effect;
exports.effectLogger = effectLogger;
exports.exportComponent = exportComponent;
exports.exportModuleFacade = exportModuleFacade;
exports.exportView = exportView;
exports.reducer = reducer;
exports.setLoading = setLoading;

var _applyDecoratedDescriptor2 = _interopRequireDefault(require("@babel/runtime/helpers/applyDecoratedDescriptor"));

var _env = _interopRequireDefault(require("./env"));

var _utils = require("./utils");

var _basic = require("./basic");

var _actions = require("./actions");

var _class, _class2;

function exportComponent(component) {
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}

function exportView(component) {
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}

var EmptyModel = (_class = function () {
  function EmptyModel(moduleName, store) {
    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = EmptyModel.prototype;

  _proto.onActive = function onActive() {
    return;
  };

  _proto.onInactive = function onInactive() {
    return;
  };

  _proto.onInit = function onInit() {
    return {};
  };

  _proto.onStartup = function onStartup() {
    return;
  };

  _proto.initState = function initState(state) {
    return state;
  };

  return EmptyModel;
}(), ((0, _applyDecoratedDescriptor2.default)(_class.prototype, "initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "initState"), _class.prototype)), _class);
exports.EmptyModel = EmptyModel;
var AppModel = (_class2 = function () {
  function AppModel(store) {
    this.moduleName = _basic.coreConfig.AppModuleName;
    this.store = store;
  }

  var _proto2 = AppModel.prototype;

  _proto2.onInit = function onInit() {
    return {};
  };

  _proto2.onStartup = function onStartup() {
    return;
  };

  _proto2.onActive = function onActive() {
    return;
  };

  _proto2.onInactive = function onInactive() {
    return;
  };

  _proto2.loadingState = function loadingState(_loadingState) {
    return (0, _basic.mergeState)(this.store.getState(this.moduleName), _loadingState);
  };

  _proto2.error = function error(_error) {
    if (_error.code === _basic.ErrorCodes.INIT_ERROR) {
      return (0, _basic.mergeState)(this.store.getState(this.moduleName), {
        initError: _error.message
      });
    }

    return this.store.getState(this.moduleName);
  };

  return AppModel;
}(), ((0, _applyDecoratedDescriptor2.default)(_class2.prototype, "loadingState", [reducer], Object.getOwnPropertyDescriptor(_class2.prototype, "loadingState"), _class2.prototype), (0, _applyDecoratedDescriptor2.default)(_class2.prototype, "error", [reducer], Object.getOwnPropertyDescriptor(_class2.prototype, "error"), _class2.prototype)), _class2);
exports.AppModel = AppModel;

function exportModuleFacade(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(function (key) {
    var component = components[key];

    if (!(0, _basic.isEluxComponent)(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      _env.default.console.warn("The exported component must implement interface EluxComponent: " + moduleName + "." + key);
    }
  });
  return {
    moduleName: moduleName,
    ModelClass: ModelClass,
    components: components,
    data: data,
    state: {},
    actions: {}
  };
}

function setLoading(item, store, _moduleName, _groupName) {
  var moduleName = _moduleName || _basic.coreConfig.AppModuleName;
  var groupName = _groupName || 'globalLoading';
  var key = moduleName + _basic.coreConfig.NSP + groupName;
  var loadings = store.loadingGroups;

  if (!loadings[key]) {
    loadings[key] = new _utils.TaskCounter(_basic.coreConfig.DepthTimeOnLoading);
    loadings[key].addListener(function (loadingState) {
      var _moduleLoadingAction;

      var action = (0, _actions.moduleLoadingAction)(moduleName, (_moduleLoadingAction = {}, _moduleLoadingAction[groupName] = loadingState, _moduleLoadingAction));
      store.dispatch(action);
    });
  }

  loadings[key].addItem(item);
  return item;
}

function effectLogger(before, after) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}

function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  var fun = descriptor.value;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}

function effect(loadingKey) {
  if (loadingKey === void 0) {
    loadingKey = 'app.globalLoading';
  }

  var loadingForModuleName;
  var loadingForGroupName;

  if (loadingKey !== null) {
    var _loadingKey$split = loadingKey.split('.');

    loadingForModuleName = _loadingKey$split[0];
    loadingForGroupName = _loadingKey$split[1];
  }

  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForModuleName && loadingForGroupName && !_env.default.isServer) {
      var injectLoading = function injectLoading(store, curAction, effectPromise) {
        if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }

        setLoading(effectPromise, store, loadingForModuleName, loadingForGroupName);
      };

      var decorators = fun.__decorators__ || [];
      fun.__decorators__ = decorators;
      decorators.push([injectLoading, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}