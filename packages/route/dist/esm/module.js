import _createClass from "@babel/runtime/helpers/esm/createClass";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _assertThisInitialized from "@babel/runtime/helpers/esm/assertThisInitialized";
import _inheritsLoose from "@babel/runtime/helpers/esm/inheritsLoose";
import _decorate from "@babel/runtime/helpers/esm/decorate";
import { CoreModuleHandlers, config, reducer, deepMerge, mergeState, deepMergeState, exportModule } from '@elux/core';
import { createLocationTransform } from './transform';
export var ModuleWithRouteHandlers = _decorate(null, function (_initialize, _CoreModuleHandlers) {
  var ModuleWithRouteHandlers = function (_CoreModuleHandlers2) {
    _inheritsLoose(ModuleWithRouteHandlers, _CoreModuleHandlers2);

    function ModuleWithRouteHandlers() {
      var _this;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      _this = _CoreModuleHandlers2.call.apply(_CoreModuleHandlers2, [this].concat(args)) || this;

      _initialize(_assertThisInitialized(_this));

      return _this;
    }

    return ModuleWithRouteHandlers;
  }(_CoreModuleHandlers);

  return {
    F: ModuleWithRouteHandlers,
    d: [{
      kind: "method",
      decorators: [reducer],
      key: "Init",
      value: function Init(initState) {
        var routeParams = this.rootState.route.params[this.moduleName];
        return routeParams ? deepMerge({}, initState, routeParams) : initState;
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
export var RouteActionTypes = {
  MRouteParams: 'RouteParams',
  RouteChange: "route" + config.NSP + "RouteChange",
  TestRouteChange: "route" + config.NSP + "TestRouteChange"
};
export function testRouteChangeAction(routeState) {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState]
  };
}
export function routeParamsAction(moduleName, params, action) {
  return {
    type: "" + moduleName + config.NSP + RouteActionTypes.MRouteParams,
    payload: [params, action]
  };
}
export function routeChangeAction(routeState) {
  return {
    type: RouteActionTypes.RouteChange,
    payload: [routeState]
  };
}
export var routeMiddleware = function routeMiddleware(_ref) {
  var dispatch = _ref.dispatch,
      getState = _ref.getState;
  return function (next) {
    return function (action) {
      if (action.type === RouteActionTypes.RouteChange) {
        var result = next(action);
        var routeState = action.payload[0];
        var rootRouteParams = routeState.params;
        var rootState = getState();
        Object.keys(rootRouteParams).forEach(function (moduleName) {
          var routeParams = rootRouteParams[moduleName];

          if (routeParams && Object.keys(routeParams).length > 0) {
            if (rootState[moduleName]) {
              dispatch(routeParamsAction(moduleName, routeParams, routeState.action));
            }
          }
        });
        return result;
      }

      return next(action);
    };
  };
};

var RouteModuleHandlers = function () {
  function RouteModuleHandlers() {
    _defineProperty(this, "initState", void 0);

    _defineProperty(this, "moduleName", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "actions", void 0);
  }

  var _proto = RouteModuleHandlers.prototype;

  _proto.RouteChange = function RouteChange(routeState) {
    return mergeState(this.state, routeState);
  };

  _createClass(RouteModuleHandlers, [{
    key: "state",
    get: function get() {
      return this.store.getState(this.moduleName);
    }
  }]);

  return RouteModuleHandlers;
}();

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
  var result = exportModule('route', handlers, {}, {});
  return {
    default: result,
    locationTransform: locationTransform
  };
}