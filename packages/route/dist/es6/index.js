import { coreConfig, CoreRouter, deepClone, env, setLoading, setProcessedError, Store } from '@elux/core';
import { afterChangeAction, beforeChangeAction, ErrorCodes, locationToNativeLocation, locationToUrl, nativeUrlToUrl, routeConfig, testChangeAction, urlToLocation, urlToNativeUrl } from './basic';
import { PageStack, RouteRecord, WindowStack } from './history';
export { ErrorCodes, locationToNativeLocation, locationToUrl, nativeLocationToLocation, nativeUrlToUrl, routeConfig, setRouteConfig, urlToLocation, urlToNativeUrl } from './basic';
export class BaseNativeRouter {
  constructor() {
    this.router = void 0;
    this.routeKey = '';
    this.curTask = void 0;
    this.router = new Router(this);
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
    this[testMethod] && this[testMethod](locationToNativeLocation(location), backIndex);
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
export class Router extends CoreRouter {
  constructor(nativeRouter) {
    super();
    this.curTask = void 0;
    this.taskList = [];
    this.windowStack = void 0;

    this.onTaskComplete = () => {
      const task = this.taskList.shift();

      if (task) {
        this.curTask = task;
        const onTaskComplete = this.onTaskComplete;
        env.setTimeout(() => task[0]().finally(onTaskComplete).then(task[1], task[2]), 0);
      } else {
        this.curTask = undefined;
      }
    };

    this.nativeRouter = nativeRouter;
  }

  addTask(execute) {
    return new Promise((resolve, reject) => {
      const task = [() => setLoading(execute(), this.getActivePage().store), resolve, reject];

      if (this.curTask) {
        this.taskList.push(task);
      } else {
        this.curTask = task;
        task[0]().finally(this.onTaskComplete).then(task[1], task[2]);
      }
    });
  }

  nativeInitiated() {
    return !this.nativeRouter.routeKey;
  }

  getHistoryLength(target = 'page') {
    return target === 'window' ? this.windowStack.getLength() : this.windowStack.getCurrentItem().getLength();
  }

  getHistory(target = 'page') {
    return target === 'window' ? this.windowStack.getRecords() : this.windowStack.getCurrentItem().getItems();
  }

  findRecordByKey(recordKey) {
    const {
      record: {
        key,
        location
      },
      overflow,
      index
    } = this.windowStack.findRecordByKey(recordKey);
    return {
      overflow,
      index,
      record: {
        key,
        location
      }
    };
  }

  findRecordByStep(delta, rootOnly) {
    const {
      record: {
        key,
        location
      },
      overflow,
      index
    } = this.windowStack.testBack(delta, !!rootOnly);
    return {
      overflow,
      index,
      record: {
        key,
        location
      }
    };
  }

  getActivePage() {
    return this.windowStack.getCurrentWindowPage();
  }

  getCurrentPages() {
    return this.windowStack.getCurrentPages();
  }

  async mountStore(payload, prevStore, newStore, historyStore) {
    const prevState = prevStore.getState();
    this.runtime = {
      timestamp: Date.now(),
      payload,
      prevState: coreConfig.MutableData ? deepClone(prevState) : prevState,
      completed: false
    };

    if (newStore === historyStore) {
      this.runtime.completed = true;
      return;
    }

    try {
      await newStore.mount(coreConfig.StageModuleName, 'route');
    } catch (err) {
      env.console.error(err);
    }

    this.runtime.completed = true;
  }

  redirectOnServer(partialLocation) {
    if (env.isServer) {
      const url = locationToUrl(partialLocation);
      const nativeUrl = urlToNativeUrl(url);
      const err = {
        code: ErrorCodes.ROUTE_REDIRECT,
        message: 'Route change in server is not allowed.',
        detail: nativeUrl
      };
      throw err;
    }
  }

  init(routerInitOptions, prevState) {
    this.init = () => Promise.resolve();

    this.initOptions = routerInitOptions;
    this.location = urlToLocation(nativeUrlToUrl(routerInitOptions.url));
    this.action = 'init';
    this.windowStack = new WindowStack(this.location, new Store(0, this));
    this.routeKey = this.findRecordByStep(0).record.key;
    this.runtime = {
      timestamp: Date.now(),
      payload: null,
      prevState,
      completed: false
    };
    const task = [this._init.bind(this), () => undefined, () => undefined];
    this.curTask = task;
    return task[0]().finally(this.onTaskComplete);
  }

  async _init() {
    const {
      action,
      location,
      routeKey
    } = this;
    await this.nativeRouter.execute(action, location, routeKey);
    const store = this.getActivePage().store;

    try {
      await store.mount(coreConfig.StageModuleName, 'init');
      await store.dispatch(testChangeAction(this.location, this.action));
    } catch (err) {
      if (err.code === ErrorCodes.ROUTE_REDIRECT) {
        this.taskList = [];
        throw err;
      }

      env.console.error(err);
    }

    this.runtime.completed = true;
    this.dispatch({
      location,
      action,
      prevStore: store,
      newStore: store,
      windowChanged: true
    });
  }

  relaunch(partialLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(partialLocation);
    return this.addTask(this._relaunch.bind(this, partialLocation, target, payload, _nativeCaller));
  }

  async _relaunch(partialLocation, target, payload, _nativeCaller) {
    const action = 'relaunch';
    const location = urlToLocation(locationToUrl(partialLocation));
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }

    const prevStore = this.getActivePage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);
    this.routeKey = newRecord.key;

    if (target === 'window') {
      pageStack.relaunch(newRecord);
      this.windowStack.relaunch(pageStack);
    } else {
      pageStack.relaunch(newRecord);
    }

    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);

    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }

    await this.dispatch({
      location,
      action,
      prevStore,
      newStore,
      windowChanged: target === 'window'
    });
    newStore.dispatch(afterChangeAction(location, action));
  }

  replace(partialLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(partialLocation);
    return this.addTask(this._replace.bind(this, partialLocation, target, payload, _nativeCaller));
  }

  async _replace(partialLocation, target, payload, _nativeCaller) {
    const action = 'replace';
    const location = urlToLocation(locationToUrl(partialLocation));
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }

    const prevStore = this.getActivePage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);
    this.routeKey = newRecord.key;

    if (target === 'window') {
      pageStack.relaunch(newRecord);
    } else {
      pageStack.replace(newRecord);
    }

    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);

    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }

    await this.dispatch({
      location,
      action,
      prevStore,
      newStore,
      windowChanged: target === 'window'
    });
    newStore.dispatch(afterChangeAction(location, action));
  }

  push(partialLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(partialLocation);
    return this.addTask(this._push.bind(this, partialLocation, target, payload, _nativeCaller));
  }

  async _push(partialLocation, target, payload, _nativeCaller) {
    const action = 'push';
    const location = urlToLocation(locationToUrl(partialLocation));
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }

    const prevStore = this.getActivePage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    let newRecord;

    if (target === 'window') {
      const newPageStack = new PageStack(this.windowStack, location, newStore);
      newRecord = newPageStack.getCurrentItem();
      this.routeKey = newRecord.key;
      this.windowStack.push(newPageStack);
      await this.mountStore(payload, prevStore, newStore);
    } else {
      newRecord = new RouteRecord(location, pageStack);
      this.routeKey = newRecord.key;
      pageStack.push(newRecord);
      pageStack.replaceStore(newStore);
      await this.mountStore(payload, prevStore, newStore);
    }

    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }

    await this.dispatch({
      location,
      action,
      prevStore,
      newStore,
      windowChanged: target === 'window'
    });
    newStore.dispatch(afterChangeAction(location, action));
  }

  back(stepOrKey = 1, target = 'page', payload = null, overflowRedirect = '', _nativeCaller = false) {
    if (!stepOrKey) {
      return Promise.resolve();
    }

    this.redirectOnServer({
      url: overflowRedirect || routeConfig.HomeUrl
    });
    return this.addTask(this._back.bind(this, stepOrKey, target, payload, overflowRedirect, _nativeCaller));
  }

  async _back(stepOrKey, target, payload, overflowRedirect, _nativeCaller) {
    const action = 'back';
    const {
      record,
      overflow,
      index
    } = this.windowStack.testBack(stepOrKey, target === 'window');

    if (overflow) {
      const url = overflowRedirect || routeConfig.HomeUrl;
      this.relaunch({
        url
      }, 'window');
      const err = {
        code: ErrorCodes.ROUTE_BACK_OVERFLOW,
        message: 'Overflowed on route backward.',
        detail: stepOrKey
      };
      throw setProcessedError(err, true);
    }

    if (!index[0] && !index[1]) {
      throw 'Route backward invalid.';
    }

    const location = record.location;
    const NotifyNativeRouter = [];

    if (index[0]) {
      NotifyNativeRouter[0] = routeConfig.NotifyNativeRouter.window;
    }

    if (index[1]) {
      NotifyNativeRouter[1] = routeConfig.NotifyNativeRouter.page;
    }

    if (!_nativeCaller && NotifyNativeRouter.length) {
      this.nativeRouter.testExecute(action, location, index);
    }

    const prevStore = this.getActivePage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    this.routeKey = record.key;

    if (index[0]) {
      this.windowStack.back(index[0]);
    }

    if (index[1]) {
      this.windowStack.getCurrentItem().back(index[1]);
    }

    const pageStack = this.windowStack.getCurrentItem();
    const historyStore = pageStack.store;
    let newStore = historyStore;

    if (index[1] !== 0) {
      newStore = prevStore.clone();
      pageStack.replaceStore(newStore);
    }

    await this.mountStore(payload, prevStore, newStore);

    if (!_nativeCaller && NotifyNativeRouter.length) {
      await this.nativeRouter.execute(action, location, record.key, index);
    }

    await this.dispatch({
      location,
      action,
      prevStore,
      newStore,
      windowChanged: !!index[0]
    });
    newStore.dispatch(afterChangeAction(location, action));
  }

}