"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.action = exports.ActionTypes = void 0;
exports.effect = effect;
exports.errorAction = errorAction;
exports.logger = logger;
exports.moduleInitAction = moduleInitAction;
exports.moduleLoadingAction = moduleLoadingAction;
exports.moduleRouteChangeAction = moduleRouteChangeAction;
exports.mutation = void 0;
exports.reducer = reducer;
exports.routeChangeAction = routeChangeAction;
exports.setLoading = setLoading;

var _env = _interopRequireDefault(require("./env"));

var _basic = require("./basic");

var _sprite = require("./sprite");

var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MReInit: 'ReInit',
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

function setLoading(store, item, moduleName, groupName) {
  var key = moduleName + _basic.coreConfig.NSP + groupName;
  var loadings = store.loadingGroups;

  if (!loadings[key]) {
    loadings[key] = new _sprite.TaskCounter(_basic.coreConfig.DepthTimeOnLoading);
    loadings[key].addListener(function (loadingState) {
      var _moduleLoadingAction;

      var action = moduleLoadingAction(moduleName, (_moduleLoadingAction = {}, _moduleLoadingAction[groupName] = loadingState, _moduleLoadingAction));
      store.dispatch(action);
    });
  }

  loadings[key].addItem(item);
  return item;
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
    loadingKey = 'app.loading.global';
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
      function injectLoading(curAction, promiseResult) {
        if (loadingForModuleName === 'app') {
          loadingForModuleName = _basic.coreConfig.AppModuleName;
        } else if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }

        setLoading(this.store, promiseResult, loadingForModuleName, loadingForGroupName);
      }

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([injectLoading, null]);
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}

var mutation = reducer;
exports.mutation = mutation;
var action = effect;
exports.action = action;

function logger(before, after) {
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