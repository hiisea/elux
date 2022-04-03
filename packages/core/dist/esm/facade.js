import _createClass from "@babel/runtime/helpers/esm/createClass";
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
  var modules = getModuleApiMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: function GetActions() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return args.reduce(function (prev, moduleName) {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetClientRouter: function GetClientRouter() {
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
export var BaseModel = (_class = function () {
  function BaseModel(moduleName, store) {
    this.store = void 0;
    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = BaseModel.prototype;

  _proto.onStartup = function onStartup(routeChanged) {
    return;
  };

  _proto.onActive = function onActive() {
    return;
  };

  _proto.onInactive = function onInactive() {
    return;
  };

  _proto.getRouter = function getRouter() {
    return this.store.router;
  };

  _proto.getState = function getState(type) {
    var runtime = this.store.router.runtime;

    if (type === 'previous') {
      return runtime.prevState[this.moduleName];
    } else {
      return this.store.getState(this.moduleName);
    }
  };

  _proto.getStoreState = function getStoreState(type) {
    var runtime = this.store.router.runtime;
    var state;

    if (type === 'previous') {
      state = runtime.prevState;
    } else if (type === 'uncommitted') {
      state = this.store.getUncommittedState();
    } else {
      state = this.store.getState();
    }

    return state;
  };

  _proto.getPrivateActions = function getPrivateActions(actionsMap) {
    return MetaData.moduleApiMap[this.moduleName].actions;
  };

  _proto.getCurrentAction = function getCurrentAction() {
    var store = this.store;
    return store.getCurrentAction();
  };

  _proto.dispatch = function dispatch(action) {
    return this.store.dispatch(action);
  };

  _proto.initState = function initState(state) {
    return state;
  };

  _proto.updateState = function updateState(subject, state) {
    return mergeState(this.getState(), state);
  };

  _proto.loadingState = function loadingState(_loadingState) {
    return mergeState(this.getState(), _loadingState);
  };

  _createClass(BaseModel, [{
    key: "actions",
    get: function get() {
      return MetaData.moduleApiMap[this.moduleName].actions;
    }
  }]);

  return BaseModel;
}(), (_applyDecoratedDescriptor(_class.prototype, "initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "initState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "updateState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "updateState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "loadingState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "loadingState"), _class.prototype)), _class);