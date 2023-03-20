let root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = new Function('return this')();
}

const env = root;
env.isServer = typeof window === 'undefined' && typeof global === 'object' && global.global === global;

env.encodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof btoa === 'function' ? btoa(str) : typeof Buffer !== 'undefined' ? Buffer.from(str).toString('base64') : str;
};

env.decodeBas64 = function (str) {
  if (!str) {
    return '';
  }

  return typeof atob === 'function' ? atob(str) : typeof Buffer !== 'undefined' ? Buffer.from(str, 'base64').toString() : str;
};

function isPromise(data) {
  return typeof data === 'object' && typeof data.then === 'function';
}
function deepCloneState(state) {
  return JSON.parse(JSON.stringify(state));
}
function promiseCaseCallback(resultOrPromise, callback) {
  if (isPromise(resultOrPromise)) {
    return resultOrPromise.then(result => callback(result));
  }

  return callback(resultOrPromise);
}
function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}
class SingleDispatcher {
  constructor() {
    this.listenerId = 0;
    this.listenerMap = {};
  }

  addListener(callback) {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(data) {
    const listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach(id => {
      listenerMap[id](data);
    });
  }

}
class TaskCounter extends SingleDispatcher {
  constructor(deferSecond = 1) {
    super();
    this.list = [];
    this.ctimer = 0;
    this.deferSecond = deferSecond;
  }

  addItem(promise, note = '') {
    if (!this.list.some(item => item.promise === promise)) {
      this.list.push({
        promise,
        note
      });
      promise.finally(() => this.completeItem(promise));

      if (this.list.length === 1 && !this.ctimer) {
        this.dispatch('Start');
        this.ctimer = env.setTimeout(() => {
          this.ctimer = 0;

          if (this.list.length > 0) {
            this.dispatch('Depth');
          }
        }, this.deferSecond * 1000);
      }
    }

    return promise;
  }

