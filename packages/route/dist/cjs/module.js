"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.beforeRouteChangeAction = beforeRouteChangeAction;
exports.testRouteChangeAction = testRouteChangeAction;
exports.routeParamsAction = routeParamsAction;
exports.routeChangeAction = routeChangeAction;
exports.createRouteModule = createRouteModule;
exports.routeMiddleware = exports.RouteActionTypes = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _core = require("@elux/core");

var _transform = require("./transform");

var RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: "route" + _core.coreConfig.NSP + "RouteChange",
  TestRouteChange: "route" + _core.coreConfig.NSP + "TestRouteChange",
  BeforeRouteChange: "route" + _core.coreConfig.NSP + "BeforeRouteChange"
};
exports.RouteActionTypes = RouteActionTypes;

function beforeRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState]
  };
}

function testRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState]
  };
}

function routeParamsAction(moduleName, params, action, prevRootState) {
  return {
    type: "" + moduleName + _core.coreConfig.NSP + RouteActionTypes.MRouteParams,
    payload: [params, action, prevRootState]
  };
}

function routeChangeAction(routeState, prevRootState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState, prevRootState]
  };
}

var routeMiddleware = function routeMiddleware(_ref) {
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

exports.routeMiddleware = routeMiddleware;
var RouteModuleHandlers = (0, _decorate2.default)(null, function (_initialize) {
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
      decorators: [_core.reducer],
      key: "RouteChange",
      value: function RouteChange(routeState) {
        return (0, _core.mergeState)(this.state, routeState);
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

function createRouteModule(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey) {
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
  var locationTransform = (0, _transform.createLocationTransform)(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  var routeModule = (0, _core.exportModule)('route', handlers, {}, {});
  return (0, _extends2.default)({}, routeModule, {
    locationTransform: locationTransform
  });
}