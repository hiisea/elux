import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { isPromise } from '@elux/core';
import { routeConfig, setRouteConfig } from './basic';
import { History, uriToLocation } from './history';
import { testRouteChangeAction, routeChangeAction } from './module';
import { eluxLocationToEluxUrl, nativeLocationToNativeUrl, payloadToEluxLocation } from './transform';
export { setRouteConfig, routeConfig } from './basic';
export { createLocationTransform, nativeUrlToNativeLocation } from './transform';
export { routeMiddleware, createRouteModule, RouteActionTypes, ModuleWithRouteHandlers } from './module';
export class BaseNativeRouter {
  constructor() {
    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "router", null);
  }

  onChange(key) {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }

    return key !== this.router.getCurKey();
  }

  setRouter(router) {
    this.router = router;
  }

  execute(method, getNativeData, ...args) {
    return new Promise((resolve, reject) => {
      const task = {
        resolve,
        reject,
        nativeData: undefined
      };
      this.curTask = task;
      const result = this[method](() => {
        const nativeData = getNativeData();
        task.nativeData = nativeData;
        return nativeData;
      }, ...args);

      if (!result) {
        resolve(undefined);
        this.curTask = undefined;
      } else if (isPromise(result)) {
        result.catch(e => {
          reject(e);
          this.curTask = undefined;
        });
      }
    });
  }

}
export class BaseRouter {
  constructor(nativeLocationOrNativeUrl, nativeRouter, locationTransform) {
    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "_nativeData", void 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "eluxUrl", void 0);

