import _applyDecoratedDescriptor from "@babel/runtime/helpers/esm/applyDecoratedDescriptor";

var _class, _class2;

import env from './env';
import { TaskCounter } from './utils';
import { isEluxComponent, ErrorCodes, coreConfig, mergeState } from './basic';
import { moduleLoadingAction } from './actions';
export function exportComponent(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
export function exportView(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}
export let EmptyModel = (_class = class EmptyModel {
  constructor(moduleName, store) {
    this.moduleName = moduleName;
    this.store = store;
  }

  onActive() {
    return;
  }

  onInactive() {
    return;
  }

  onInit() {
    return {};
  }

  onStartup() {
    return;
  }

  initState(state) {
    return state;
  }

}, (_applyDecoratedDescriptor(_class.prototype, "initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "initState"), _class.prototype)), _class);
export let AppModel = (_class2 = class AppModel {
  constructor(store) {
    this.moduleName = coreConfig.AppModuleName;
    this.store = store;
  }

  onInit() {
    return {};
  }

  onStartup() {
    return;
  }

  onActive() {
    return;
  }

  onInactive() {
    return;
  }

  loadingState(loadingState) {
    return mergeState(this.store.getState(this.moduleName), loadingState);
  }

  error(error) {
    if (error.code === ErrorCodes.INIT_ERROR) {
      return mergeState(this.store.getState(this.moduleName), {
        initError: error.message
      });
    }

    return this.store.getState(this.moduleName);
  }

}, (_applyDecoratedDescriptor(_class2.prototype, "loadingState", [reducer], Object.getOwnPropertyDescriptor(_class2.prototype, "loadingState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "error", [reducer], Object.getOwnPropertyDescriptor(_class2.prototype, "error"), _class2.prototype)), _class2);
export function exportModuleFacade(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(key => {
    const component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn(`The exported component must implement interface EluxComponent: ${moduleName}.${key}`);
    }
  });
  return {
    moduleName,
    ModelClass,
    components: components,
    data,
    state: {},
    actions: {}
  };
}
export function setLoading(item, store, _moduleName, _groupName) {
  const moduleName = _moduleName || coreConfig.AppModuleName;
  const groupName = _groupName || 'globalLoading';
  const key = moduleName + coreConfig.NSP + groupName;
  const loadings = store.loadingGroups;

  if (!loadings[key]) {
    loadings[key] = new TaskCounter(coreConfig.DepthTimeOnLoading);
    loadings[key].addListener(loadingState => {
      const action = moduleLoadingAction(moduleName, {
        [groupName]: loadingState
      });
      store.dispatch(action);
    });
  }

  loadings[key].addItem(item);
  return item;
}
export function effectLogger(before, after) {
  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;

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

  const fun = descriptor.value;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
export function effect(loadingKey = 'app.globalLoading') {
  let loadingForModuleName;
  let loadingForGroupName;

  if (loadingKey !== null) {
    [loadingForModuleName, loadingForGroupName] = loadingKey.split('.');
  }

  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForModuleName && loadingForGroupName && !env.isServer) {
      const injectLoading = function (store, curAction, effectPromise) {
        if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }

        setLoading(effectPromise, store, loadingForModuleName, loadingForGroupName);
      };

      const decorators = fun.__decorators__ || [];
      fun.__decorators__ = decorators;
      decorators.push([injectLoading, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}