import _extends from "@babel/runtime/helpers/esm/extends";
import env from './env';
import { isPromise, compose } from './utils';
import { createRedux } from './redux';
import { devLogger } from './devtools';
import { MetaData, coreConfig } from './basic';
import { ActionTypes, moduleRouteChangeAction, errorAction } from './actions';
import { loadModel } from './inject';
export var routeMiddleware = function routeMiddleware(_ref) {
  var dispatch = _ref.dispatch,
      getStore = _ref.getStore;
  return function (next) {
    return function (action) {
      if (action.type === "" + coreConfig.RouteModuleName + coreConfig.NSP + ActionTypes.MRouteChange) {
        var existsModules = Object.keys(getStore().getState()).reduce(function (obj, moduleName) {
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
              dispatch(moduleRouteChangeAction(moduleName, moduleState, routeState.action));
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
export function forkStore(originalStore, newRouteState) {
  var _createStore;

  var sid = originalStore.sid,
      _originalStore$option = originalStore.options,
      initState = _originalStore$option.initState,
      middlewares = _originalStore$option.middlewares,
      logger = _originalStore$option.logger,
      router = originalStore.router;
  return createStore(sid + 1, router, (_createStore = {}, _createStore[coreConfig.RouteModuleName] = newRouteState, _createStore), initState, middlewares, logger);
}

var preMiddleware = function preMiddleware(_ref3) {
  var getStore = _ref3.getStore;
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
        var store = getStore();

        if (!store.injectedModules[moduleName]) {
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

export function createStore(sid, router, data, initState, middlewares, logger) {
  var redux = createRedux(initState(data));
  var getState = redux.getState,
      subscribe = redux.subscribe,
      _update = redux.update;

  var getRouteParams = function getRouteParams(moduleName) {
    var routeState = getState(coreConfig.RouteModuleName);
    return moduleName ? routeState.params[moduleName] : routeState.params;
  };

  var options = {
    initState: initState,
    logger: logger,
    middlewares: middlewares
  };
  var loadingGroups = {};
  var injectedModules = {};
  var refData = {
    currentActionName: '',
    uncommittedState: {},
    isActive: false
  };

  var isActive = function isActive() {
    return refData.isActive;
  };

  var setActive = function setActive(status) {
    if (refData.isActive !== status) {
      refData.isActive = status;
    }
  };

  var getCurrentActionName = function getCurrentActionName() {
    return refData.currentActionName;
  };

  var getUncommittedState = function getUncommittedState(moduleName) {
    var state = refData.uncommittedState;
    return moduleName ? state[moduleName] : state;
  };

  var destroy = function destroy() {
    Object.keys(injectedModules).forEach(function (moduleName) {
      injectedModules[moduleName].destroy();
    });
  };

  var update = function update(actionName, state) {
    _update(actionName, state);

    router.latestState = _extends({}, router.latestState, state);
  };

  var _dispatch2 = function dispatch(action) {
    throw new Error('Dispatching while constructing your middleware is not allowed. ');
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

  function respondHandler(action, isReducer) {
    var logs;
    var handlersMap = isReducer ? MetaData.reducersMap : MetaData.effectsMap;
    var actionName = action.type;
    var actionPriority = action.priority || [];
    var actionData = getActionData(action);

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
        if (moduleName === coreConfig.AppModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });
      orderList.unshift.apply(orderList, actionPriority);
      var implemented = {};

      if (isReducer) {
        var prevState = getState();
        var newState = {};

        var uncommittedState = _extends({}, prevState);

        refData.uncommittedState = uncommittedState;
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = injectedModules[moduleName];
            var result = handler.apply(modelInstance, actionData);

            if (result) {
              newState[moduleName] = result;
              uncommittedState[moduleName] = result;
            }
          }
        });
        logs = [{
          id: sid,
          isActive: refData.isActive
        }, actionName, actionData, actionPriority, orderList, uncommittedState, false];
        devLogger.apply(void 0, logs);
        logger && logger.apply(void 0, logs);
        update(actionName, newState);
      } else {
        logs = [{
          id: sid,
          isActive: refData.isActive
        }, actionName, actionData, actionPriority, orderList, getState(), true];
        devLogger.apply(void 0, logs);
        logger && logger.apply(void 0, logs);
        var result = [];
        orderList.forEach(function (moduleName) {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            var handler = handlers[moduleName];
            var modelInstance = injectedModules[moduleName];
            refData.currentActionName = actionName;
            result.push(applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        var task = result.length === 1 ? result[0] : Promise.all(result);
        return task;
      }
    }

    return undefined;
  }

  function _dispatch(action) {
    respondHandler(action, true);
    return respondHandler(action, false);
  }

  var middlewareAPI = {
    getStore: function getStore() {
      return store;
    },
    dispatch: function dispatch(action) {
      return _dispatch2(action);
    }
  };
  var chain = [preMiddleware, routeMiddleware].concat(middlewares || []).map(function (middleware) {
    return middleware(middlewareAPI);
  });
  _dispatch2 = compose.apply(void 0, chain)(_dispatch);
  var store = {
    sid: sid,
    getState: getState,
    getRouteParams: getRouteParams,
    subscribe: subscribe,
    dispatch: _dispatch2,
    router: router,
    loadingGroups: loadingGroups,
    injectedModules: injectedModules,
    destroy: destroy,
    getCurrentActionName: getCurrentActionName,
    getUncommittedState: getUncommittedState,
    update: update,
    isActive: isActive,
    setActive: setActive,
    options: options
  };
  return store;
}
export var errorProcessed = '__eluxProcessed__';
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