"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.CoreModuleHandlers = exports.RouteModuleHandlers = exports.EmptyModuleHandlers = exports.routeMiddleware = void 0;

var _decorate2 = _interopRequireDefault(require("@babel/runtime/helpers/decorate"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _basic = require("./basic");

var _actions = require("./actions");

var _inject = require("./inject");

var routeMiddleware = function routeMiddleware(_ref) {
  var store = _ref.store,
      dispatch = _ref.dispatch,
      getState = _ref.getState;
  return function (next) {
    return function (action) {
      if (action.type === "" + _basic.coreConfig.RouteModuleName + _basic.coreConfig.NSP + _actions.ActionTypes.MRouteChange) {
        var existsModules = Object.keys(getState()).reduce(function (obj, moduleName) {
          obj[moduleName] = true;
          return obj;
        }, {});
        var result = next(action);
        var _ref2 = action.payload,
            routeState = _ref2[0];
        Object.keys(routeState.params).forEach(function (moduleName) {
          var moduleState = routeState.params[moduleName];

          if (moduleState && Object.keys(moduleState).length > 0) {
            if (existsModules[moduleName]) {
              dispatch((0, _actions.moduleRouteChangeAction)(moduleName, moduleState, routeState.action));
            }
          }
        });
        return result;
      } else {
        return next(action);
      }
    };
  };
};

exports.routeMiddleware = routeMiddleware;

var EmptyModuleHandlers = function () {
  function EmptyModuleHandlers(moduleName, store) {
    (0, _defineProperty2.default)(this, "initState", {});
    this.moduleName = moduleName;
    this.store = store;
  }

  var _proto = EmptyModuleHandlers.prototype;

  _proto.destroy = function destroy() {
    return;
  };

  return EmptyModuleHandlers;
}();

exports.EmptyModuleHandlers = EmptyModuleHandlers;
var RouteModuleHandlers = (0, _decorate2.default)(null, function (_initialize) {
  var RouteModuleHandlers = function RouteModuleHandlers(moduleName, store, latestState, preState) {
    _initialize(this);

    this.moduleName = moduleName;
    this.store = store;
    this.initState = preState[moduleName];
  };

  return {
    F: RouteModuleHandlers,
    d: [{
      kind: "field",
      key: "initState",
      value: void 0
    }, {
      kind: "method",
      decorators: [_actions.reducer],
      key: _actions.ActionTypes.MInit,
      value: function value(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [_actions.reducer],
      key: _actions.ActionTypes.MRouteChange,
      value: function value(routeState) {
        return (0, _basic.mergeState)(this.store.getState(this.moduleName), routeState);
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
exports.RouteModuleHandlers = RouteModuleHandlers;
var CoreModuleHandlers = (0, _decorate2.default)(null, function (_initialize2) {
  var CoreModuleHandlers = function CoreModuleHandlers(moduleName, store, initState) {
    _initialize2(this);

    this.moduleName = moduleName;
    this.store = store;
    this.initState = initState;
  };

  return {
    F: CoreModuleHandlers,
    d: [{
      kind: "get",
      key: "actions",
      value: function actions() {
        return _basic.MetaData.facadeMap[this.moduleName].actions;
      }
    }, {
      kind: "get",
      key: "router",
      value: function router() {
        return this.store.router;
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
        return _basic.MetaData.facadeMap[this.moduleName].actions;
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
        return (0, _inject.loadModel)(moduleName, this.store);
      }
    }, {
      kind: "method",
      key: "getRouteParams",
      value: function getRouteParams() {
        var route = this.store.getState(this.store.router.name);
        return route.params[this.moduleName];
      }
    }, {
      kind: "method",
      decorators: [_actions.reducer],
      key: _actions.ActionTypes.MInit,
      value: function value(initState) {
        return initState;
      }
    }, {
      kind: "method",
      decorators: [_actions.reducer],
      key: _actions.ActionTypes.MLoading,
      value: function value(payload) {
        var state = this.getState();
        var loading = (0, _basic.mergeState)(state.loading, payload);
        return (0, _basic.mergeState)(state, {
          loading: loading
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
exports.CoreModuleHandlers = CoreModuleHandlers;