  completeItem(promise) {
    const i = this.list.findIndex(item => item.promise === promise);

    if (i > -1) {
      this.list.splice(i, 1);

      if (this.list.length === 0) {
        if (this.ctimer) {
          env.clearTimeout.call(null, this.ctimer);
          this.ctimer = 0;
        }

        this.dispatch('Stop');
      }
    }

    return this;
  }

}
function deepClone(data) {
  return JSON.parse(JSON.stringify(data));
}
function isServer() {
  return env.isServer;
}
function toPromise(resultOrPromise) {
  if (isPromise(resultOrPromise)) {
    return resultOrPromise;
  }

  return Promise.resolve(resultOrPromise);
}

function getActionData(action) {
  return Array.isArray(action.payload) ? action.payload : [];
}
function testRouteChangeAction(location, routeAction) {
  return {
    type: `${actionConfig.StageModuleName}${actionConfig.NSP}_testRouteChange`,
    payload: [location, routeAction]
  };
}
function beforeRouteChangeAction(location, routeAction) {
  return {
    type: `${actionConfig.StageModuleName}${actionConfig.NSP}_beforeRouteChange`,
    payload: [location, routeAction]
  };
}
function afterRouteChangeAction(location, routeAction) {
  return {
    type: `${actionConfig.StageModuleName}${actionConfig.NSP}_afterRouteChange`,
    payload: [location, routeAction]
  };
}
function initModuleSuccessAction(moduleName, initState) {
  return {
    type: `${moduleName}${actionConfig.NSP}_initState`,
    payload: [initState]
  };
}
function initModuleErrorAction(moduleName, error) {
  const initState = {
    _error: error + ''
  };
  return {
    type: `${moduleName}${actionConfig.NSP}_initState`,
    payload: [initState]
  };
}
function isInitAction(action) {
  const [, actionName] = action.type.split(actionConfig.NSP);
  return actionName === '_initState';
}
function loadingAction(moduleName, groupName, loadingState) {
  return {
    type: `${moduleName}${actionConfig.NSP}_loading`,
    payload: [{
      [groupName]: loadingState
    }]
  };
}
const errorProcessed = '__eluxProcessed__';
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
function isProcessedError(error) {
  return error && !!error[errorProcessed];
}
function errorAction(error) {
  if (typeof error !== 'object') {
    error = {
      message: error
    };
  }

  const processed = !!error[errorProcessed];
  const {
    code = '',
    message = 'unkown error',
    detail
  } = error;
  const actionError = {
    code,
    message,
    detail
  };
  Object.defineProperty(actionError, errorProcessed, {
    value: processed,
    enumerable: false,
    writable: true
  });
  return {
    type: `${actionConfig.StageModuleName}${actionConfig.NSP}_error`,
    payload: [actionError]
  };
}
function setProcessedErrorAction(errorAction) {
  const actionData = getActionData(errorAction);

  if (isProcessedError(actionData[0])) {
    return undefined;
  }

  actionData[0] = setProcessedError(actionData[0], true);
  return errorAction;
}
function isErrorAction(action) {
  return action.type === `${actionConfig.StageModuleName}${actionConfig.NSP}_error`;
}
const actionConfig = {
  NSP: '.',
  StageModuleName: 'stage'
};

function isEluxComponent(data) {
  return data['__elux_component__'];
}
function exportComponent(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
function exportView(component) {
  const eluxComponent = component;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}
class RouteRecord {
  constructor(location, pageStack, store) {
    this.key = void 0;
    this._title = '';
    this.location = location;
    this.pageStack = pageStack;
    this.store = store;
    this.key = [pageStack.key, pageStack.num++].join('_');
  }

  destroy() {
    this.store.destroy();
  }

  active() {
    this.store.setActive(true);
  }

  inactive() {
    this.store.setActive(false);
  }

  get title() {
    return this._title;
  }

  saveTitle(val) {
    this._title = val;
  }

}
const ErrorCodes = {
  ROUTE_RETURN: 'ELIX.ROUTE_RETURN',
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW'
};
class AStore {
  get active() {
    return this._active;
  }

  constructor(sid, uid, router) {
    this.dispatch = void 0;
    this.getState = void 0;
    this.mountedModules = {};
    this.injectedModels = {};
    this._active = false;
    this.sid = sid;
    this.uid = uid;
    this.router = router;
  }

  mount(moduleName, env) {
    if (!baseConfig.ModuleGetter[moduleName]) {
      return;
    }

    const mountedModules = this.mountedModules;

    if (!mountedModules[moduleName]) {
      mountedModules[moduleName] = this.execMount(moduleName);
    }

    const result = mountedModules[moduleName];
    return result === true ? undefined : result;
  }

  async execMount(moduleName) {
    let model, initState, initError;

    try {
      const module = await baseConfig.GetModule(moduleName);
      model = new module.ModelClass(moduleName, this);
      initState = await model.onInit();
    } catch (e) {
      initError = e;
    }

    if (initError) {
      this.dispatch(initModuleErrorAction(moduleName, initError));
      this.mountedModules[moduleName] = undefined;
      throw initError;
    }

    this.dispatch(initModuleSuccessAction(moduleName, initState));
    this.mountedModules[moduleName] = true;
    this.injectedModels[moduleName] = model;

    if (this.active) {
      model.onActive();
    }

    model.onBuild();
  }

}
let clientDocumentHeadTimer = 0;
class ARouter {
  constructor(nativeRouter) {
    this.WindowStackClass = void 0;
    this.PageStackClass = void 0;
    this.StoreClass = void 0;
    this.action = 'init';
    this.prevState = {};
    this.context = {};
    this.nativeRouter = void 0;
    this.taskList = [];
    this.curTask = void 0;
    this.curTaskError = void 0;
    this.curLoopTaskCallback = void 0;
    this.documentHead = '';

    this.onTaskComplete = () => {
      const task = this.taskList.shift();

      if (task) {
        this.curTask = task;
        this.curTaskError = undefined;
        const onTaskComplete = this.onTaskComplete;
        const [exec, resolve, reject] = task;
        env.setTimeout(() => exec().then(onTaskComplete, reason => {
          this.curTaskError = reason;
          onTaskComplete();
          throw reason;
        }).then(resolve, reject), 0);
      } else {
        this.curTask = undefined;

        if (this.curLoopTaskCallback) {
          const [resolve, reject] = this.curLoopTaskCallback;

          if (this.curTaskError) {
            reject(this.curTaskError);
          } else {
            resolve();
          }
        }
      }
    };

    this.nativeRouter = nativeRouter;
    baseConfig.ClientRouter = this;
  }

  addTask(exec) {
    return new Promise((resolve, reject) => {
      const task = [exec, resolve, reject];

      if (this.curTask) {
        this.taskList.push(task);
      } else {
        this.curTask = task;
        this.curTaskError = undefined;
        const onTaskComplete = this.onTaskComplete;
        const [exec, resolve, reject] = task;
        exec().then(onTaskComplete, reason => {
          this.curTaskError = reason;
          onTaskComplete();
          throw reason;
        }).then(resolve, reject);
      }
    });
  }

  getHistoryLength(target) {
    return target === 'window' ? this.windowStack.getLength() - 1 : this.windowStack.getCurrentItem().getLength() - 1;
  }

  findRecordByKey(recordKey) {
    return this.windowStack.findRecordByKey(recordKey);
  }

  findRecordByStep(delta, rootOnly) {
    return this.windowStack.backTest(delta, !!rootOnly);
  }

  getWindowPages() {
    return this.windowStack.getRecords();
  }

  getCurrentPage() {
    return this.windowStack.getCurrentItem().getCurrentItem();
  }

  getHistory(target) {
    return target === 'window' ? this.windowStack.getRecords().slice(1) : this.windowStack.getCurrentItem().getItems().slice(1);
  }

  getDocumentTitle() {
    const arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];
    return arr[1] || '';
  }

  getDocumentHead() {
    return this.documentHead;
  }

  setDocumentHead(html) {
    this.documentHead = html;

    if (!env.isServer && !clientDocumentHeadTimer) {
      clientDocumentHeadTimer = env.setTimeout(() => {
        clientDocumentHeadTimer = 0;
        const arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];

        if (arr[1]) {
          this.nativeRouter.setPageTitle(arr[1]);
        }
      }, 0);
    }
  }

  getLocation() {
    return this.getCurrentPage().location;
  }

  computeUrl(partialLocation, action, target) {
    const curClassname = this.getLocation().classname;
    let defClassname = curClassname;

    if (action === 'relaunch') {
      defClassname = target === 'window' ? '' : curClassname;
    }

    return this.locationToUrl(partialLocation, defClassname);
  }

  mountStore(prevStore, newStore) {
    const prevState = prevStore.getState();
    this.prevState = baseConfig.MutableData ? deepCloneState(prevState) : prevState;
    return newStore.mount(actionConfig.StageModuleName, 'route');
  }

  initialize() {
    return this.nativeRouter.getInitData().then(({
      url: nativeUrl,
      state,
      context
    }) => {
      this.context = context;
      this.prevState = state;
      const url = this.nativeUrlToUrl(nativeUrl);
      const location = this.urlToLocation(url);
      this.windowStack = new this.WindowStackClass(location, new this.StoreClass(0, 0, this));
      const task = [this._init.bind(this), () => undefined, () => undefined];
      this.curTask = task;
      return new Promise((resolve, reject) => {
        this.curLoopTaskCallback = [resolve, reject];
        task[0]().finally(this.onTaskComplete);
      });
    });
  }

  async _init() {
    const store = this.getCurrentPage().store;

    try {
      await store.mount(actionConfig.StageModuleName, 'init');
    } catch (err) {
      env.console.error(err);
    }
  }

