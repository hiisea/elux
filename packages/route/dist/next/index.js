import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { isPromise, deepMerge, routeChangeAction, routeBeforeChangeAction, routeTestChangeAction, coreConfig, deepClone, MultipleDispatcher, env, reinitApp } from '@elux/core';
import { routeConfig } from './basic';
import { RootStack, HistoryStack, HistoryRecord } from './history';
import { location as createLocationTransform } from './transform';
export { setRouteConfig, routeConfig, safeJsonParse } from './basic';
export { location, createRouteModule, urlParser } from './transform';
export class BaseNativeRouter {
  constructor() {
    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "eluxRouter", void 0);
  }

  onChange(key) {
    if (this.curTask) {
      this.curTask();
      this.curTask = undefined;
      return false;
    }

    return key !== this.eluxRouter.routeState.key;
  }

  startup(router) {
    this.eluxRouter = router;
  }

  execute(method, location, ...args) {
    return new Promise((resolve, reject) => {
      this.curTask = resolve;
      const result = this[method](location, ...args);

      if (!result) {
        resolve();
        this.curTask = undefined;
      } else if (isPromise(result)) {
        result.catch(e => {
          reject(e);
          env.console.error(e);
          this.curTask = undefined;
        });
      }
    });
  }

}
export class BaseEluxRouter extends MultipleDispatcher {
  constructor(nativeUrl, nativeRouter, nativeData) {
    super();

    _defineProperty(this, "_curTask", void 0);

    _defineProperty(this, "_taskList", []);

    _defineProperty(this, "location", void 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "name", coreConfig.RouteModuleName);

    _defineProperty(this, "initialize", void 0);

    _defineProperty(this, "rootStack", new RootStack());

    _defineProperty(this, "latestState", {});

    _defineProperty(this, "_taskComplete", () => {
      const task = this._taskList.shift();

      if (task) {
        this.executeTask(task);
      } else {
        this._curTask = undefined;
      }
    });

    this.nativeRouter = nativeRouter;
    this.nativeData = nativeData;
    nativeRouter.startup(this);
    const location = createLocationTransform(nativeUrl);
    this.location = location;
    const pagename = location.getPagename();
    const paramsOrPromise = location.getParams();

    const callback = params => {
      const routeState = {
        pagename,
        params,
        action: 'RELAUNCH',
        key: ''
      };
      this.routeState = routeState;
      return routeState;
    };

    if (isPromise(paramsOrPromise)) {
      this.initialize = paramsOrPromise.then(callback);
    } else {
      this.initialize = Promise.resolve(callback(paramsOrPromise));
    }
  }

  startup(store) {
    const historyStack = new HistoryStack(this.rootStack, store);
    const historyRecord = new HistoryRecord(this.location, historyStack);
    historyStack.startup(historyRecord);
    this.rootStack.startup(historyStack);
    this.routeState.key = historyRecord.key;
  }

  getCurrentPages() {
    return this.rootStack.getCurrentPages();
  }

  getCurrentStore() {
    return this.rootStack.getCurrentItem().store;
  }

  getStoreList() {
    return this.rootStack.getItems().map(({
      store
    }) => store);
  }

  getHistoryLength(root) {
    return root ? this.rootStack.getLength() : this.rootStack.getCurrentItem().getLength();
  }

