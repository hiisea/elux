import _extends from "@babel/runtime/helpers/esm/extends";
import env from './env';
import { isPromise } from './sprite';
import { ActionTypes, coreConfig, errorAction, MetaData } from './basic';
import { loadModel } from './inject';
var errorProcessed = '__eluxProcessed__';
export function isProcessedError(error) {
  return error && !!error[errorProcessed];
}
export function setProcessedError(error, processed) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  Object.defineProperty(error, errorProcessed, {
    value: processed,
    enumerable: false,
    writable: true
  });
  return error;
}
export function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}

function compose() {
  for (var _len = arguments.length, funcs = new Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}

export function forkStore(store) {
  var _store$baseFork = store.baseFork,
      creator = _store$baseFork.creator,
      options = _store$baseFork.options;
  var _store$fork = store.fork,
      middlewares = _store$fork.middlewares,
      injectedModules = _store$fork.injectedModules;
  var initState = store.getPureState();
  var newBStore = creator(_extends({}, options, {
    initState: initState
  }), store.router, store.id + 1);
  var newIStore = enhanceStore(newBStore, middlewares, _extends({}, injectedModules));
  return newIStore;
}
export function enhanceStore(baseStore, middlewares, injectedModules) {
  if (injectedModules === void 0) {
    injectedModules = {};
  }

  var store = baseStore;
  var _getState = baseStore.getState;

  var getState = function getState(moduleName) {
    var state = _getState();

    return moduleName ? state[moduleName] : state;
  };

  store.getState = getState;
  store.injectedModules = injectedModules;
  store.fork = {
    middlewares: middlewares
  };
  var currentData = {
    actionName: '',
    prevState: {}
  };
  var update = baseStore.update;

  store.getCurrentActionName = function () {
    return currentData.actionName;
  };

  store.getCurrentState = function (moduleName) {
    var state = currentData.prevState;
    return moduleName ? state[moduleName] : state;
  };

  var _dispatch2 = function dispatch(action) {
    throw new Error('Dispatching while constructing your middleware is not allowed. ');
  };

  var middlewareAPI = {
    getState: getState,
    dispatch: function dispatch(action) {
      return _dispatch2(action);
    }
  };

  var preMiddleware = function preMiddleware() {
    return function (next) {
      return function (action) {
        if (action.type === ActionTypes.Error) {
          var actionData = getActionData(action);

          if (isProcessedError(actionData[0])) {
            return undefined;
          }

          actionData[0] = setProcessedError(actionData[0], true);
        }

        var _action$type$split = action.type.split(coreConfig.NSP),
            moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (env.isServer && actionName === ActionTypes.MLoading) {
          return undefined;
        }

        if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
          if (!injectedModules[moduleName]) {
            var result = loadModel(moduleName, store);

            if (isPromise(result)) {
              return result.then(function () {
                return next(action);
              });
            }
          }
        }

        return next(action);
      };
    };
  };

  function applyEffect(moduleName, handler, modelInstance, action, actionData) {
    var effectResult = handler.apply(modelInstance, actionData);
    var decorators = handler.__decorators__;

    if (decorators) {
      var results = [];
      decorators.forEach(function (decorator, index) {
        results[index] = decorator[0].call(modelInstance, action, effectResult);
      });
      handler.__decoratorResults__ = results;
    }

    return effectResult.then(function (reslove) {
      if (decorators) {
        var _results = handler.__decoratorResults__ || [];

        decorators.forEach(function (decorator, index) {
          if (decorator[1]) {
            decorator[1].call(modelInstance, 'Resolved', _results[index], reslove);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      return reslove;
    }, function (error) {
      if (decorators) {
        var _results2 = handler.__decoratorResults__ || [];

        decorators.forEach(function (decorator, index) {
          if (decorator[1]) {
            decorator[1].call(modelInstance, 'Rejected', _results2[index], error);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      if (isProcessedError(error)) {
        throw error;
      } else {
        return _dispatch2(errorAction(setProcessedError(error, false)));
      }
    });
  }

  function respondHandler(action, isReducer, prevData) {
    var handlersMap = isReducer ? MetaData.reducersMap : MetaData.effectsMap;
    var actionName = action.type;

    var _actionName$split = actionName.split(coreConfig.NSP),
        actionModuleName = _actionName$split[0];

    var commonHandlers = handlersMap[action.type];
    var universalActionType = actionName.replace(new RegExp("[^" + coreConfig.NSP + "]+"), '*');
    var universalHandlers = handlersMap[universalActionType];

    var handlers = _extends({}, commonHandlers, universalHandlers);

    var handlerModuleNames = Object.keys(handlers);

    if (handlerModuleNames.length > 0) {
      var orderList = [];
      handlerModuleNames.forEach(function (moduleName) {
        if (moduleName === MetaData.appModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });

      if (action.priority) {
        orderList.unshift.apply(orderList, action.priority);
      }

      var implemented = {};
      var actionData = getActionData(action);

      if (isReducer) {
        Object.assign(currentData, prevData);
        var newState = {};
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = injectedModules[moduleName];
            var result = handler.apply(modelInstance, actionData);

            if (result) {
              newState[moduleName] = result;
            }
          }
        });
        update(actionName, newState, actionData);
      } else {
        var result = [];
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = injectedModules[moduleName];
            Object.assign(currentData, prevData);
            result.push(applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        return result.length === 1 ? result[0] : Promise.all(result);
      }
    }

    return undefined;
  }

  function _dispatch(action) {
    var prevData = {
      actionName: action.type,
      prevState: getState()
    };
    respondHandler(action, true, prevData);
    return respondHandler(action, false, prevData);
  }

  var arr = middlewares ? [preMiddleware].concat(middlewares) : [preMiddleware];
  var chain = arr.map(function (middleware) {
    return middleware(middlewareAPI);
  });
  _dispatch2 = compose.apply(void 0, chain)(_dispatch);
  store.dispatch = _dispatch2;
  return store;
}