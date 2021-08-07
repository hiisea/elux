import _extends from "@babel/runtime/helpers/esm/extends";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { coreConfig, reducer, mergeState, exportModule } from '@elux/core';
import { createLocationTransform } from './transform';
export var RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: "route" + coreConfig.NSP + "RouteChange",
  TestRouteChange: "route" + coreConfig.NSP + "TestRouteChange",
  BeforeRouteChange: "route" + coreConfig.NSP + "BeforeRouteChange"
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
    type: "" + moduleName + coreConfig.NSP + RouteActionTypes.MRouteParams,
    payload: [params, action, prevRootState]
  };
}
export function routeChangeAction(routeState, prevRootState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState, prevRootState]
  };
}
export var routeMiddleware = function routeMiddleware(_ref) {
  var dispatch = _ref.dispatch,
      getState = _ref.getState;
  return function (next) {
    return function (action) {
      if (action.type === RouteActionTypes.RouteChange) {
        var _ref2 = action.payload,
            routeState = _ref2[0],
            prevRootState = _ref2[1];
        var rootRouteParams = routeState.params;
        var rootState = getState();
        Object.keys(rootRouteParams).forEach(function (moduleName) {
          var routeParams = rootRouteParams[moduleName];

          if (routeParams && Object.keys(routeParams).length > 0) {
            if (rootState[moduleName]) {
              dispatch(routeParamsAction(moduleName, routeParams, routeState.action, prevRootState));
            }
          }
        });
      }

      return next(action);
    };
  };
};

var RouteModuleHandlers = _decorate(null, function (_initialize) {
  var RouteModuleHandlers = function RouteModuleHandlers(moduleName, store) {
    _initialize(this);

    this.moduleName = moduleName;
    this.store = store;
  };

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "field",
      key: "initState",
      value: function value() {
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

var defaultNativeLocationMap = {
  in: function _in(nativeLocation) {
    return nativeLocation;
  },
  out: function out(nativeLocation) {
    return nativeLocation;
  }
};
export function createRouteModule(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey) {
  if (nativeLocationMap === void 0) {
    nativeLocationMap = defaultNativeLocationMap;
  }

  if (notfoundPagename === void 0) {
    notfoundPagename = '/404';
  }

  if (paramsKey === void 0) {
    paramsKey = '_';
  }

  var handlers = RouteModuleHandlers;
  var locationTransform = createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  var routeModule = exportModule('route', handlers, {}, {});
  return _extends({}, routeModule, {
    locationTransform: locationTransform
  });
}