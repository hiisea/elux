"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.createStore = createStore;
exports.errorProcessed = void 0;
exports.getActionData = getActionData;
exports.isProcessedError = isProcessedError;
exports.setProcessedError = setProcessedError;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _env = _interopRequireDefault(require("./env"));

var _sprite = require("./sprite");

var _redux = require("./redux");

var _basic = require("./basic");

var _actions = require("./actions");

var _inject = require("./inject");

var _router = require("./router");

var _devtools = require("./devtools");

var errorProcessed = '__eluxProcessed__';
exports.errorProcessed = errorProcessed;

function isProcessedError(error) {
  return error && !!error[errorProcessed];
}

function setProcessedError(error, processed) {
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

function getActionData(action) {
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

function createStore(sid, router, data, initState, middlewares, logger) {
  var redux = (0, _redux.createRedux)(initState(data));
  var getState = redux.getState,
      subscribe = redux.subscribe,
      _update = redux.update;
  var options = {
    initState: initState,
    logger: logger,
    middlewares: middlewares
  };
  var loadingGroups = {};
  var injectedModules = {};
  var currentData = {
    actionName: '',
    prevState: {}
  };
  var _isActive = false;

  var isActive = function isActive() {
    return _isActive;
  };

  var setActive = function setActive(status) {
    if (_isActive !== status) {
      _isActive = status;
    }
  };

  var getCurrentActionName = function getCurrentActionName() {
    return currentData.actionName;
  };

  var getCurrentState = function getCurrentState(moduleName) {
    var state = currentData.prevState;
    return moduleName ? state[moduleName] : state;
  };

  var destroy = function destroy() {
    Object.keys(injectedModules).forEach(function (moduleName) {
      injectedModules[moduleName].destroy();
    });
  };

  var update = function update(actionName, state) {
    _update(actionName, state);

    router.latestState = (0, _extends2.default)({}, router.latestState, state);
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
        return _dispatch2((0, _actions.errorAction)(setProcessedError(error, false)));
      }
    });
  }

  function respondHandler(action, isReducer, prevData) {
    var logs;
    var handlersMap = isReducer ? _basic.MetaData.reducersMap : _basic.MetaData.effectsMap;
    var actionName = action.type;

    var _actionName$split = actionName.split(_basic.coreConfig.NSP),
        actionModuleName = _actionName$split[0];

    var commonHandlers = handlersMap[action.type];
    var universalActionType = actionName.replace(new RegExp("[^" + _basic.coreConfig.NSP + "]+"), '*');
    var universalHandlers = handlersMap[universalActionType];
    var handlers = (0, _extends2.default)({}, commonHandlers, universalHandlers);
    var handlerModuleNames = Object.keys(handlers);

    if (handlerModuleNames.length > 0) {
      var orderList = [];
      handlerModuleNames.forEach(function (moduleName) {
        if (moduleName === _basic.coreConfig.AppModuleName) {
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
        logs = [{
          id: sid,
          isActive: _isActive
        }, actionName, actionData, action.priority || [], orderList, Object.assign({}, prevData.prevState, newState), false];

        _devtools.devLogger.apply(void 0, logs);

        logger && logger.apply(void 0, logs);
        update(actionName, newState);
      } else {
        logs = [{
          id: sid,
          isActive: _isActive
        }, actionName, actionData, action.priority || [], orderList, getState(), true];

        _devtools.devLogger.apply(void 0, logs);

        logger && logger.apply(void 0, logs);
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
        var task = result.length === 1 ? result[0] : Promise.all(result);
        return task;
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

  var middlewareAPI = {
    getState: getState,
    dispatch: function dispatch(action) {
      return _dispatch2(action);
    }
  };

  var preMiddleware = function preMiddleware() {
    return function (next) {
      return function (action) {
        if (action.type === _actions.ActionTypes.Error) {
          var actionData = getActionData(action);

          if (isProcessedError(actionData[0])) {
            return undefined;
          }

          actionData[0] = setProcessedError(actionData[0], true);
        }

        var _action$type$split = action.type.split(_basic.coreConfig.NSP),
            moduleName = _action$type$split[0],
            actionName = _action$type$split[1];

        if (_env.default.isServer && actionName === _actions.ActionTypes.MLoading) {
          return undefined;
        }

        if (moduleName && actionName && _basic.MetaData.moduleGetter[moduleName]) {
          if (!injectedModules[moduleName]) {
            var result = (0, _inject.loadModel)(moduleName, store);

            if ((0, _sprite.isPromise)(result)) {
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

  var chain = [preMiddleware, _router.routeMiddleware].concat(middlewares || []).map(function (middleware) {
    return middleware(middlewareAPI);
  });
  _dispatch2 = compose.apply(void 0, chain)(_dispatch);
  var store = {
    sid: sid,
    getState: getState,
    subscribe: subscribe,
    dispatch: _dispatch2,
    router: router,
    loadingGroups: loadingGroups,
    injectedModules: injectedModules,
    destroy: destroy,
    getCurrentActionName: getCurrentActionName,
    getCurrentState: getCurrentState,
    update: update,
    isActive: isActive,
    setActive: setActive,
    options: options
  };
  return store;
}