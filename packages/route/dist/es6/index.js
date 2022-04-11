import { CoreRouter, Store, deepClone, coreConfig, setLoading, setProcessedError, env } from '@elux/core';
import { ErrorCodes, urlToLocation, testChangeAction, beforeChangeAction, afterChangeAction, routeConfig, urlToNativeUrl, locationToUrl, nativeUrlToUrl, locationToNativeLocation } from './basic';
import { WindowStack, PageStack, RouteRecord } from './history';
export { ErrorCodes, setRouteConfig, routeConfig, locationToUrl, urlToLocation, locationToNativeLocation, nativeLocationToLocation, urlToNativeUrl, nativeUrlToUrl } from './basic';
export class BaseNativeRouter {
  constructor(nativeRequest) {
    this.curTask = void 0;
    this.nativeRequest = nativeRequest;
  }

  onSuccess(key) {
    var _this$curTask;

    (_this$curTask = this.curTask) == null ? void 0 : _this$curTask.resolve();
  }

  onError(key) {
    var _this$curTask2;

    (_this$curTask2 = this.curTask) == null ? void 0 : _this$curTask2.reject();
  }

  execute(method, location, key, backIndex) {
    const result = this[method](locationToNativeLocation(location), key, backIndex);

    if (result) {
      return new Promise((resolve, reject) => {
        this.curTask = {
          resolve,
          reject
        };
      });
    }
  }

}
export class Router extends CoreRouter {
  constructor(nativeRouter) {
    super(urlToLocation(nativeUrlToUrl(nativeRouter.nativeRequest.request.url)), 'relaunch', nativeRouter.nativeRequest);
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
    this.windowStack = new WindowStack(this.location, new Store(0, this));
  }

  addTask(execute) {
    return new Promise((resolve, reject) => {
      const task = [() => setLoading(execute(), this.getCurrentPage().store), resolve, reject];

      if (this.curTask) {
        this.taskList.push(task);
      } else {
        this.curTask = task;
        task[0]().finally(this.onTaskComplete).then(task[1], task[2]);
      }
    });
  }

  getHistoryLength(target = 'page') {
    return target === 'window' ? this.windowStack.getLength() : this.windowStack.getCurrentItem().getLength();
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
    } = this.windowStack.testBack(delta, rootOnly);
    return {
      overflow,
      index,
      record: {
        key,
        location
      }
    };
  }

  getCurrentPage() {
    return this.windowStack.getCurrentWindowPage();
  }

  getWindowPages() {
    return this.windowStack.getWindowPages();
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

  init(prevState) {
    const task = [this._init.bind(this, prevState), () => undefined, () => undefined];
    this.curTask = task;
    return task[0]().finally(this.onTaskComplete);
  }

  async _init(prevState) {
    this.runtime = {
      timestamp: Date.now(),
      payload: null,
      prevState,
      completed: false
    };
    const store = this.getCurrentPage().store;

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
  }

  redirectOnServer(urlOrLocation) {
    if (env.isServer) {
      const url = urlOrLocation.url || locationToUrl(urlOrLocation);
      const nativeUrl = urlToNativeUrl(url);
      const err = {
        code: ErrorCodes.ROUTE_REDIRECT,
        message: 'Route change in server is not allowed.',
        detail: nativeUrl
      };
      throw err;
    }
  }

  relaunch(urlOrLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._relaunch.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  async _relaunch(urlOrLocation, target, payload, _nativeCaller) {
    const action = 'relaunch';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);

    if (target === 'window') {
      pageStack.relaunch(newRecord);
      this.windowStack.relaunch(pageStack);
    } else {
      pageStack.relaunch(newRecord);
    }

    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

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

  replace(urlOrLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._replace.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  async _replace(urlOrLocation, target, payload, _nativeCaller) {
    const action = 'replace';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);

    if (target === 'window') {
      pageStack.relaunch(newRecord);
    } else {
      pageStack.replace(newRecord);
    }

    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

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

  push(urlOrLocation, target = 'page', payload = null, _nativeCaller = false) {
    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._push.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  async _push(urlOrLocation, target, payload, _nativeCaller) {
    const action = 'push';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const prevStore = this.getCurrentPage().store;
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
      this.windowStack.push(newPageStack);
      await this.mountStore(payload, prevStore, newStore);
    } else {
      newRecord = new RouteRecord(location, pageStack);
      pageStack.push(newRecord);
      pageStack.replaceStore(newStore);
      await this.mountStore(payload, prevStore, newStore);
    }

    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];

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
      return;
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
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const NotifyNativeRouter = [];

    if (index[0]) {
      NotifyNativeRouter[0] = routeConfig.NotifyNativeRouter.window;
      this.windowStack.back(index[0]);
    }

    if (index[1]) {
      NotifyNativeRouter[1] = routeConfig.NotifyNativeRouter.page;
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