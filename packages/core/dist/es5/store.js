import _extends from "@babel/runtime/helpers/esm/extends";
import { errorAction, getErrorActionType, getInitActionType, isProcessedError, setProcessedError } from './actions';
import { coreConfig, mergeState, MetaData } from './basic';
import { devLogger } from './devtools';
import env from './env';
import { getModule, injectActions } from './inject';
import { compose, isPromise, promiseCaseCallback, toPromise } from './utils';
export function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}
export var preMiddleware = function preMiddleware(_ref) {
  var getStore = _ref.getStore;
  return function (next) {
    return function (action) {
      if (action.type === getErrorActionType()) {
        var actionData = getActionData(action);

        if (isProcessedError(actionData[0])) {
          return undefined;
        }

        actionData[0] = setProcessedError(actionData[0], true);
      }

      var _action$type$split = action.type.split(coreConfig.NSP),
          moduleName = _action$type$split[0],
          actionName = _action$type$split[1];

      if (!moduleName || !actionName || !coreConfig.ModuleGetter[moduleName]) {
        return undefined;
      }

      var store = getStore();
      var state = store.getState();

      if (!state[moduleName] && action.type !== getInitActionType(moduleName)) {
        return promiseCaseCallback(store.mount(moduleName, 'update'), function () {
          return next(action);
        });
      }

      return next(action);
    };
  };
};
export var CoreRouter = function () {
  function CoreRouter(location, nativeRequest) {
    this.listenerId = 0;
    this.listenerMap = {};
    this.action = 'init';
    this.routeKey = '';
    this.location = location;
    this.nativeRequest = nativeRequest;

    if (!MetaData.clientRouter) {
      MetaData.clientRouter = this;
    }
  }

  var _proto = CoreRouter.prototype;

  _proto.addListener = function addListener(callback) {
    this.listenerId++;
    var id = "" + this.listenerId;
    var listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return function () {
      delete listenerMap[id];
    };
  };

  _proto.dispatch = function dispatch(data) {
    var listenerMap = this.listenerMap;
    var promiseResults = [];
    Object.keys(listenerMap).forEach(function (id) {
      var result = listenerMap[id](data);

      if (isPromise(result)) {
        promiseResults.push(result);
      }
    });

    if (promiseResults.length === 0) {
      return undefined;
    } else if (promiseResults.length === 1) {
      return promiseResults[0];
    } else {
      return Promise.all(promiseResults).then(function () {
        return undefined;
      });
    }
  };

  return CoreRouter;
}();

function applyEffect(effectResult, store, model, action, dispatch, decorators) {
  if (decorators === void 0) {
    decorators = [];
  }

  var decoratorBeforeResults = [];
  decorators.forEach(function (decorator, index) {
    decoratorBeforeResults[index] = decorator[0].call(model, store, action, effectResult);
  });
  return effectResult.then(function (reslove) {
    decorators.forEach(function (decorator, index) {
      if (decorator[1]) {
        decorator[1].call(model, 'Resolved', decoratorBeforeResults[index], reslove);
      }
    });
    return reslove;
  }, function (error) {
    decorators.forEach(function (decorator, index) {
      if (decorator[1]) {
        decorator[1].call(model, 'Rejected', decoratorBeforeResults[index], error);
      }
    });

    if (isProcessedError(error)) {
      throw error;
    } else {
      return dispatch(errorAction(setProcessedError(error, false)));
    }
  });
}