  ssr(html) {
    return this.addTask(this._ssr.bind(this, html));
  }

  async _ssr(html) {
    const err = {
      code: ErrorCodes.ROUTE_RETURN,
      message: 'Route cutting out',
      detail: html
    };
    throw err;
  }

}
class WebApp {
  constructor() {
    this.cientSingleton = void 0;
    this.NativeRouterClass = void 0;
    this.RouterClass = void 0;
    this.createUI = void 0;
    this.toDocument = void 0;
  }

  boot() {
    if (this.cientSingleton) {
      return this.cientSingleton;
    }

    const ssrData = env[baseConfig.SSRDataKey];
    const nativeRouter = new this.NativeRouterClass();
    const router = new this.RouterClass(nativeRouter, ssrData);
    const ui = this.createUI();
    this.cientSingleton = Object.assign(ui, {
      render() {
        return Promise.resolve();
      }

    });
    const toDocument = this.toDocument;
    return Object.assign(ui, {
      render({
        id = 'root'
      } = {}) {
        return router.initialize().then(() => {
          toDocument(id, router, !!ssrData, ui);
        });
      }

    });
  }

}
class SsrApp {
  constructor() {
    this.NativeRouterClass = void 0;
    this.RouterClass = void 0;
    this.createUI = void 0;
    this.toString = void 0;
  }

  boot() {
    const nativeRouter = new this.NativeRouterClass();
    const router = new this.RouterClass(nativeRouter, {});
    const ui = this.createUI();
    const toString = this.toString;
    return Object.assign(ui, {
      render({
        id = 'root'
      } = {}) {
        return router.initialize().then(() => {
          const store = router.getCurrentPage().store;
          store.destroy();
          toString(id, router, ui);
        });
      }

    });
  }

}
function mergeState(target = {}, ...args) {
  if (baseConfig.MutableData) {
    return Object.assign(target, ...args);
  }

  return Object.assign({}, target, ...args);
}
const baseConfig = {
  MutableData: false,
  StageViewName: 'main',
  SSRDataKey: 'eluxSSRData',
  ClientRouter: undefined,
  GetModule: undefined,
  ModuleGetter: undefined
};

let reduxDevTools;

if (process.env.NODE_ENV === 'development' && env.__REDUX_DEVTOOLS_EXTENSION__) {
  reduxDevTools = env.__REDUX_DEVTOOLS_EXTENSION__.connect({
    features: {}
  });
  reduxDevTools.init({});
  reduxDevTools.subscribe(({
    type,
    payload
  }) => {
    if (type === 'DISPATCH' && payload.type === 'COMMIT') {
      reduxDevTools.init({});
    }
  });
}

const effects = [];
const devLogger = ({
  id,
  isActive,
  actionName,
  payload,
  priority,
  handers,
  state,
  effect
}) => {
  if (reduxDevTools) {
    const type = [`${id}${isActive ? '' : '*'}|`, actionName, `(${handers.length})`].join('');
    const logItem = {
      type,
      payload,
      priority,
      handers
    };

    if (effect) {
      effects.push(logItem);
    } else {
      logItem.effects = [...effects];
      effects.length = 0;
      reduxDevTools.send(logItem, state);
    }
  }
};

const preMiddleware = ({
  getStore
}) => next => action => {
  if (isErrorAction(action)) {
    const processedErrorAction = setProcessedErrorAction(action);

    if (!processedErrorAction) {
      return undefined;
    }

    action = processedErrorAction;
  }

  const [moduleName, actionName] = action.type.split(actionConfig.NSP);

  if (!moduleName || !actionName || !baseConfig.ModuleGetter[moduleName]) {
    return undefined;
  }

  const store = getStore();
  const moduleState = store.getState(moduleName);

  if ((!moduleState || moduleState._error) && !isInitAction(action)) {
    return promiseCaseCallback(store.mount(moduleName, 'update'), () => next(action));
  }

  return next(action);
};
function reducer(target, key, descriptor) {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }

  const fun = descriptor.value;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
function effect(loadingKey) {
  return (target, key, descriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }

    const fun = descriptor.value;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;

    if (!env.isServer) {
      fun.__loadingKey__ = loadingKey;
    }

    return target.descriptor === descriptor ? target : descriptor;
  };
}
class Store extends AStore {
  constructor(sid, uid, router) {
    super(sid, uid, router);
    this.state = storeConfig.StoreInitState();
    this.uncommittedState = {};
    this.loadingGroups = {};
    this.listenerId = 0;
    this.listenerMap = {};
    this.currentAction = void 0;
    this.listeners = [];

    this.dispatch = action => {
      throw 'Dispatching action while constructing your middleware is not allowed.';
    };

    this.getState = moduleName => {
      return moduleName ? this.state[moduleName] : this.state;
    };

    const middlewareAPI = {
      getStore: () => this,
      dispatch: action => this.dispatch(action)
    };

    const _dispatch = action => {
      this.respondHandler(action, true);
      return this.respondHandler(action, false);
    };

    const chain = [preMiddleware, ...storeConfig.StoreMiddlewares].map(middleware => middleware(middlewareAPI));
    this.dispatch = compose(...chain)(_dispatch);
  }

  getUncommittedState() {
    return this.uncommittedState;
  }

  clone(brand) {
    return new Store(this.sid + 1, brand ? this.uid + 1 : this.uid, this.router);
  }

  getCurrentAction() {
    return this.currentAction;
  }

  setActive(active) {
    if (this._active !== active) {
      this._active = active;
      Object.keys(this.injectedModels).forEach(moduleName => {
        const model = this.injectedModels[moduleName];
        active ? model.onActive() : model.onInactive();
      });
    }
  }

  destroy() {
    this.setActive(false);

    this.dispatch = function () {};

    this.mount = function () {};
  }

