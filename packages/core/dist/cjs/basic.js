"use strict";

exports.__esModule = true;
exports.setConfig = setConfig;
exports.errorAction = errorAction;
exports.moduleInitAction = moduleInitAction;
exports.moduleReInitAction = moduleReInitAction;
exports.moduleLoadingAction = moduleLoadingAction;
exports.isEluxComponent = isEluxComponent;
exports.injectActions = injectActions;
exports.setLoading = setLoading;
exports.reducer = reducer;
exports.effect = effect;
exports.logger = logger;
exports.deepMergeState = deepMergeState;
exports.mergeState = mergeState;
exports.action = exports.mutation = exports.MetaData = exports.ActionTypes = exports.config = void 0;

var _env = require("./env");

var _sprite = require("./sprite");

var config = {
  NSP: '.',
  MSP: ',',
  CSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2
};
exports.config = config;

function setConfig(_config) {
  _config.NSP !== undefined && (config.NSP = _config.NSP);
  _config.MSP !== undefined && (config.MSP = _config.MSP);
  _config.MutableData !== undefined && (config.MutableData = _config.MutableData);
  _config.DepthTimeOnLoading !== undefined && (config.DepthTimeOnLoading = _config.DepthTimeOnLoading);
}

var ActionTypes = {
  MLoading: 'Loading',
  MInit: 'Init',
  MReInit: 'ReInit',
  Error: "Elux" + config.NSP + "Error"
};
exports.ActionTypes = ActionTypes;

function errorAction(error) {
  return {
    type: ActionTypes.Error,
    payload: [error]
  };
}

function moduleInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MInit,
    payload: [initState]
  };
}

function moduleReInitAction(moduleName, initState) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MReInit,
    payload: [initState]
  };
}

function moduleLoadingAction(moduleName, loadingState) {
  return {
    type: "" + moduleName + config.NSP + ActionTypes.MLoading,
    payload: [loadingState]
  };
}

function isEluxComponent(data) {
  return data['__elux_component__'];
}

var MetaData = {
  appModuleName: 'stage',
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  facadeMap: null,
  clientStore: null,
  moduleGetter: null
};
exports.MetaData = MetaData;

function transformAction(actionName, handler, listenerModule, actionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (actionHandlerMap[actionName][listenerModule]) {
    (0, _sprite.warn)("Action duplicate or conflict : " + actionName + ".");
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

function injectActions(moduleName, handlers) {
  var injectedModules = MetaData.injectedModules;

  if (injectedModules[moduleName]) {
    return;
  }

  injectedModules[moduleName] = true;

  for (var actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      (function () {
        var handler = handlers[actionNames];

        if (handler.__isReducer__ || handler.__isEffect__) {
          actionNames.split(config.MSP).forEach(function (actionName) {
            actionName = actionName.trim().replace(new RegExp("^this[" + config.NSP + "]"), "" + moduleName + config.NSP);
            var arr = actionName.split(config.NSP);

            if (arr[1]) {
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap);
            } else {
              transformAction(moduleName + config.NSP + actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap);
            }
          });
        }
      })();
    }
  }
}

var loadings = {};

function setLoading(store, item, moduleName, groupName) {
  if (groupName === void 0) {
    groupName = 'global';
  }

  var key = moduleName + config.NSP + groupName;

  if (!loadings[key]) {
    loadings[key] = new _sprite.TaskCounter(config.DepthTimeOnLoading);
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

function effect(loadingForGroupName, loadingForModuleName) {
  if (loadingForGroupName === undefined) {
    loadingForGroupName = 'global';
    loadingForModuleName = '';
  }

  return function (target, key, descriptor) {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    var fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (loadingForGroupName) {
      var before = function before(curAction, moduleName, promiseResult) {
        if (!_env.env.isServer) {
          if (loadingForModuleName === '') {
            loadingForModuleName = MetaData.appModuleName;
          } else if (!loadingForModuleName) {
            loadingForModuleName = moduleName;
          }

          setLoading(MetaData.clientStore, promiseResult, loadingForModuleName, loadingForGroupName);
        }
      };

      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }

      fun.__decorators__.push([before, null]);
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

function deepMergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (config.MutableData) {
    return _sprite.deepMerge.apply(void 0, [target].concat(args));
  }

  return _sprite.deepMerge.apply(void 0, [{}, target].concat(args));
}

function mergeState(target) {
  if (target === void 0) {
    target = {};
  }

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  if (config.MutableData) {
    return Object.assign.apply(Object, [target].concat(args));
  }

  return Object.assign.apply(Object, [{}, target].concat(args));
}