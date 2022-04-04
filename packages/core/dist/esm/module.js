import _createClass from "@babel/runtime/helpers/esm/createClass";
import _applyDecoratedDescriptor from "@babel/runtime/helpers/esm/applyDecoratedDescriptor";

var _class;

import env from './env';
import { TaskCounter } from './utils';
import { MetaData, isEluxComponent, coreConfig } from './basic';
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

  _proto.onMount = function onMount() {
    var actions = MetaData.moduleApiMap[this.moduleName].actions;
    this.store.dispatch(actions._initState({}));
  };

  _proto.onActive = function onActive() {
    return;
  };

  _proto.onInactive = function onInactive() {
    return;
  };

  _proto._initState = function _initState(state) {
    return state;
  };

  _createClass(EmptyModel, [{
    key: "state",
    get: function get() {
      return this.store.getState(this.moduleName);
    }
  }]);

  return EmptyModel;
}(), (_applyDecoratedDescriptor(_class.prototype, "_initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_initState"), _class.prototype)), _class);
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
  var moduleName = _moduleName || coreConfig.StageModuleName;
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
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingKey !== null && !env.isServer) {
      var injectLoading = function injectLoading(store, curAction, effectPromise) {
        var loadingForModuleName;
        var loadingForGroupName;

        if (loadingKey === undefined) {
          loadingForModuleName = coreConfig.StageModuleName;
          loadingForGroupName = 'globalLoading';
        } else {
          var _loadingKey$split = loadingKey.split('.');

          loadingForModuleName = _loadingKey$split[0];
          loadingForGroupName = _loadingKey$split[1];
        }

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