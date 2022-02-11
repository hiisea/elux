import _decorate from "@babel/runtime/helpers/esm/decorate";
import { MetaData, mergeState } from './basic';
import { reducer, ActionTypes } from './actions';
import { exportModule as _exportModule } from './modules';
import { loadModel as _loadModel } from './inject';
export function exportModule(moduleName, ModelClass, components, data) {
  return _exportModule(moduleName, ModelClass, components, data);
}
export let BaseModel = _decorate(null, function (_initialize) {
  class BaseModel {
    constructor(moduleName, store) {
      _initialize(this);

      this.moduleName = moduleName;
      this.store = store;
    }

  }

  return {
    F: BaseModel,
    d: [{
      kind: "field",
      key: "defaultRouteParams",
      value: void 0
    }, {
      kind: "get",
      key: "actions",
      value: function actions() {
        return MetaData.moduleMap[this.moduleName].actions;
      }
    }, {
      kind: "get",
      key: "router",
      value: function router() {
        return this.store.router;
      }
    }, {
      kind: "method",
      key: "getRouteParams",
      value: function getRouteParams() {
        return this.store.getRouteParams(this.moduleName);
      }
    }, {
      kind: "method",
      key: "getLatestState",
      value: function getLatestState() {
        return this.store.router.latestState;
      }
    }, {
      kind: "method",
      key: "getPrivateActions",
      value: function getPrivateActions(actionsMap) {
        return MetaData.moduleMap[this.moduleName].actions;
      }
    }, {
      kind: "method",
      key: "getState",
      value: function getState() {
        return this.store.getState(this.moduleName);
      }
    }, {
      kind: "method",
      key: "getRootState",
      value: function getRootState() {
        return this.store.getState();
      }
    }, {
      kind: "method",
      key: "getCurrentActionName",
      value: function getCurrentActionName() {
        return this.store.getCurrentActionName();
      }
    }, {
      kind: "method",
      key: "getCurrentState",
      value: function getCurrentState() {
        return this.store.getCurrentState(this.moduleName);
      }
    }, {
      kind: "method",
      key: "getCurrentRootState",
      value: function getCurrentRootState() {
        return this.store.getCurrentState();
      }
    }, {
      kind: "method",
      key: "dispatch",
      value: function dispatch(action) {
        return this.store.dispatch(action);
      }
    }, {
      kind: "method",
      key: "loadModel",
      value: function loadModel(moduleName) {
        return _loadModel(moduleName, this.store);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: ActionTypes.MInit,
      value: function (initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: ActionTypes.MLoading,
      value: function (payload) {
        const state = this.getState();
        const loading = mergeState(state.loading, payload);
        return mergeState(state, {
          loading
        });
      }
    }, {
      kind: "method",
      key: "destroy",
      value: function destroy() {
        return;
      }
    }]
  };
});