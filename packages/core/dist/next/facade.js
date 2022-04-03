import _applyDecoratedDescriptor from "@babel/runtime/helpers/esm/applyDecoratedDescriptor";

var _class;

import env from './env';
import { MetaData, coreConfig, mergeState } from './basic';
import { getModuleApiMap } from './inject';
import { exportModuleFacade, reducer } from './module';
export function exportModule(moduleName, ModelClass, components, data) {
  return exportModuleFacade(moduleName, ModelClass, components, data);
}
export function getApi(demoteForProductionOnly, injectActions) {
  const modules = getModuleApiMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: (...args) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetClientRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use useRouter() instead';
      }

      return MetaData.clientRouter;
    },
    LoadComponent: coreConfig.LoadComponent,
    Modules: modules,
    useRouter: coreConfig.UseRouter,
    useStore: coreConfig.UseStore
  };
}
export let BaseModel = (_class = class BaseModel {
  constructor(moduleName, store) {
    this.store = void 0;
    this.moduleName = moduleName;
    this.store = store;
  }

  onStartup(routeChanged) {
    return;
  }

  onActive() {
    return;
  }

  onInactive() {
    return;
  }

  getRouter() {
    return this.store.router;
  }

  getState(type) {
    const runtime = this.store.router.runtime;

    if (type === 'previous') {
      return runtime.prevState[this.moduleName];
    } else {
      return this.store.getState(this.moduleName);
    }
  }

  getStoreState(type) {
    const runtime = this.store.router.runtime;
    let state;

    if (type === 'previous') {
      state = runtime.prevState;
    } else if (type === 'uncommitted') {
      state = this.store.getUncommittedState();
    } else {
      state = this.store.getState();
    }

    return state;
  }

  get actions() {
    return MetaData.moduleApiMap[this.moduleName].actions;
  }

  getPrivateActions(actionsMap) {
    return MetaData.moduleApiMap[this.moduleName].actions;
  }

  getCurrentAction() {
    const store = this.store;
    return store.getCurrentAction();
  }

  dispatch(action) {
    return this.store.dispatch(action);
  }

  initState(state) {
    return state;
  }

  updateState(subject, state) {
    return mergeState(this.getState(), state);
  }

  loadingState(loadingState) {
    return mergeState(this.getState(), loadingState);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "initState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "updateState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "updateState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "loadingState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "loadingState"), _class.prototype)), _class);