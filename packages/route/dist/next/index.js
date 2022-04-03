import { CoreRouter, Store, ErrorCodes, deepClone, coreConfig, setLoading, errorAction, env } from '@elux/core';
import { urlToLocation, testChangeAction, beforeChangeAction, afterChangeAction, routeConfig, locationToUrl, toNativeLocation, toEluxLocation } from './basic';
import { WindowStack, PageStack, RouteRecord } from './history';
export { setRouteConfig, routeConfig, locationToUrl, urlToLocation, toNativeLocation, toEluxLocation } from './basic';
export class BaseNativeRouter {
  constructor(nativeLocation, nativeData) {
    this.curTask = void 0;
    this.nativeLocation = nativeLocation;
    this.nativeData = nativeData;
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
    const result = this[method](toNativeLocation(location), key, backIndex);

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
    super(toEluxLocation(urlToLocation(nativeRouter.nativeLocation.url || locationToUrl(nativeRouter.nativeLocation))), 'relaunch', nativeRouter.nativeData);
    this.curTask = void 0;
    this.taskList = [];
    this.windowStack = void 0;

    this.onTaskComplete = () => {
      const task = this.taskList.shift();

      if (task) {
        this.curTask = task;
        const onTaskComplete = this.onTaskComplete;
        env.setTimeout(() => task().finally(onTaskComplete), 0);
      } else {
        this.curTask = undefined;
      }
    };

    this.nativeRouter = nativeRouter;
    this.windowStack = new WindowStack(this.location, new Store(0, this));
  }

  addTask(execute) {
    if (env.isServer) {
      return;
    }

    return new Promise((resolve, reject) => {
      const task = () => setLoading(execute(), this.getCurrentPage().store).then(resolve, reject);

      if (this.curTask) {
        this.taskList.push(task);
      } else {
        this.curTask = task;
        task().finally(this.onTaskComplete);
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

  async init(prevState) {
    this.runtime = {
      timestamp: Date.now(),
      payload: null,
      prevState,
      completed: false
    };
    const store = this.getCurrentPage().store;

    try {
      await store.mount(coreConfig.StageModuleName, true);
    } catch (error) {
      store.dispatch(errorAction({
        code: ErrorCodes.INIT_ERROR,
        message: error.message || error.toString()
      }));
    }

    this.runtime.completed = true;
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
      this.runtime.completed = false;
      return;
    }

    try {
      await newStore.mount(coreConfig.StageModuleName, true);
    } catch (error) {
      newStore.dispatch(errorAction({
        code: ErrorCodes.INIT_ERROR,
        message: error.message || error.toString()
      }));
    }

    this.runtime.completed = false;
  }

  relaunch(urlOrLocation, target = 'page', payload = null, _nativeCaller = false) {
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
      throw {
        code: ErrorCodes.ROUTE_BACK_OVERFLOW,
        message: 'Overflowed on route backward.'
      };
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