  setLoading(item, groupName, moduleName) {
    if (!moduleName) {
      moduleName = actionConfig.StageModuleName;
    }

    const key = moduleName + actionConfig.NSP + groupName;
    const loadings = this.loadingGroups;

    if (!loadings[key]) {
      loadings[key] = new TaskCounter();
      loadings[key].addListener(loadingState => {
        const action = loadingAction(moduleName, groupName, loadingState);
        this.dispatch(action);
      });
    }

    loadings[key].addItem(item);
    return item;
  }

  subscribe(listener) {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = listener;
    return () => {
      delete listenerMap[id];
    };
  }

  update(newState) {
    this.state = mergeState(this.state, newState);
    const listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach(id => {
      if (listenerMap[id]) {
        listenerMap[id]();
      }
    });
  }

  respondHandler(action, isReducer) {
    const handlersMap = isReducer ? storeConfig.ReducersMap : storeConfig.EffectsMap;
    const actionType = action.type;
    const actionPriority = action.priority || [];
    const actionData = getActionData(action);
    const [actionModuleName] = actionType.split(actionConfig.NSP);
    const commonHandlers = handlersMap[action.type];
    const universalActionType = actionType.replace(new RegExp(`[^${actionConfig.NSP}]+`), '*');
    const universalHandlers = handlersMap[universalActionType];
    const handlers = { ...commonHandlers,
      ...universalHandlers
    };
    const handlerModuleNames = Object.keys(handlers);
    const logs = {
      id: this.sid,
      isActive: this.active,
      actionName: actionType,
      payload: actionData,
      priority: actionPriority,
      handers: [],
      state: 'No Change',
      effect: !isReducer
    };

    if (handlerModuleNames.length > 0) {
      let orderList = [];
      handlerModuleNames.forEach(moduleName => {
        if (moduleName === actionModuleName) {
          orderList.unshift(moduleName);
        } else {
          orderList.push(moduleName);
        }
      });
      orderList.unshift(...actionPriority);
      const injectedModels = this.injectedModels;
      const implemented = {};
      orderList = orderList.filter(moduleName => {
        if (implemented[moduleName] || !handlers[moduleName]) {
          return false;
        }

        implemented[moduleName] = true;
        return injectedModels[moduleName];
      });
      logs.handers = orderList;

      if (isReducer) {
        const prevState = this.getState();
        const newState = {};
        const uncommittedState = this.uncommittedState = { ...prevState
        };
        orderList.forEach(moduleName => {
          const model = injectedModels[moduleName];
          const handler = handlers[moduleName];
          const result = handler.apply(model, actionData);

          if (result) {
            newState[moduleName] = result;
            uncommittedState[moduleName] = result;
          }
        });
        logs.state = uncommittedState;
        devLogger(logs);
        this.update(newState);
      } else {
        devLogger(logs);
        const effectPromises = [];
        orderList.forEach(moduleName => {
          const model = injectedModels[moduleName];
          const handler = handlers[moduleName];
          this.currentAction = action;
          const result = handler.apply(model, actionData);
          const loadingKey = handler.__loadingKey__;

          if (isPromise(result)) {
            if (loadingKey) {
              let [loadingForModuleName, loadingForGroupName] = loadingKey.split('.');

              if (!loadingForGroupName) {
                loadingForModuleName = actionConfig.StageModuleName;
                loadingForGroupName = loadingForModuleName;
              }

              if (loadingForModuleName === 'this') {
                loadingForModuleName = moduleName;
              }

              this.setLoading(result, loadingForGroupName, loadingForModuleName);
            }

            effectPromises.push(result);
          }
        });

        if (effectPromises.length === 0) {
          return;
        }

        return effectPromises.length === 1 ? effectPromises[0] : Promise.all(effectPromises);
      }
    } else {
      if (isReducer) {
        devLogger(logs);
      } else if (isErrorAction(action)) {
        return Promise.reject(actionData);
      }
    }
  }

}
const storeConfig = {
  StoreInitState: () => ({}),
  StoreMiddlewares: [],
  StoreLogger: () => undefined,
  ReducersMap: {},
  EffectsMap: {}
};

class HistoryStack {
  constructor(limit = 10) {
    this.currentRecord = undefined;
    this.records = [];
    this.limit = limit;
  }

  init(record) {
    this.records = [record];
    this.currentRecord = record;
    record.active();
  }

  onChanged() {
    if (this.currentRecord !== this.records[0]) {
      this.currentRecord.inactive();
      this.currentRecord = this.records[0];
      this.currentRecord.active();
    }
  }

  getCurrentItem() {
    return this.currentRecord;
  }

  getEarliestItem() {
    return this.records[this.records.length - 1];
  }

  getItemAt(n) {
    return this.records[n];
  }

  getItems() {
    return [...this.records];
  }

  getLength() {
    return this.records.length;
  }

  push(item) {
    const records = this.records;
    records.unshift(item);

    if (records.length > this.limit) {
      const delItem = records.pop();
      delItem !== item && delItem.destroy();
    }

    this.onChanged();
  }

  replace(item) {
    const records = this.records;
    const delItem = records[0];
    records[0] = item;
    delItem !== item && delItem.destroy();
    this.onChanged();
  }

  relaunch(item) {
    const delList = this.records;
    this.records = [item];
    this.currentRecord = item;
    delList.forEach(delItem => {
      delItem !== item && delItem.destroy();
    });
    this.onChanged();
  }

  back(delta) {
    const delList = this.records.splice(0, delta);

    if (this.records.length === 0) {
      const last = delList.pop();
      this.records.push(last);
    }

    delList.forEach(delItem => {
      if (delItem.destroy) {
        delItem.destroy();
      }
    });
    this.onChanged();
  }

}
class PageStack extends HistoryStack {
  constructor(windowStack, location, store) {
    super();
    this.num = 0;
    this.key = void 0;
    this.windowStack = windowStack;
    this.key = '' + windowStack.num++;
    this.init(new RouteRecord(location, this, store));
  }

