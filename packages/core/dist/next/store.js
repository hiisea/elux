import env from './env';
import { isPromise, compose } from './utils';
import { createRedux } from './redux';
import { devLogger } from './devtools';
import { MetaData, coreConfig } from './basic';
import { ActionTypes, moduleRouteChangeAction, errorAction } from './actions';
import { loadModel } from './inject';
export const routeMiddleware = ({
  dispatch,
  getStore
}) => next => action => {
  if (action.type === `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`) {
    const existsModules = Object.keys(getStore().getState()).reduce((obj, moduleName) => {
      obj[moduleName] = true;
      return obj;
    }, {});
    const result = next(action);
    const [routeState] = action.payload;
    Object.keys(routeState.params).forEach(moduleName => {
      const moduleState = routeState.params[moduleName];

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
export function forkStore(originalStore, newRouteState) {
  const {
    sid,
    options: {
      initState,
      middlewares,
      logger
    },
    router
  } = originalStore;
  return createStore(sid + 1, router, {
    [coreConfig.RouteModuleName]: newRouteState
  }, initState, middlewares, logger);
}

const preMiddleware = ({
  getStore
}) => next => action => {
  if (action.type === ActionTypes.Error) {
    const actionData = getActionData(action);

    if (isProcessedError(actionData[0])) {
      return undefined;
    }

    actionData[0] = setProcessedError(actionData[0], true);
  }

  const [moduleName, actionName] = action.type.split(coreConfig.NSP);

  if (env.isServer && actionName === ActionTypes.MLoading) {
    return undefined;
  }

  if (moduleName && actionName && MetaData.moduleGetter[moduleName]) {
    const store = getStore();

    if (!store.injectedModules[moduleName]) {
      const result = loadModel(moduleName, store);

      if (isPromise(result)) {
        return result.then(() => next(action));
      }
    }
  }

  return next(action);
};

export function createStore(sid, router, data, initState, middlewares, logger) {
  const redux = createRedux(initState(data));
  const {
    getState,
    subscribe,
    update: _update
  } = redux;

  const getRouteParams = moduleName => {
    const routeState = getState(coreConfig.RouteModuleName);
    return moduleName ? routeState.params[moduleName] : routeState.params;
  };

  const options = {
    initState,
    logger,
    middlewares
  };
  const loadingGroups = {};
  const injectedModules = {};
  const currentData = {
    actionName: '',
    prevState: {}
  };
  let _isActive = false;

  const isActive = () => {
    return _isActive;
  };

  const setActive = status => {
    if (_isActive !== status) {
      _isActive = status;
    }
  };

  const getCurrentActionName = () => currentData.actionName;

  const getCurrentState = moduleName => {
    const state = currentData.prevState;
    return moduleName ? state[moduleName] : state;
  };

  const destroy = () => {
    Object.keys(injectedModules).forEach(moduleName => {
      injectedModules[moduleName].destroy();
    });
  };

  const update = (actionName, state) => {
    _update(actionName, state);

    router.latestState = { ...router.latestState,
      ...state
    };
  };

  let dispatch = action => {
    throw new Error('Dispatching while constructing your middleware is not allowed. ');
  };

  function applyEffect(moduleName, handler, modelInstance, action, actionData) {
    const effectResult = handler.apply(modelInstance, actionData);
    const decorators = handler.__decorators__;

    if (decorators) {
      const results = [];
      decorators.forEach((decorator, index) => {
        results[index] = decorator[0].call(modelInstance, action, effectResult);
      });
      handler.__decoratorResults__ = results;
    }

    return effectResult.then(reslove => {
      if (decorators) {
        const results = handler.__decoratorResults__ || [];
        decorators.forEach((decorator, index) => {
          if (decorator[1]) {
            decorator[1].call(modelInstance, 'Resolved', results[index], reslove);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      return reslove;
    }, error => {
      if (decorators) {
        const results = handler.__decoratorResults__ || [];
        decorators.forEach((decorator, index) => {
          if (decorator[1]) {
            decorator[1].call(modelInstance, 'Rejected', results[index], error);
          }
        });
        handler.__decoratorResults__ = undefined;
      }

      if (isProcessedError(error)) {
        throw error;
      } else {
        return dispatch(errorAction(setProcessedError(error, false)));
      }
    });
  }

  function respondHandler(action, isReducer, prevData) {
    let logs;
    const handlersMap = isReducer ? MetaData.reducersMap : MetaData.effectsMap;
    const actionName = action.type;
    const [actionModuleName] = actionName.split(coreConfig.NSP);
    const commonHandlers = handlersMap[action.type];
    const universalActionType = actionName.replace(new RegExp(`[^${coreConfig.NSP}]+`), '*');
    const universalHandlers = handlersMap[universalActionType];
    const handlers = { ...commonHandlers,
      ...universalHandlers
    };
    const handlerModuleNames = Object.keys(handlers);

    if (handlerModuleNames.length > 0) {
      const orderList = [];
      handlerModuleNames.forEach(moduleName => {
        if (moduleName === coreConfig.AppModuleName) {
          orderList.unshift(moduleName);
        } else if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });

      if (action.priority) {
        orderList.unshift(...action.priority);
      }

      const implemented = {};
      const actionData = getActionData(action);

      if (isReducer) {
        Object.assign(currentData, prevData);
        const newState = {};
        orderList.forEach(moduleName => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = injectedModules[moduleName];
            const result = handler.apply(modelInstance, actionData);

            if (result) {
              newState[moduleName] = result;
            }
          }
        });
        logs = [{
          id: sid,
          isActive: _isActive
        }, actionName, actionData, action.priority || [], orderList, Object.assign({}, prevData.prevState, newState), false];
        devLogger(...logs);
        logger && logger(...logs);
        update(actionName, newState);
      } else {
        logs = [{
          id: sid,
          isActive: _isActive
        }, actionName, actionData, action.priority || [], orderList, getState(), true];
        devLogger(...logs);
        logger && logger(...logs);
        const result = [];
        orderList.forEach(moduleName => {
          if (!implemented[moduleName]) {
            implemented[moduleName] = true;
            const handler = handlers[moduleName];
            const modelInstance = injectedModules[moduleName];
            Object.assign(currentData, prevData);
            result.push(applyEffect(moduleName, handler, modelInstance, action, actionData));
          }
        });
        const task = result.length === 1 ? result[0] : Promise.all(result);
        return task;
      }
    }

    return undefined;
  }

  function _dispatch(action) {
    const prevData = {
      actionName: action.type,
      prevState: getState()
    };
    respondHandler(action, true, prevData);
    return respondHandler(action, false, prevData);
  }

  const middlewareAPI = {
    getStore: () => store,
    dispatch: action => dispatch(action)
  };
  const chain = [preMiddleware, routeMiddleware, ...(middlewares || [])].map(middleware => middleware(middlewareAPI));
  dispatch = compose(...chain)(_dispatch);
  const store = {
    sid,
    getState,
    getRouteParams,
    subscribe,
    dispatch,
    router,
    loadingGroups,
    injectedModules,
    destroy,
    getCurrentActionName,
    getCurrentState,
    update,
    isActive,
    setActive,
    options
  };
  return store;
}
export const errorProcessed = '__eluxProcessed__';
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