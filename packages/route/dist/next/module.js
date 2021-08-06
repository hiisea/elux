import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, coreConfig, reducer, mergeState, deepMergeState, exportModule } from '@elux/core';
import { createLocationTransform } from './transform';
export let ModuleWithRouteHandlers = _decorate(null, function (_initialize, _CoreModuleHandlers) {
  class ModuleWithRouteHandlers extends _CoreModuleHandlers {
    constructor(...args) {
      super(...args);

      _initialize(this);
    }

  }

  return {
    F: ModuleWithRouteHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        const routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? deepMergeState(initState, routeParams) : initState;
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return deepMergeState(this.state, payload);
      }
    }]
  };
}, CoreModuleHandlers);
export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `route${coreConfig.NSP}RouteChange`,
  TestRouteChange: `route${coreConfig.NSP}TestRouteChange`
};
export function beforeRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState]
  };
}
export function routeParamsAction(moduleName, params, action, prevRootState) {
  return {
    type: `${moduleName}${coreConfig.NSP}${RouteActionTypes.MRouteParams}`,
    payload: [params, action, prevRootState]
  };
}
export function routeChangeAction(routeState, prevRootState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState, prevRootState]
  };
}
export const routeMiddleware = ({
  dispatch,
  getState
}) => next => action => {
  if (action.type === RouteActionTypes.RouteChange) {
    const result = next(action);
    const [routeState, prevRootState] = action.payload;
    const rootRouteParams = routeState.params;
    const rootState = getState();
    Object.keys(rootRouteParams).forEach(moduleName => {
      const routeParams = rootRouteParams[moduleName];

      if (routeParams && Object.keys(routeParams).length > 0) {
        if (rootState[moduleName]) {
          dispatch(routeParamsAction(moduleName, routeParams, routeState.action, prevRootState));
        }
      }
    });
    return result;
  }

  return next(action);
};

let RouteModuleHandlers = _decorate(null, function (_initialize2) {
  class RouteModuleHandlers {
    constructor(moduleName, router) {
      _initialize2(this);

      this.moduleName = moduleName;
      this.router = router;
    }

  }

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "field",
      key: "initState",

      value() {
        return {};
      }

    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.router.getCurrentStore().getState(this.moduleName);
      }
    }, {
      kind: "method",
      decorators: [reducer],
      key: "RouteChange",
      value: function RouteChange(routeState) {
        return mergeState(this.state, routeState);
      }
    }]
  };
});

const defaultNativeLocationMap = {
  in(nativeLocation) {
    return nativeLocation;
  },

  out(nativeLocation) {
    return nativeLocation;
  }

};
export function createRouteModule(pagenameMap, nativeLocationMap = defaultNativeLocationMap, notfoundPagename = '/404', paramsKey = '_') {
  const handlers = RouteModuleHandlers;
  const locationTransform = createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  const routeModule = exportModule('route', handlers, {}, {});
  return { ...routeModule,
    locationTransform
  };
}