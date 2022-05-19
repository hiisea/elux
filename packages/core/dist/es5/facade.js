import _createClass from "@babel/runtime/helpers/esm/createClass";
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
  var modules = getModuleApiMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);

  var GetComponent = function GetComponent(moduleName, componentName) {
    var result = getComponent(moduleName, componentName);

    if (isPromise(result)) {
      return result;
    } else {
      return Promise.resolve(result);
    }
  };

  var GetData = function GetData(moduleName) {
    var result = getModule(moduleName);

    if (isPromise(result)) {
      return result.then(function (mod) {
        return mod.data;
      });
    } else {
      return Promise.resolve(result.data);
    }
  };

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
export var BaseModel = (_class = function () {
  function BaseModel(moduleName, store) {
    this.store = void 0;
    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = BaseModel.prototype;

  _proto.onActive = function onActive() {
    return;
  };

  _proto.onInactive = function onInactive() {
    return;
  };

  _proto.getRouter = function getRouter() {
    return this.store.router;
  };

  _proto.getPrevState = function getPrevState() {
    var runtime = this.store.router.runtime;
    return runtime.prevState[this.moduleName];
  };

  _proto.getRootState = function getRootState(type) {
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

  _proto._initState = function _initState(state) {
    return state;
  };

  _proto._updateState = function _updateState(subject, state) {
    return mergeState(this.state, state);
  };

  _proto._loadingState = function _loadingState(loadingState) {
    return mergeState(this.state, loadingState);
  };

  _createClass(BaseModel, [{
    key: "state",
    get: function get() {
      return this.store.getState(this.moduleName);
    }
  }, {
    key: "actions",
    get: function get() {
      return MetaData.moduleApiMap[this.moduleName].actions;
    }
  }]);

  return BaseModel;
}(), (_applyDecoratedDescriptor(_class.prototype, "_initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_initState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_updateState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_updateState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_loadingState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_loadingState"), _class.prototype)), _class);