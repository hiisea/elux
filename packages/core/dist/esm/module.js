import _applyDecoratedDescriptor from "@babel/runtime/helpers/esm/applyDecoratedDescriptor";

var _class, _class2;

import env from './env';
import { TaskCounter } from './utils';
import { isEluxComponent, ErrorCodes, coreConfig, mergeState } from './basic';
import { moduleLoadingAction } from './actions';
export function exportComponent(component) {
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
export function exportView(component) {
  var eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}
export var EmptyModel = (_class = function () {
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
}(), (_applyDecoratedDescriptor(_class.prototype, "initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "initState"), _class.prototype)), _class);
export var AppModel = (_class2 = function () {
  function AppModel(store) {
    this.moduleName = coreConfig.AppModuleName;
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
    return mergeState(this.store.getState(this.moduleName), _loadingState);
  };

  _proto2.error = function error(_error) {
    if (_error.code === ErrorCodes.INIT_ERROR) {
      return mergeState(this.store.getState(this.moduleName), {
        initError: _error.message
      });
    }

    return this.store.getState(this.moduleName);
  };

  return AppModel;
}(), (_applyDecoratedDescriptor(_class2.prototype, "loadingState", [reducer], Object.getOwnPropertyDescriptor(_class2.prototype, "loadingState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "error", [reducer], Object.getOwnPropertyDescriptor(_class2.prototype, "error"), _class2.prototype)), _class2);
export function exportModuleFacade(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(function (key) {
    var component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn("The exported component must implement interface EluxComponent: " + moduleName + "." + key);
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
export function setLoading(item, store, _moduleName, _groupName) {
  var moduleName = _moduleName || coreConfig.AppModuleName;
  var groupName = _groupName || 'globalLoading';
  var key = moduleName + coreConfig.NSP + groupName;
  var loadings = store.loadingGroups;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(coreConfig.DepthTimeOnLoading);
    loadings[key].addListener(function (loadingState) {
      var _moduleLoadingAction;

      var action = moduleLoadingAction(moduleName, (_moduleLoadingAction = {}, _moduleLoadingAction[groupName] = loadingState, _moduleLoadingAction));
      store.dispatch(action);
    });
  }

  loadings[key].addItem(item);
  return item;
}
export function effectLogger(before, after) {
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
export function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  var fun = descriptor.value;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
export function effect(loadingKey) {
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

    if (loadingForModuleName && loadingForGroupName && !env.isServer) {
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