    _defineProperty(this, "store", void 0);

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "_lid", 0);

    _defineProperty(this, "listenerMap", {});

    _defineProperty(this, "initedPromise", void 0);

    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    nativeRouter.setRouter(this);
    const eluxLocation = typeof nativeLocationOrNativeUrl === 'string' ? locationTransform.nativeUrlToEluxLocation(nativeLocationOrNativeUrl) : locationTransform.nativeLocationToEluxLocation(nativeLocationOrNativeUrl);

    const callback = location => {
      const key = this._createKey();

      const routeState = { ...location,
        action: 'RELAUNCH',
        key
      };
      this.routeState = routeState;
      this.eluxUrl = eluxLocationToEluxUrl({
        pathname: routeState.pagename,
        params: routeState.params
      });

      if (!routeConfig.indexUrl) {
        setRouteConfig({
          indexUrl: this.eluxUrl
        });
      }

      this.history = new History({
        location,
        key
      });
      return routeState;
    };

    const locationOrPromise = locationTransform.eluxLocationtoLocation(eluxLocation);

    if (isPromise(locationOrPromise)) {
      this.initedPromise = locationOrPromise.then(callback);
    } else {
      const routeState = callback(locationOrPromise);
      this.initedPromise = Promise.resolve(routeState);
    }
  }

  addListener(callback) {
    this._lid++;
    const id = `${this._lid}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(data) {
    const listenerMap = this.listenerMap;
    const arr = Object.keys(listenerMap).map(id => listenerMap[id](data));
    return Promise.all(arr);
  }

  getRouteState() {
    return this.routeState;
  }

  getPagename() {
    return this.routeState.pagename;
  }

  getParams() {
    return this.routeState.params;
  }

  getEluxUrl() {
    return this.eluxUrl;
  }

  getNativeLocation() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNative(this.routeState);
    }

    return this._nativeData.nativeLocation;
  }

  getNativeUrl() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNative(this.routeState);
    }

    return this._nativeData.nativeUrl;
  }

  setStore(_store) {
    this.store = _store;
  }

  getCurKey() {
    return this.routeState.key;
  }

  findHistoryIndexByKey(key) {
    return this.history.findIndex(key);
  }

  locationToNative(location) {
    const nativeLocation = this.locationTransform.locationtoNativeLocation(location);
    const nativeUrl = nativeLocationToNativeUrl(nativeLocation);
    return {
      nativeUrl,
      nativeLocation
    };
  }

  urlToLocation(url) {
    const eluxLocation = this.locationTransform.urlToEluxLocation(url);
    return this.locationTransform.eluxLocationtoLocation(eluxLocation);
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  preAdditions(data) {
    let eluxLocation;

    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return null;
      }

      eluxLocation = this.locationTransform.urlToEluxLocation(data);
    } else {
      eluxLocation = payloadToEluxLocation(data, this.routeState);
    }

    return this.locationTransform.eluxLocationtoLocation(eluxLocation);
  }

  relaunch(data, internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  }

  async _relaunch(data, internal, disableNative) {
    const preData = await this.preAdditions(data);

    if (!preData) {
      return;
    }

    const location = preData;

    const key = this._createKey();

    const routeState = { ...location,
      action: 'RELAUNCH',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('relaunch', () => this.locationToNative(this.routeState), key);
    }

    this._nativeData = nativeData;
    this.routeState = routeState;
    this.eluxUrl = eluxLocationToEluxUrl({
      pathname: routeState.pagename,
      params: routeState.params
    });
    this.store.dispatch(routeChangeAction(routeState));

    if (internal) {
      this.history.getCurrentInternalHistory().relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }
  }

  push(data, internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._push.bind(this, data, internal, disableNative));
  }

  async _push(data, internal, disableNative) {
    const preData = await this.preAdditions(data);

    if (!preData) {
      return;
    }

    const location = preData;

    const key = this._createKey();

    const routeState = { ...location,
      action: 'PUSH',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('push', () => this.locationToNative(this.routeState), key);
    }

    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.eluxUrl = eluxLocationToEluxUrl({
      pathname: routeState.pagename,
      params: routeState.params
    });

    if (internal) {
      this.history.getCurrentInternalHistory().push(location, key);
    } else {
      this.history.push(location, key);
    }

    this.store.dispatch(routeChangeAction(routeState));
  }

  replace(data, internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._replace.bind(this, data, internal, disableNative));
  }

  async _replace(data, internal, disableNative) {
    const preData = await this.preAdditions(data);

    if (!preData) {
      return;
    }

    const location = preData;

    const key = this._createKey();

    const routeState = { ...location,
      action: 'REPLACE',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('replace', () => this.locationToNative(this.routeState), key);
    }

    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.eluxUrl = eluxLocationToEluxUrl({
      pathname: routeState.pagename,
      params: routeState.params
    });

    if (internal) {
      this.history.getCurrentInternalHistory().replace(location, key);
    } else {
      this.history.replace(location, key);
    }

    this.store.dispatch(routeChangeAction(routeState));
  }

  back(n = 1, indexUrl = 'index', internal = false, disableNative = routeConfig.disableNativeRoute) {
    this.addTask(this._back.bind(this, n, indexUrl === 'index' ? routeConfig.indexUrl : indexUrl, internal, disableNative));
  }

  async _back(n = 1, indexUrl, internal, disableNative) {
    const stack = internal ? this.history.getCurrentInternalHistory().getRecord(n - 1) : this.history.getRecord(n - 1);

    if (!stack) {
      if (indexUrl) {
        return this._relaunch(indexUrl || routeConfig.indexUrl, internal, disableNative);
      }

      throw {
        code: '1',
        message: 'history not found'
      };
    }

    const uri = stack.uri;
    const {
      key,
      location
    } = uriToLocation(uri);
    const routeState = { ...location,
      action: 'BACK',
      key
    };
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData;

    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute('back', () => this.locationToNative(this.routeState), n, key);
    }

    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.eluxUrl = eluxLocationToEluxUrl({
      pathname: routeState.pagename,
      params: routeState.params
    });

    if (internal) {
      this.history.getCurrentInternalHistory().back(n);
    } else {
      this.history.back(n);
    }

    this.store.dispatch(routeChangeAction(routeState));
    return undefined;
  }

  taskComplete() {
    const task = this.taskList.shift();

    if (task) {
      this.executeTask(task);
    } else {
      this.curTask = undefined;
    }
  }

  executeTask(task) {
    this.curTask = task;
    task().finally(this.taskComplete.bind(this));
  }

  addTask(task) {
    if (this.curTask) {
      this.taskList.push(task);
    } else {
      this.executeTask(task);
    }
  }

  destroy() {
    this.nativeRouter.destroy();
  }

}