import _decorate from "@babel/runtime/helpers/esm/decorate";
import { coreConfig, reducer, mergeState, exportModule } from '@elux/core';
import { createLocationTransform } from './transform';
export const RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: `route${coreConfig.NSP}RouteChange`,
  TestRouteChange: `route${coreConfig.NSP}TestRouteChange`,
  BeforeRouteChange: `route${coreConfig.NSP}BeforeRouteChange`
};
export function beforeRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState]
  };
}
export function testRouteChangeAction(routeState) {
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
  }

  return next(action);
};

let RouteModuleHandlers = _decorate(null, function (_initialize) {
  class RouteModuleHandlers {
    constructor(moduleName, store) {
      _initialize(this);

      this.moduleName = moduleName;
      this.store = store;
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
      kind: "method",
      key: "destroy",
      value: function destroy() {
        return;
      }
    }, {
      kind: "get",
      key: "state",
      value: function state() {
        return this.store.getState(this.moduleName);
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