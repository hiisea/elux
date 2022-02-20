"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.ActionTypes = void 0;
exports.effect = effect;
exports.effectLogger = effectLogger;
exports.errorAction = errorAction;
exports.moduleInitAction = moduleInitAction;
exports.moduleLoadingAction = moduleLoadingAction;
exports.moduleRouteChangeAction = moduleRouteChangeAction;
exports.reducer = reducer;
exports.routeBeforeChangeAction = routeBeforeChangeAction;
exports.routeChangeAction = routeChangeAction;
exports.routeTestChangeAction = routeTestChangeAction;
exports.setLoading = setLoading;

var _env = _interopRequireDefault(require("./env"));

var _basic = require("./basic");

var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MRouteTestChange: 'RouteTestChange',
  MRouteBeforeChange: 'RouteBeforeChange',
  MRouteChange: 'RouteChange',
  Error: "Elux" + _basic.coreConfig.NSP + "Error"
};
exports.ActionTypes = ActionTypes;

function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}

function routeChangeAction(routeState) {
  return {
    type: "" + _basic.coreConfig.RouteModuleName + _basic.coreConfig.NSP + ActionTypes.MRouteChange,
    payload: [routeState]
  };
}

function routeBeforeChangeAction(routeState) {
  return {
    type: "" + _basic.coreConfig.RouteModuleName + _basic.coreConfig.NSP + ActionTypes.MRouteBeforeChange,
    payload: [routeState]
  };
}

function routeTestChangeAction(routeState) {
  return {
    type: "" + _basic.coreConfig.RouteModuleName + _basic.coreConfig.NSP + ActionTypes.MRouteTestChange,
    payload: [routeState]
  };
}

function moduleInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + _basic.coreConfig.NSP + ActionTypes.MInit,
    payload: [initState]
  };
}

function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: "" + moduleName + _basic.coreConfig.NSP + ActionTypes.MLoading,
    payload: [loadingState]
  };
}

function moduleRouteChangeAction(moduleName, params, action) {
  return {
    type: "" + moduleName + _basic.coreConfig.NSP + ActionTypes.MRouteChange,
    payload: [params, action]
  };
}

function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  var fun = descriptor.value;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}

function effect(loadingKey) {
  if (loadingKey === void 0) {
    loadingKey = 'stage.loading.global';
  }

  var loadingForModuleName;
  var loadingForGroupName;

  if (loadingKey !== null) {
    var _loadingKey$split = loadingKey.split('.');

    loadingForModuleName = _loadingKey$split[0];
    loadingForGroupName = _loadingKey$split[2];
  }

  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForModuleName && loadingForGroupName && !_env.default.isServer) {
      var injectLoading = function injectLoading(curAction, promiseResult) {
        if (loadingForModuleName === 'stage') {
          loadingForModuleName = _basic.coreConfig.AppModuleName;
        } else if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }

        setLoading(promiseResult, this.store, loadingForModuleName, loadingForGroupName);
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([injectLoading, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}

function effectLogger(before, after) {
  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;

    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }

    fun.__decorators__.push([before, after]);
  };
}

function setLoading(item, store, moduleName, groupName) {
  var key = moduleName + _basic.coreConfig.NSP + groupName;
  var loadings = store.loadingGroups;

  if (!loadings[key]) {
    loadings[key] = new _basic.TaskCounter(_basic.coreConfig.DepthTimeOnLoading);
    loadings[key].addListener(function (loadingState) {
      var _moduleLoadingAction;

      var action = moduleLoadingAction(moduleName, (_moduleLoadingAction = {}, _moduleLoadingAction[groupName] = loadingState, _moduleLoadingAction));
      store.dispatch(action);
    });
  }

  loadings[key].addItem(item);
  return item;
}