  findRecordByKey(key) {
    for (let i = 0, k = this.records.length; i < k; i++) {
      const item = this.records[i];

      if (item.key === key) {
        return [item, i];
      }
    }

    return undefined;
  }

  active() {
    this.getCurrentItem().active();
  }

  inactive() {
    this.getCurrentItem().inactive();
  }

  destroy() {
    this.records.forEach(item => {
      item.destroy();
    });
  }

}
class WindowStack extends HistoryStack {
  constructor(location, store) {
    super();
    this.num = 0;
    this.init(new PageStack(this, location, store));
  }

  getRecords() {
    return this.records.map(item => item.getCurrentItem());
  }

  countBack(delta) {
    const historyStacks = this.records;
    const backSteps = [0, 0];

    for (let i = 0, k = historyStacks.length; i < k; i++) {
      const pageStack = historyStacks[i];
      const recordNum = pageStack.getLength();
      delta = delta - recordNum;

      if (delta > 0) {
        backSteps[0]++;
      } else if (delta === 0) {
        backSteps[0]++;
        break;
      } else {
        backSteps[1] = recordNum + delta;
        break;
      }
    }

    return backSteps;
  }

  backTest(stepOrKey, rootOnly) {
    if (typeof stepOrKey === 'string') {
      return this.findRecordByKey(stepOrKey);
    }

    const delta = stepOrKey;

    if (delta === 0) {
      const record = this.getCurrentItem().getCurrentItem();
      return {
        record,
        overflow: false,
        index: [0, 0]
      };
    }

    if (rootOnly) {
      if (delta < 0 || delta >= this.records.length) {
        const record = this.getEarliestItem().getCurrentItem();
        return {
          record,
          overflow: !(delta < 0),
          index: [this.records.length - 1, 0]
        };
      } else {
        const record = this.getItemAt(delta).getCurrentItem();
        return {
          record,
          overflow: false,
          index: [delta, 0]
        };
      }
    }

    if (delta < 0) {
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {
        record,
        overflow: false,
        index: [this.records.length - 1, pageStack.getLength() - 1]
      };
    }

    const [rootDelta, recordDelta] = this.countBack(delta);

    if (rootDelta < this.records.length) {
      const record = this.getItemAt(rootDelta).getItemAt(recordDelta);
      return {
        record,
        overflow: false,
        index: [rootDelta, recordDelta]
      };
    } else {
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {
        record,
        overflow: true,
        index: [this.records.length - 1, pageStack.getLength() - 1]
      };
    }
  }

