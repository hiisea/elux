import _decorate from "@babel/runtime/helpers/esm/decorate";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { mergeState, MetaData, coreConfig } from './basic';
import { reducer, ActionTypes, moduleRouteChangeAction } from './actions';
import { loadModel as _loadModel } from './inject';
export const routeMiddleware = ({
  store,
  dispatch,
  getState
}) => next => action => {
  if (action.type === `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`) {
    const result = next(action);
    const [routeState] = action.payload;
    const rootState = getState();
    Object.keys(routeState.params).forEach(moduleName => {
      const moduleState = routeState.params[moduleName];

      if (moduleState && Object.keys(moduleState).length > 0) {
        if (rootState[moduleName]) {
          dispatch(moduleRouteChangeAction(moduleName, moduleState, routeState.action));
        }
      }
    });
    return result;
  } else {
    return next(action);
  }
};
export class EmptyModuleHandlers {
  constructor(moduleName, store) {
    _defineProperty(this, "initState", {});

    this.moduleName = moduleName;
    this.store = store;
  }

  destroy() {
    return;
  }

}
export let RouteModuleHandlers = _decorate(null, function (_initialize) {
  class RouteModuleHandlers {
    constructor(moduleName, store, latestState) {
      _initialize(this);

      this.moduleName = moduleName;
      this.store = store;
      this.initState = latestState[moduleName];
    }

  }

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "field",
      key: "initState",
      value: void 0
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
      key: ActionTypes.MRouteChange,
      value: function (routeState) {
        return mergeState(this.store.getState(this.moduleName), routeState);
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
export let CoreModuleHandlers = _decorate(null, function (_initialize2) {
  class CoreModuleHandlers {
    constructor(moduleName, store, initState) {
      _initialize2(this);

      this.moduleName = moduleName;
      this.store = store;
      this.initState = initState;
    }

  }

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "get",
      key: "actions",
      value: function actions() {
        return MetaData.facadeMap[this.moduleName].actions;
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
        return MetaData.facadeMap[this.moduleName].actions;
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
      key: "getRouteParams",
      value: function getRouteParams() {
        const route = this.store.getState(this.store.router.name);
        return route.params[this.moduleName];
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