export var Store = function () {
  function Store(sid, router) {
    var _this = this;

    this.state = coreConfig.StoreInitState();
    this.injectedModels = {};
    this.mountedModules = {};
    this.currentListeners = [];
    this.nextListeners = [];
    this.active = false;
    this.currentAction = void 0;
    this.uncommittedState = {};

    this.dispatch = function (action) {
      throw 'Dispatching action while constructing your middleware is not allowed.';
    };

    this.loadingGroups = {};
    this.sid = sid;
    this.router = router;
    var middlewareAPI = {
      getStore: function getStore() {
        return _this;
      },
      dispatch: function dispatch(action) {
        return _this.dispatch(action);
      }
    };

    var _dispatch = function _dispatch(action) {
      _this.respondHandler(action, true);

      return _this.respondHandler(action, false);
    };

    var chain = [preMiddleware].concat(coreConfig.StoreMiddlewares).map(function (middleware) {
      return middleware(middlewareAPI);
    });
    this.dispatch = compose.apply(void 0, chain)(_dispatch);
  }

  var _proto2 = Store.prototype;

  _proto2.clone = function clone() {
    return new Store(this.sid + 1, this.router);
  };

  _proto2.hotReplaceModel = function hotReplaceModel(moduleName, ModelClass) {
    var orignModel = this.injectedModels[moduleName];

    if (orignModel) {
      var model = new ModelClass(moduleName, this);
      this.injectedModels[moduleName] = model;

      if (this.active) {
        orignModel.onInactive();
        model.onActive();
      }
    }
  };

  _proto2.getCurrentAction = function getCurrentAction() {
    return this.currentAction;
  };

  _proto2.mount = function mount(moduleName, env) {
    var _this2 = this;

    if (!coreConfig.ModuleGetter[moduleName]) {
      return;
    }

    var mountedModules = this.mountedModules;
    var injectedModels = this.injectedModels;

    var errorCallback = function errorCallback(err) {
      if (!_this2.state[moduleName]) {
        delete mountedModules[moduleName];
        delete injectedModels[moduleName];
      }

      throw err;
    };

    var getModuleCallback = function getModuleCallback(module) {
      var model = new module.ModelClass(moduleName, _this2);
      _this2.injectedModels[moduleName] = model;
      return model.onMount(env);
    };

    if (!mountedModules[moduleName]) {
      var _result;

      try {
        var moduleOrPromise = getModule(moduleName);
        _result = promiseCaseCallback(moduleOrPromise, getModuleCallback);
      } catch (err) {
        errorCallback(err);
      }

      if (isPromise(_result)) {
        mountedModules[moduleName] = _result.then(function () {
          mountedModules[moduleName] = true;
        }, errorCallback);
      } else {
        mountedModules[moduleName] = true;
      }
    }

    var result = mountedModules[moduleName];
    return result === true ? undefined : result;
  };

  _proto2.setActive = function setActive() {
    var _this3 = this;

    if (!this.active) {
      this.active = true;
      Object.keys(this.injectedModels).forEach(function (moduleName) {
        var model = _this3.injectedModels[moduleName];
        model.onActive();
      });
    }
  };

  _proto2.setInactive = function setInactive() {
    var _this4 = this;

    if (this.active) {
      this.active = false;
      Object.keys(this.injectedModels).forEach(function (moduleName) {
        var model = _this4.injectedModels[moduleName];
        model.onInactive();
      });
    }
  };

  _proto2.ensureCanMutateNextListeners = function ensureCanMutateNextListeners() {
    if (this.nextListeners === this.currentListeners) {
      this.nextListeners = this.currentListeners.slice();
    }
  };

  _proto2.destroy = function destroy() {
    this.setInactive();

    this.dispatch = function () {};

    this.mount = function () {};
  };

  _proto2.update = function update(newState) {
    this.state = mergeState(this.state, newState);
    var listeners = this.currentListeners = this.nextListeners;

    for (var i = 0; i < listeners.length; i++) {
      var listener = listeners[i];
      listener();
    }
  };

  _proto2.getState = function getState(moduleName) {
    return moduleName ? this.state[moduleName] : this.state;
  };

  _proto2.getUncommittedState = function getUncommittedState() {
    return this.uncommittedState;
  };

  _proto2.subscribe = function subscribe(listener) {
    var _this5 = this;

    if (typeof listener !== 'function') {
      throw new Error('Expected the listener to be a function.');
    }

    var isSubscribed = true;
    this.ensureCanMutateNextListeners();
    this.nextListeners.push(listener);
    return function () {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      _this5.ensureCanMutateNextListeners();

      var index = _this5.nextListeners.indexOf(listener);

      _this5.nextListeners.splice(index, 1);

      _this5.currentListeners = [];
    };
  };

  _proto2.respondHandler = function respondHandler(action, isReducer) {
    var _this6 = this;

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
    var prevState = this.getState();
    var logs = {
      id: this.sid,
      isActive: this.active,
      actionName: actionName,
      payload: actionData,
      priority: actionPriority,
      handers: [],
      state: 'No Change',
      effect: !isReducer
    };
    var storeLogger = coreConfig.StoreLogger;

    if (handlerModuleNames.length > 0) {
      var _orderList;

      var orderList = [];
      handlerModuleNames.forEach(function (moduleName) {
        if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });

      (_orderList = orderList).unshift.apply(_orderList, actionPriority);

      var injectedModels = this.injectedModels;
      var implemented = {};
      orderList = orderList.filter(function (moduleName) {
        if (implemented[moduleName] || !handlers[moduleName]) {
          return false;
        }

        implemented[moduleName] = true;
        return injectedModels[moduleName];
      });
      logs.handers = orderList;

      if (isReducer) {
        var newState = {};

        var uncommittedState = this.uncommittedState = _extends({}, prevState);

        orderList.forEach(function (moduleName) {
          var model = injectedModels[moduleName];
          var handler = handlers[moduleName];
          var result = handler.apply(model, actionData);

          if (result) {
            newState[moduleName] = result;
            uncommittedState[moduleName] = result;
          }
        });
        logs.state = uncommittedState;
        devLogger(logs);
        storeLogger(logs);
        this.update(newState);
      } else {
        devLogger(logs);
        storeLogger(logs);
        var effectHandlers = [];
        orderList.forEach(function (moduleName) {
          var model = injectedModels[moduleName];
          var handler = handlers[moduleName];
          _this6.currentAction = action;
          var result = handler.apply(model, actionData);
          effectHandlers.push(applyEffect(toPromise(result), _this6, model, action, _this6.dispatch, handler.__decorators__));
        });
        var task = effectHandlers.length === 1 ? effectHandlers[0] : Promise.all(effectHandlers);
        return task;
      }
    } else {
      if (isReducer) {
        devLogger(logs);
        storeLogger(logs);
      } else {
        if (actionName === getErrorActionType()) {
          return Promise.reject(actionData);
        }
      }
    }

    return undefined;
  };

  return Store;
}();
export function modelHotReplacement(moduleName, ModelClass) {
  var moduleCache = MetaData.moduleCaches[moduleName];

  if (moduleCache) {
    promiseCaseCallback(moduleCache, function (module) {
      module.ModelClass = ModelClass;
      var newModel = new ModelClass(moduleName, null);
      injectActions(newModel, true);
      var page = MetaData.clientRouter.getCurrentPage();
      page.store.hotReplaceModel(moduleName, ModelClass);
    });
  }

  env.console.log("[HMR] @Elux Updated model: " + moduleName);
}