import _extends from "@babel/runtime/helpers/esm/extends";
import env from './env';
import { promiseCaseCallback, toPromise, compose, isPromise } from './utils';
import { MetaData, coreConfig, mergeState } from './basic';
import { devLogger } from './devtools';
import { getModule, injectActions } from './inject';
import { ActionTypes, errorAction, moduleInitAction, isProcessedError, setProcessedError } from './actions';
import { AppModel } from './module';
export function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}
export var preMiddleware = function preMiddleware(_ref) {
  var getStore = _ref.getStore;
  return function (next) {
    return function (action) {
      if (action.type === "" + coreConfig.AppModuleName + coreConfig.NSP + ActionTypes.Error) {
        var actionData = getActionData(action);

        if (isProcessedError(actionData[0])) {
          return undefined;
        }

        actionData[0] = setProcessedError(actionData[0], true);
      }

      var _action$type$split = action.type.split(coreConfig.NSP),
          moduleName = _action$type$split[0],
          actionName = _action$type$split[1];

      if (!moduleName || !actionName || moduleName !== coreConfig.AppModuleName && !coreConfig.ModuleGetter[moduleName]) {
        return undefined;
      }

      if (env.isServer && actionName === ActionTypes.Loading) {
        return undefined;
      }

      var store = getStore();
      var state = store.getState();

      if (!state[moduleName] && actionName !== ActionTypes.Init) {
        return promiseCaseCallback(store.mount(moduleName, false), function () {
          return next(action);
        });
      }

      return next(action);
    };
  };
};
export var CoreRouter = function () {
  function CoreRouter(location, action, nativeData) {
    this.listenerId = 0;
    this.listenerMap = {};
    this.location = location;
    this.action = action;
    this.nativeData = nativeData;

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

injectActions(new AppModel(null));
export var Store = function () {
  function Store(sid, router) {
    var _mergeState,
        _this$mountedModels,
        _this = this;

    this.state = void 0;
    this.mountedModels = void 0;
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
    var routeLocation = router.location,
        routeAction = router.action;
    var appState = {
      routeAction: routeAction,
      routeLocation: routeLocation,
      globalLoading: 'Stop',
      initError: ''
    };
    this.state = mergeState(coreConfig.StoreInitState(), (_mergeState = {}, _mergeState[coreConfig.AppModuleName] = appState, _mergeState));
    var appModel = new AppModel(this);
    this.mountedModels = (_this$mountedModels = {}, _this$mountedModels[coreConfig.AppModuleName] = appModel, _this$mountedModels);
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
    var orignModel = this.mountedModels[moduleName];

    if (orignModel && !isPromise(orignModel)) {
      var model = new ModelClass(moduleName, this);
      this.mountedModels[moduleName] = model;

      if (this.active) {
        orignModel.onInactive();
        model.onActive();
      }
    }
  };

  _proto2.getCurrentAction = function getCurrentAction() {
    return this.currentAction;
  };

  _proto2.mountModule = function mountModule(moduleName, routeChanged) {
    var _this2 = this;

    var errorCallback = function errorCallback(err) {
      delete mountedModels[moduleName];
      throw err;
    };

    var initStateCallback = function initStateCallback(initState) {
      mountedModels[moduleName] = model;

      _this2.dispatch(moduleInitAction(moduleName, initState));

      if (_this2.active) {
        model.onActive();
      }

      return model.onStartup(routeChanged);
    };

    var getModuleCallback = function getModuleCallback(module) {
      model = new module.ModelClass(moduleName, _this2);
      var initStateOrPromise = model.onInit(routeChanged);

      if (isPromise(initStateOrPromise)) {
        return initStateOrPromise.then(initStateCallback, errorCallback);
      } else {
        return initStateCallback(initStateOrPromise);
      }
    };

    var mountedModels = this.mountedModels;
    var moduleOrPromise = getModule(moduleName);
    var model = null;

    if (isPromise(moduleOrPromise)) {
      return moduleOrPromise.then(getModuleCallback, errorCallback);
    } else {
      var result = getModuleCallback(moduleOrPromise);

      if (isPromise(result)) {
        return result;
      } else {
        return model;
      }
    }
  };

  _proto2.mount = function mount(moduleName, routeChanged) {
    if (!coreConfig.ModuleGetter[moduleName]) {
      return;
    }

    var mountedModels = this.mountedModels;

    if (!mountedModels[moduleName]) {
      mountedModels[moduleName] = this.mountModule(moduleName, routeChanged);
    }

    var result = mountedModels[moduleName];
    return isPromise(result) ? result : undefined;
  };

  _proto2.setActive = function setActive() {
    if (!this.active) {
      this.active = true;
      var mountedModels = this.mountedModels;
      Object.keys(mountedModels).forEach(function (moduleName) {
        var modelOrPromise = mountedModels[moduleName];

        if (modelOrPromise && !isPromise(modelOrPromise)) {
          modelOrPromise.onActive();
        }
      });
    }
  };

  _proto2.setInactive = function setInactive() {
    if (this.active) {
      this.active = false;
      var mountedModels = this.mountedModels;
      Object.keys(mountedModels).forEach(function (moduleName) {
        var modelOrPromise = mountedModels[moduleName];

        if (modelOrPromise && !isPromise(modelOrPromise)) {
          modelOrPromise.onInactive();
        }
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
    var _this3 = this;

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

      _this3.ensureCanMutateNextListeners();

      var index = _this3.nextListeners.indexOf(listener);

      _this3.nextListeners.splice(index, 1);

      _this3.currentListeners = [];
    };
  };

  _proto2.respondHandler = function respondHandler(action, isReducer) {
    var _this4 = this;

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

      var mountedModels = this.mountedModels;
      var implemented = {};
      orderList = orderList.filter(function (moduleName) {
        if (implemented[moduleName] || !handlers[moduleName]) {
          return false;
        }

        implemented[moduleName] = true;
        return mountedModels[moduleName] && !isPromise(mountedModels[moduleName]);
      });
      logs.handers = orderList;

      if (isReducer) {
        var newState = {};

        var uncommittedState = this.uncommittedState = _extends({}, prevState);

        orderList.forEach(function (moduleName) {
          var model = mountedModels[moduleName];
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
          var model = mountedModels[moduleName];
          var handler = handlers[moduleName];
          _this4.currentAction = action;
          var result = handler.apply(model, actionData);
          effectHandlers.push(applyEffect(toPromise(result), _this4, model, action, _this4.dispatch, handler.__decorators__));
        });
        var task = effectHandlers.length === 1 ? effectHandlers[0] : Promise.all(effectHandlers);
        return task;
      }
    } else {
      if (isReducer) {
        devLogger(logs);
        storeLogger(logs);
      } else {
        if (actionName === "" + coreConfig.AppModuleName + coreConfig.NSP + ActionTypes.Error) {
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