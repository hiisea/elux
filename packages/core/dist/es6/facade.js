import _applyDecoratedDescriptor from "@babel/runtime/helpers/esm/applyDecoratedDescriptor";

var _class;

import { coreConfig, mergeState, MetaData } from './basic';
import env from './env';
import { getComponent, getModule, getModuleApiMap } from './inject';
import { exportModuleFacade, reducer } from './module';
import { isPromise } from './utils';
export function exportModule(moduleName, ModelClass, components, data) {
  return exportModuleFacade(moduleName, ModelClass, components, data);
}
export function getApi(demoteForProductionOnly, injectActions) {
  const modules = getModuleApiMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);

  const GetComponent = (moduleName, componentName) => {
    const result = getComponent(moduleName, componentName);

    if (isPromise(result)) {
      return result;
    } else {
      return Promise.resolve(result);
    }
  };

  const GetData = moduleName => {
    const result = getModule(moduleName);

    if (isPromise(result)) {
      return result.then(mod => mod.data);
    } else {
      return Promise.resolve(result.data);
    }
  };

  return {
    GetActions: (...args) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetClientRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetClientRouter() in the server side, please use useRouter() instead';
      }

      return MetaData.clientRouter;
    },
    LoadComponent: coreConfig.LoadComponent,
    GetComponent: GetComponent,
    GetData: GetData,
    Modules: modules,
    useRouter: coreConfig.UseRouter,
    useStore: coreConfig.UseStore
  };
}
export let BaseModel = (_class = class BaseModel {
  get state() {
    return this.store.getState(this.moduleName);
  }

  constructor(moduleName, store) {
    this.store = void 0;
    this.moduleName = moduleName;
    this.store = store;
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

  getPrevState() {
    const runtime = this.store.router.runtime;
    return runtime.prevState[this.moduleName];
  }

  getRootState(type) {
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
    const moduleName = this.moduleName;
    const privateActions = Object.keys(actionsMap);
    privateActions.push('_initState', '_updateState', '_loadingState');
    return privateActions.reduce((map, actionName) => {
      map[actionName] = (...payload) => ({
        type: moduleName + coreConfig.NSP + actionName,
        payload
      });

      return map;
    }, {});
  }

  getCurrentAction() {
    const store = this.store;
    return store.getCurrentAction();
  }

  dispatch(action) {
    return this.store.dispatch(action);
  }

  _initState(state) {
    return state;
  }

  _updateState(subject, state) {
    return mergeState(this.state, state);
  }

  _loadingState(loadingState) {
    return mergeState(this.state, loadingState);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "_initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_initState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_updateState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_updateState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_loadingState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_loadingState"), _class.prototype)), _class);