  findRecordByKey(recordKey) {
    const {
      record: {
        key,
        location
      },
      overflow,
      index
    } = this.rootStack.findRecordByKey(recordKey);
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
    } = this.rootStack.testBack(delta, rootOnly);
    return {
      overflow,
      index,
      record: {
        key,
        location
      }
    };
  }

  extendCurrent(params, pagename) {
    return {
      payload: deepMerge({}, this.routeState.params, params),
      pagename: pagename || this.routeState.pagename
    };
  }

  relaunch(dataOrUrl, root = false, nonblocking, nativeCaller = false) {
    return this.addTask(this._relaunch.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  async _relaunch(dataOrUrl, root, nativeCaller) {
    const location = createLocationTransform(dataOrUrl);
    const pagename = location.getPagename();
    const params = await location.getParams();
    let key = '';
    const routeState = {
      pagename,
      params,
      action: 'RELAUNCH',
      key
    };
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

    if (root) {
      key = this.rootStack.relaunch(location).key;
    } else {
      key = this.rootStack.getCurrentItem().relaunch(location).key;
    }

    routeState.key = key;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      await this.nativeRouter.execute('relaunch', location, key);
    }

    this.location = location;
    this.routeState = routeState;
    const cloneState = deepClone(routeState);
    this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    await this.dispatch('change', {
      routeState: cloneState,
      root
    });
  }

  push(dataOrUrl, root = false, nonblocking, nativeCaller = false) {
    return this.addTask(this._push.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  async _push(dataOrUrl, root, nativeCaller) {
    const location = createLocationTransform(dataOrUrl);
    const pagename = location.getPagename();
    const params = await location.getParams();
    let key = '';
    const routeState = {
      pagename,
      params,
      action: 'PUSH',
      key
    };
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

    if (root) {
      key = this.rootStack.push(location).key;
    } else {
      key = this.rootStack.getCurrentItem().push(location).key;
    }

    routeState.key = key;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      await this.nativeRouter.execute('push', location, key);
    }

    this.location = location;
    this.routeState = routeState;
    const cloneState = deepClone(routeState);

    if (root) {
      await reinitApp(this.getCurrentStore());
    } else {
      this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    }

    await this.dispatch('change', {
      routeState: cloneState,
      root
    });
  }

  replace(dataOrUrl, root = false, nonblocking, nativeCaller = false) {
    return this.addTask(this._replace.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  async _replace(dataOrUrl, root, nativeCaller) {
    const location = createLocationTransform(dataOrUrl);
    const pagename = location.getPagename();
    const params = await location.getParams();
    let key = '';
    const routeState = {
      pagename,
      params,
      action: 'REPLACE',
      key
    };
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

    if (root) {
      key = this.rootStack.replace(location).key;
    } else {
      key = this.rootStack.getCurrentItem().replace(location).key;
    }

    routeState.key = key;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      await this.nativeRouter.execute('replace', location, key);
    }

    this.location = location;
    this.routeState = routeState;
    const cloneState = deepClone(routeState);
    this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    await this.dispatch('change', {
      routeState: cloneState,
      root
    });
  }

  back(stepOrKey = 1, root = false, options, nonblocking, nativeCaller = false) {
    if (!stepOrKey) {
      return;
    }

    return this.addTask(this._back.bind(this, stepOrKey, root, options || {}, nativeCaller), nonblocking);
  }

  async _back(stepOrKey, root, options, nativeCaller) {
    const {
      record,
      overflow,
      index
    } = this.rootStack.testBack(stepOrKey, root);

    if (overflow) {
      const url = options.overflowRedirect || routeConfig.indexUrl;
      env.setTimeout(() => this.relaunch(url, root), 0);
      return;
    }

    if (!index[0] && !index[1]) {
      return;
    }

    const key = record.key;
    const location = record.location;
    const pagename = location.getPagename();
    const params = deepMerge({}, location.getParams(), options.payload);
    const routeState = {
      key,
      pagename,
      params,
      action: 'BACK'
    };
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));

    if (index[0]) {
      root = true;
      this.rootStack.back(index[0]);
    }

    if (index[1]) {
      this.rootStack.getCurrentItem().back(index[1]);
    }

    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      await this.nativeRouter.execute('back', location, index, key);
    }

    this.location = location;
    this.routeState = routeState;
    const cloneState = deepClone(routeState);
    this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    await this.dispatch('change', {
      routeState,
      root
    });
  }

  executeTask(task) {
    this._curTask = task;
    task().finally(this._taskComplete);
  }

  addTask(execute, nonblocking) {
    if (env.isServer) {
      return;
    }

    if (this._curTask && !nonblocking) {
      return;
    }

    return new Promise((resolve, reject) => {
      const task = () => execute().then(resolve, reject);

      if (this._curTask) {
        this._taskList.push(task);
      } else {
        this.executeTask(task);
      }
    });
  }

  destroy() {
    this.nativeRouter.destroy();
  }

}
export function toURouter(router) {
  const {
    nativeData,
    location,
    routeState,
    initialize,
    addListener,
    getCurrentPages,
    findRecordByKey,
    findRecordByStep,
    getHistoryLength,
    extendCurrent,
    relaunch,
    push,
    replace,
    back
  } = router;
  return {
    nativeData,
    location,
    routeState,
    initialize,
    addListener: addListener.bind(router),
    getCurrentPages: getCurrentPages.bind(router),
    findRecordByKey: findRecordByKey.bind(router),
    findRecordByStep: findRecordByStep.bind(router),
    extendCurrent: extendCurrent.bind(router),
    getHistoryLength: getHistoryLength.bind(router),
    relaunch: relaunch.bind(router),
    push: push.bind(router),
    replace: replace.bind(router),
    back: back.bind(router)
  };
}