  findRecordByKey(key) {
    const arr = key.split('_');

    if (arr[0] && arr[1]) {
      for (let i = 0, k = this.records.length; i < k; i++) {
        const pageStack = this.records[i];

        if (pageStack.key === arr[0]) {
          const item = pageStack.findRecordByKey(key);

          if (item) {
            return {
              record: item[0],
              index: [i, item[1]],
              overflow: false
            };
          }
        }
      }
    }

    return {
      record: this.getCurrentItem().getCurrentItem(),
      index: [0, 0],
      overflow: true
    };
  }

}
function locationToNativeLocation(location) {
  const pathname = routerConfig.NativePathnameMapping.out(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return { ...location,
    pathname,
    url
  };
}
function nativeLocationToLocation(location) {
  const pathname = routerConfig.NativePathnameMapping.in(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return { ...location,
    pathname,
    url
  };
}
function nativeUrlToUrl(nativeUrl) {
  const [path = '', search = '', hash = ''] = nativeUrl.split(/[?#]/);
  const pathname = routerConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}
function urlToNativeUrl(eluxUrl) {
  const [path = '', search = '', hash = ''] = eluxUrl.split(/[?#]/);
  const pathname = routerConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}
function urlToLocation(url, state) {
  const [path = '', query = '', hash = ''] = url.split(/[?#]/);
  const arr = `?${query}`.match(/[?&]__c=([^&]*)/) || ['', ''];
  const classname = arr[1];
  let search = `?${query}`.replace(/[?&]__c=[^&]*/g, '').substring(1);
  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {
    parse
  } = routerConfig.QueryString;
  const searchQuery = parse(search);
  const hashQuery = parse(hash);

  if (classname) {
    search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
  }

  return {
    url: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`,
    pathname,
    search,
    hash,
    classname,
    searchQuery,
    hashQuery,
    state
  };
}
function locationToUrl({
  url,
  pathname,
  search,
  hash,
  classname,
  searchQuery,
  hashQuery
}, defClassname) {
  if (url) {
    [pathname, search, hash] = url.split(/[?#]/);
  }

  pathname = '/' + (pathname || '').replace(/^\/|\/$/g, '');
  const {
    stringify
  } = routerConfig.QueryString;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';

  if (!/[?&]__c=/.test(`?${search}`) && defClassname && classname === undefined) {
    classname = defClassname;
  }

  if (typeof classname === 'string') {
    search = `?${search}`.replace(/[?&]__c=[^&]*/g, '').substring(1);

    if (classname) {
      search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
    }
  }

  url = `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
  return url;
}
class BaseNativeRouter {
  constructor() {
    this.routeKey = '';
    this.curTask = void 0;
  }

  onSuccess() {
    if (this.curTask) {
      const {
        resolve,
        timeout
      } = this.curTask;
      this.curTask = undefined;
      env.clearTimeout(timeout);
      this.routeKey = '';
      resolve();
    }
  }

  testExecute(method, location, backIndex) {
    const testMethod = '_' + method;

    if (this[testMethod]) {
      return this[testMethod](locationToNativeLocation(location), backIndex);
    }
  }

  execute(method, location, key, backIndex) {
    const nativeLocation = locationToNativeLocation(location);
    const result = this[method](nativeLocation, key, backIndex);

    if (result) {
      this.routeKey = key;
      return new Promise(resolve => {
        const timeout = env.setTimeout(() => {
          env.console.error('Native router timeout: ' + nativeLocation.url);
          this.onSuccess();
        }, 2000);
        this.curTask = {
          resolve,
          timeout
        };
      });
    }
  }

}
class Router extends ARouter {
  constructor(...args) {
    super(...args);
    this.WindowStackClass = WindowStack;
    this.PageStackClass = PageStack;
    this.StoreClass = Store;
    this.listenerId = 0;
    this.listenerMap = {};
  }

  dispatch(data) {
    const listenerMap = this.listenerMap;
    const promiseResults = [];
    Object.keys(listenerMap).forEach(id => {
      const result = listenerMap[id](data);

      if (isPromise(result)) {
        promiseResults.push(result);
      }
    });

    if (promiseResults.length === 0) {
      return undefined;
    } else if (promiseResults.length === 1) {
      return promiseResults[0];
    } else {
      return Promise.all(promiseResults).then(() => undefined);
    }
  }

  nativeUrlToUrl(nativeUrl) {
    return nativeUrlToUrl(nativeUrl);
  }

  urlToLocation(url, state) {
    return urlToLocation(url, state);
  }

  locationToUrl(location, defClassname) {
    return locationToUrl(location, defClassname);
  }

  needToNotifyNativeRouter(action, target) {
    return routerConfig.NeedToNotifyNativeRouter(action, target);
  }

  addListener(callback) {
    this.listenerId++;
    const id = this.listenerId + '';
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  relaunch(partialLocation, target = 'page', refresh = false, _nativeCaller = false) {
    return this.addTask(this._relaunch.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  async _relaunch(partialLocation, target, refresh, nativeCaller) {
    const action = 'relaunch';
    const url = this.computeUrl(partialLocation, action, target);
    const location = this.urlToLocation(url, partialLocation.state);
    const needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);

    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location);

      if (reject) {
        throw reject;
      }
    }

    const curPage = this.getCurrentPage();

    try {
      await curPage.store.dispatch(testRouteChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }

    await curPage.store.dispatch(beforeRouteChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    this.action = action;
    const newStore = curPage.store.clone(refresh);
    const curPageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, curPageStack, newStore);

    if (target === 'window') {
      curPageStack.relaunch(newRecord);
      this.windowStack.relaunch(curPageStack);
    } else {
      curPageStack.relaunch(newRecord);
    }

    try {
      await this.mountStore(curPage.store, newStore);
    } catch (err) {
      env.console.error(err);
    }

    if (!nativeCaller && needToNotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }

    await this.dispatch({
      location,
      action,
      prevStore: curPage.store,
      newStore,
      windowChanged: target === 'window'
    });
    newStore.dispatch(afterRouteChangeAction(location, action));
  }

  replace(partialLocation, target = 'page', refresh = false, _nativeCaller = false) {
    return this.addTask(this._replace.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  async _replace(partialLocation, target, refresh, nativeCaller) {
    const action = 'replace';
    const url = this.computeUrl(partialLocation, action, target);
    const location = this.urlToLocation(url, partialLocation.state);
    const needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);

    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location);

      if (reject) {
        throw reject;
      }
    }

    const curPage = this.getCurrentPage();

    try {
      await curPage.store.dispatch(testRouteChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }

    await curPage.store.dispatch(beforeRouteChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    this.action = action;
    const newStore = curPage.store.clone(refresh);
    const curPageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, curPageStack, newStore);

    if (target === 'window') {
      curPageStack.relaunch(newRecord);
    } else {
      curPageStack.replace(newRecord);
    }

    try {
      await this.mountStore(curPage.store, newStore);
    } catch (err) {
      env.console.error(err);
    }

    if (!nativeCaller && needToNotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }

    await this.dispatch({
      location,
      action,
      prevStore: curPage.store,
      newStore,
      windowChanged: target === 'window'
    });
    newStore.dispatch(afterRouteChangeAction(location, action));
  }

  push(partialLocation, target = 'page', refresh = false, _nativeCaller = false) {
    return this.addTask(this._push.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  async _push(partialLocation, target, refresh, nativeCaller) {
    const action = 'push';
    const url = this.computeUrl(partialLocation, action, target);
    const location = this.urlToLocation(url, partialLocation.state);
    const needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);

    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location);

      if (reject) {
        throw reject;
      }
    }

    const curPage = this.getCurrentPage();

    try {
      await curPage.store.dispatch(testRouteChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }

    await curPage.store.dispatch(beforeRouteChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    this.action = action;
    const newStore = curPage.store.clone(target === 'window' || refresh);
    const curPageStack = this.windowStack.getCurrentItem();
    let newRecord;

    if (target === 'window') {
      const newPageStack = new this.PageStackClass(this.windowStack, location, newStore);
      newRecord = newPageStack.getCurrentItem();
      this.windowStack.push(newPageStack);
    } else {
      newRecord = new RouteRecord(location, curPageStack, newStore);
      curPageStack.push(newRecord);
    }

    try {
      await this.mountStore(curPage.store, newStore);
    } catch (err) {
      env.console.error(err);
    }

    if (!nativeCaller && needToNotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }

    await this.dispatch({
      location,
      action,
      prevStore: curPage.store,
      newStore,
      windowChanged: target === 'window'
    });
    newStore.dispatch(afterRouteChangeAction(location, action));
  }

  back(stepOrKeyOrCallback, target = 'page', overflowRedirect = '', _nativeCaller = false) {
    if (typeof stepOrKeyOrCallback === 'string') {
      stepOrKeyOrCallback = stepOrKeyOrCallback.trim();
    }

    if (stepOrKeyOrCallback === '') {
      this.nativeRouter.exit();
      return Promise.resolve();
    }

    if (!stepOrKeyOrCallback) {
      return this.replace(this.getCurrentPage().location, 'page');
    }

    return this.addTask(this._back.bind(this, stepOrKeyOrCallback, target, overflowRedirect, _nativeCaller));
  }

  async _back(stepOrKeyOrCallback, target, overflowRedirect, nativeCaller) {
    const action = 'back';
    let stepOrKey = '';

    if (typeof stepOrKeyOrCallback === 'function') {
      const items = this.getHistory(target);
      const i = items.findIndex(stepOrKeyOrCallback);

      if (i > -1) {
        stepOrKey = items[i].key;
      }
    } else {
      stepOrKey = stepOrKeyOrCallback;
    }

    if (!stepOrKey) {
      return this.backError(stepOrKey, overflowRedirect);
    }

    const {
      record,
      overflow,
      index
    } = this.windowStack.backTest(stepOrKey, target === 'window');

    if (overflow) {
      return this.backError(stepOrKey, overflowRedirect);
    }

    if (!index[0] && !index[1]) {
      return;
    }

    const location = record.location;
    const title = record.title;
    const needToNotifyNativeRouter = Boolean(index[0] && this.needToNotifyNativeRouter(action, 'window')) || Boolean(index[1] && this.needToNotifyNativeRouter(action, 'page'));

    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location, index);

      if (reject) {
        throw reject;
      }
    }

    const curPage = this.getCurrentPage();

    try {
      await curPage.store.dispatch(testRouteChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }

    await curPage.store.dispatch(beforeRouteChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    this.action = action;

    if (index[0]) {
      this.windowStack.back(index[0]);
    }

    if (index[1]) {
      this.windowStack.getCurrentItem().back(index[1]);
    }

    const historyStore = this.getCurrentPage().store;

    try {
      await this.mountStore(curPage.store, historyStore);
    } catch (err) {
      env.console.error(err);
    }

    if (!nativeCaller && needToNotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, record.key, index);
    }

    this.setDocumentHead(title);
    await this.dispatch({
      location,
      action,
      prevStore: curPage.store,
      newStore: historyStore,
      windowChanged: !!index[0]
    });
    historyStore.dispatch(afterRouteChangeAction(location, action));
  }

  backError(stepOrKey, redirect) {
    const curStore = this.getCurrentPage().store;
    const backOverflow = {
      code: ErrorCodes.ROUTE_BACK_OVERFLOW,
      message: 'Overflowed on route backward.',
      detail: {
        stepOrKey,
        redirect
      }
    };
    return curStore.dispatch(errorAction(backOverflow));
  }

}
const routerConfig = {
  QueryString: {
    parse: str => ({}),
    stringify: () => ''
  },
  NativePathnameMapping: {
    in: pathname => pathname,
    out: pathname => pathname
  },

  NeedToNotifyNativeRouter() {
    return false;
  }

};

function exportModuleFacade(moduleName, ModelClass, components, data) {
  Object.keys(components).forEach(key => {
    const component = components[key];

    if (!isEluxComponent(component) && (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))) {
      env.console.warn(`The exported component must implement interface EluxComponent: ${moduleName}.${key}`);
    }
  });
  return {
    moduleName,
    ModelClass,
    components: components,
    data,
    state: {},
    actions: {}
  };
}
function moduleExists(moduleName) {
  return !!baseConfig.ModuleGetter[moduleName];
}
function getModule(moduleName) {
  const request = baseConfig.ModuleGetter[moduleName];

  if (!request) {
    return undefined;
  }

  if (moduleConfig.ModuleCaches[moduleName]) {
    return moduleConfig.ModuleCaches[moduleName];
  }

  const moduleOrPromise = request();

  if (isPromise(moduleOrPromise)) {
    const promiseModule = moduleOrPromise.then(({
      default: module
    }) => {
      injectActions(new module.ModelClass(moduleName, null));
      moduleConfig.ModuleCaches[moduleName] = module;
      return module;
    }, reason => {
      moduleConfig.ModuleCaches[moduleName] = undefined;
      throw reason;
    });
    moduleConfig.ModuleCaches[moduleName] = promiseModule;
    return promiseModule;
  }

  injectActions(new moduleOrPromise.ModelClass(moduleName, null));
  moduleConfig.ModuleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}
function getComponent(moduleName, componentName) {
  const key = [moduleName, componentName].join('.');

  if (moduleConfig.ComponentCaches[key]) {
    return moduleConfig.ComponentCaches[key];
  }

  const moduleCallback = module => {
    const componentOrFun = module.components[componentName];

    if (!componentOrFun) {
      return undefined;
    }

    if (isEluxComponent(componentOrFun)) {
      moduleConfig.ComponentCaches[key] = componentOrFun;
      return componentOrFun;
    }

    const promiseComponent = componentOrFun().then(({
      default: component
    }) => {
      moduleConfig.ComponentCaches[key] = component;
      return component;
    }, reason => {
      moduleConfig.ComponentCaches[key] = undefined;
      throw reason;
    });
    moduleConfig.ComponentCaches[key] = promiseComponent;
    return promiseComponent;
  };

  const moduleOrPromise = getModule(moduleName);

  if (!moduleOrPromise) {
    return undefined;
  }

  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(module => {
      const component = moduleCallback(module);

      if (component) {
        return component;
      }

      throw `Not found ${key}`;
    });
  }

  return moduleCallback(moduleOrPromise);
}
function getEntryComponent() {
  return getComponent(actionConfig.StageModuleName, baseConfig.StageViewName);
}
function getModuleApiMap(data) {
  if (!moduleConfig.ModuleApiMap) {
    if (data) {
      moduleConfig.ModuleApiMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions = {};
        const actionNames = {};
        arr.forEach(actionName => {
          actions[actionName] = (...payload) => ({
            type: moduleName + actionConfig.NSP + actionName,
            payload
          });

          actionNames[actionName] = moduleName + actionConfig.NSP + actionName;
        });
        const moduleFacade = {
          name: moduleName,
          actions,
          actionNames
        };
        prev[moduleName] = moduleFacade;
        return prev;
      }, {});
    } else {
      const cacheData = {};
      moduleConfig.ModuleApiMap = new Proxy({}, {
        set(target, moduleName, val, receiver) {
          return Reflect.set(target, moduleName, val, receiver);
        },

        get(target, moduleName, receiver) {
          const val = Reflect.get(target, moduleName, receiver);

          if (val !== undefined) {
            return val;
          }

          if (!cacheData[moduleName]) {
            cacheData[moduleName] = {
              name: moduleName,
              actionNames: new Proxy({}, {
                get(__, actionName) {
                  return moduleName + actionConfig.NSP + actionName;
                }

              }),
              actions: new Proxy({}, {
                get(__, actionName) {
                  return (...payload) => ({
                    type: moduleName + actionConfig.NSP + actionName,
                    payload
                  });
                }

              })
            };
          }

          return cacheData[moduleName];
        }

      });
    }
  }

  return moduleConfig.ModuleApiMap;
}
function injectModule(moduleOrName, moduleGetter) {
  if (typeof moduleOrName === 'string') {
    baseConfig.ModuleGetter[moduleOrName] = moduleGetter;
  } else {
    baseConfig.ModuleGetter[moduleOrName.moduleName] = () => moduleOrName;
  }
}
function injectActions(model, hmr) {
  const moduleName = model.moduleName;
  const handlers = model;

  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];

      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(',').forEach(actionName => {
          actionName = actionName.trim();

          if (actionName) {
            actionName = actionName.replace(new RegExp(`^this[${actionConfig.NSP}]`), `${moduleName}${actionConfig.NSP}`);
            const arr = actionName.split(actionConfig.NSP);

            if (arr[1]) {
              transformAction(actionName, handler, moduleName, handler.__isEffect__ ? storeConfig.EffectsMap : storeConfig.ReducersMap, hmr);
            } else {
              transformAction(moduleName + actionConfig.NSP + actionName, handler, moduleName, handler.__isEffect__ ? storeConfig.EffectsMap : storeConfig.ReducersMap, hmr);
            }
          }
        });
      }
    }
  }
}

function transformAction(actionName, handler, listenerModule, actionHandlerMap, hmr) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }

  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    env.console.warn(`Action duplicate : ${actionName}.`);
  }

  actionHandlerMap[actionName][listenerModule] = handler;
}

