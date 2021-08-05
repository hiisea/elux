"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.testRouteChangeAction = testRouteChangeAction;
exports.routeParamsAction = routeParamsAction;
exports.routeChangeAction = routeChangeAction;
exports.createRouteModule = createRouteModule;
exports.routeMiddleware = exports.RouteActionTypes = exports.ModuleWithRouteHandlers = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime/helpers/assertThisInitialized"));

var _inheritsLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/inheritsLoose"));

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _core = require("@elux/core");

var _transform = require("./transform");

var ModuleWithRouteHandlers = (0, _decorate2.default)(null, function (_initialize, _CoreModuleHandlers) {
  var ModuleWithRouteHandlers = function (_CoreModuleHandlers2) {
    (0, _inheritsLoose2.default)(ModuleWithRouteHandlers, _CoreModuleHandlers2);

    function ModuleWithRouteHandlers() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _CoreModuleHandlers2.call.apply(_CoreModuleHandlers2, [this].concat(args)) || this;

      _initialize((0, _assertThisInitialized2.default)(_this));

      return _this;
    }

    return ModuleWithRouteHandlers;
  }(_CoreModuleHandlers);

  return {
    F: ModuleWithRouteHandlers,
    d: [{
      kind: "method",
      decorators: [_core.reducer],
      key: "Init",
      value: function Init(initState) {
        var routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? (0, _core.deepMergeState)(initState, routeParams) : initState;
      }
    }, {
      kind: "method",
      decorators: [_core.reducer],
      key: "RouteParams",
      value: function RouteParams(payload) {
        return (0, _core.deepMergeState)(this.state, payload);
      }
    }]
  };
}, _core.CoreModuleHandlers);
exports.ModuleWithRouteHandlers = ModuleWithRouteHandlers;
var RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: "route" + _core.coreConfig.NSP + "RouteChange",
  TestRouteChange: "route" + _core.coreConfig.NSP + "TestRouteChange"
};
exports.RouteActionTypes = RouteActionTypes;

function testRouteChangeAction(routeState, prevRootState) {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState, prevRootState]
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
        var result = next(action);
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
        return result;
      }

      return next(action);
    };
  };
};

exports.routeMiddleware = routeMiddleware;
var RouteModuleHandlers = (0, _decorate2.default)(null, function (_initialize2) {
  var RouteModuleHandlers = function RouteModuleHandlers(moduleName, router) {
    _initialize2(this);

    this.moduleName = moduleName;
    this.router = router;
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
      kind: "get",
      key: "state",
      value: function state() {
        return this.router.getCurrentStore().getState(this.moduleName);
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