baseConfig.GetModule = getModule;
const moduleConfig = {
  ModuleCaches: {},
  ComponentCaches: {},
  ModuleApiMap: null
};

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object.keys(descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object.defineProperty(target, property, desc);
    desc = null;
  }

  return desc;
}

var _class;
function exportModule(moduleName, ModelClass, components, data) {
  return exportModuleFacade(moduleName, ModelClass, components, data);
}
function getApi() {
  const modules = getModuleApiMap();

  const GetComponent = (moduleName, componentName) => {
    const result = getComponent(moduleName, componentName);

    if (isPromise(result)) {
      return result;
    } else {
      return Promise.resolve(result);
    }
  };

  const GetData = moduleName => {
    const result = getModule(moduleName);

    if (isPromise(result)) {
      return result.then(mod => mod.data);
    } else {
      return Promise.resolve(result.data);
    }
  };

  return {
    GetActions: (...args) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetClientRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetClientRouter() in the server side, please use useRouter() instead';
      }

      return baseConfig.ClientRouter;
    },
    LoadComponent: facadeConfig.LoadComponent,
    GetComponent: GetComponent,
    GetData: GetData,
    Modules: modules,
    useRouter: facadeConfig.UseRouter,
    useStore: facadeConfig.UseStore
  };
}
let BaseModel = (_class = class BaseModel {
  get state() {
    return this.store.getState(this.moduleName);
  }

  get router() {
    return this.store.router;
  }

  get actions() {
    return moduleConfig.ModuleApiMap[this.moduleName].actions;
  }

  constructor(moduleName, store) {
    this.store = void 0;
    this.moduleName = moduleName;
    this.store = store;
  }

  onBuild() {
    return;
  }

  onActive() {
    return;
  }

  onInactive() {
    return;
  }

  getPrevState() {
    return this.store.router.prevState[this.moduleName];
  }

  getStoreState(type) {
    if (type === 'previous') {
      return this.store.router.prevState;
    } else if (type === 'uncommitted') {
      return this.store.getUncommittedState();
    } else {
      return this.store.getState();
    }
  }

  dispatch(action) {
    return this.store.dispatch(action);
  }

  _initState(state) {
    return state;
  }

  _updateState(subject, state) {
    return mergeState(this.state, state);
  }

  _loadingState(loadingState) {
    return mergeState(this.state, loadingState);
  }

}, (_applyDecoratedDescriptor(_class.prototype, "_initState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_initState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_updateState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_updateState"), _class.prototype), _applyDecoratedDescriptor(_class.prototype, "_loadingState", [reducer], Object.getOwnPropertyDescriptor(_class.prototype, "_loadingState"), _class.prototype)), _class);
const facadeConfig = {};

export { BaseModel, BaseNativeRouter, ErrorCodes, Router, SingleDispatcher, SsrApp, Store, WebApp, actionConfig, baseConfig, deepClone, effect, env, errorAction, exportComponent, exportModule, exportView, getApi, getComponent, getEntryComponent, getModule, getModuleApiMap, injectModule, isPromise, isServer, loadingAction, locationToNativeLocation, locationToUrl, moduleExists, nativeLocationToLocation, nativeUrlToUrl, reducer, setProcessedError, toPromise, urlToLocation, urlToNativeUrl };
