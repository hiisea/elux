import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import { isPromise, deepMerge, SingleDispatcher } from '@elux/core';
import { routeConfig, setRouteConfig } from './basic';
import { History, HistoryRecord } from './history';
import { testRouteChangeAction, routeChangeAction } from './module';
import { eluxLocationToEluxUrl, nativeLocationToNativeUrl } from './transform';
export { setRouteConfig, routeConfig, routeMeta } from './basic';
export { createLocationTransform, nativeUrlToNativeLocation, nativeLocationToNativeUrl } from './transform';
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
export class BaseRouter extends SingleDispatcher {
  constructor(url, nativeRouter, locationTransform) {
    super();

    _defineProperty(this, "_tid", 0);

    _defineProperty(this, "curTask", void 0);

    _defineProperty(this, "taskList", []);

    _defineProperty(this, "_nativeData", void 0);

    _defineProperty(this, "routeState", void 0);

    _defineProperty(this, "internalUrl", void 0);

    _defineProperty(this, "history", void 0);

    _defineProperty(this, "initRouteState", void 0);

    this.nativeRouter = nativeRouter;
    this.locationTransform = locationTransform;
    nativeRouter.setRouter(this);
    this.history = new History();
    const locationOrPromise = locationTransform.urlToLocation(url);

    const callback = location => {
      const key = this._createKey();

      const routeState = { ...location,
        action: 'RELAUNCH',
        key
      };
      this.routeState = routeState;
      this.internalUrl = eluxLocationToEluxUrl({
        pathname: routeState.pagename,
        params: routeState.params
      });

      if (!routeConfig.indexUrl) {
        setRouteConfig({
          indexUrl: this.internalUrl
        });
      }

      return routeState;
    };

    if (isPromise(locationOrPromise)) {
      this.initRouteState = locationOrPromise.then(callback);
    } else {
      this.initRouteState = callback(locationOrPromise);
    }
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

  getInternalUrl() {
    return this.internalUrl;
  }

  getNativeLocation() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNativeData(this.routeState);
    }

    return this._nativeData.nativeLocation;
  }

  getNativeUrl() {
    if (!this._nativeData) {
      this._nativeData = this.locationToNativeData(this.routeState);
    }

    return this._nativeData.nativeUrl;
  }

  init(store) {
    const historyRecord = new HistoryRecord(this.routeState, this.routeState.key, this.history, store);
    this.history.init(historyRecord);
  }

  getCurrentStore() {
    return this.history.getCurrentRecord().getStore();
  }

  getCurKey() {
    return this.routeState.key;
  }

  getHistory(root) {
    return root ? this.history : this.history.getCurrentSubHistory();
  }

  getHistoryLength(root) {
    return root ? this.history.getLength() : this.history.getCurrentSubHistory().getLength();
  }

  locationToNativeData(location) {
    const nativeLocation = this.locationTransform.partialLocationToNativeLocation(location);
    const nativeUrl = this.nativeLocationToNativeUrl(nativeLocation);
    return {
      nativeUrl,
      nativeLocation
    };
  }

  urlToLocation(url) {
    return this.locationTransform.urlToLocation(url);
  }

  payloadLocationToEluxUrl(data) {
    const eluxLocation = this.payloadToEluxLocation(data);
    return eluxLocationToEluxUrl(eluxLocation);
  }

  payloadLocationToNativeUrl(data) {
    const eluxLocation = this.payloadToEluxLocation(data);
    const nativeLocation = this.locationTransform.eluxLocationToNativeLocation(eluxLocation);
    return this.nativeLocationToNativeUrl(nativeLocation);
  }

  nativeLocationToNativeUrl(nativeLocation) {
    return nativeLocationToNativeUrl(nativeLocation);
  }

  _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  payloadToEluxLocation(payload) {
    let params = payload.params || {};
    const extendParams = payload.extendParams === 'current' ? this.routeState.params : payload.extendParams;

    if (extendParams && params) {
      params = deepMerge({}, extendParams, params);
    } else if (extendParams) {
      params = extendParams;
    }

    return {
      pathname: payload.pathname || this.routeState.pagename,
      params
    };
  }

  preAdditions(data) {
    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return null;
      }

      return this.locationTransform.urlToLocation(data);
    }

    const eluxLocation = this.payloadToEluxLocation(data);
    return this.locationTransform.eluxLocationToLocation(eluxLocation);
  }

  relaunch(data, root = false, nativeCaller = false) {
    this.addTask(this._relaunch.bind(this, data, root, nativeCaller));
  }

  async _relaunch(data, root, nativeCaller) {
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
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    let nativeData;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      nativeData = await this.nativeRouter.execute('relaunch', () => this.locationToNativeData(routeState), key);
    }

    this._nativeData = nativeData;
    this.routeState = routeState;
    this.internalUrl = eluxLocationToEluxUrl({
      pathname: routeState.pagename,
      params: routeState.params
    });

    if (root) {
      this.history.relaunch(location, key);
    } else {
      this.history.getCurrentSubHistory().relaunch(location, key);
    }

    this.dispatch({
      routeState,
      root
    });
    this.getCurrentStore().dispatch(routeChangeAction(routeState));
  }

  push(data, root = false, nativeCaller = false) {
    this.addTask(this._push.bind(this, data, root, nativeCaller));
  }

  async _push(data, root, nativeCaller) {
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
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    let nativeData;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      nativeData = await this.nativeRouter.execute('push', () => this.locationToNativeData(routeState), key);
    }

    this._nativeData = nativeData;
    this.routeState = routeState;
    this.internalUrl = eluxLocationToEluxUrl({
      pathname: routeState.pagename,
      params: routeState.params
    });

    if (root) {
      this.history.push(location, key);
    } else {
      this.history.getCurrentSubHistory().push(location, key);
    }

    this.dispatch({
      routeState,
      root
    });
    this.getCurrentStore().dispatch(routeChangeAction(routeState));
  }

  replace(data, root = false, nativeCaller = false) {
    this.addTask(this._replace.bind(this, data, root, nativeCaller));
  }

  async _replace(data, root, nativeCaller) {
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
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    let nativeData;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      nativeData = await this.nativeRouter.execute('replace', () => this.locationToNativeData(routeState), key);
    }

    this._nativeData = nativeData;
    this.routeState = routeState;
    this.internalUrl = eluxLocationToEluxUrl({
      pathname: routeState.pagename,
      params: routeState.params
    });

    if (root) {
      this.history.replace(location, key);
    } else {
      this.history.getCurrentSubHistory().replace(location, key);
    }

    this.dispatch({
      routeState,
      root
    });
    this.getCurrentStore().dispatch(routeChangeAction(routeState));
  }

  back(n = 1, root = false, options, nativeCaller = false) {
    this.addTask(this._back.bind(this, n, root, options || {}, nativeCaller));
  }

  async _back(n = 1, root, options, nativeCaller) {
    if (n < 1) {
      return undefined;
    }

    const didOverflowRedirect = !!options.overflowRedirect;
    const overflowRedirectUrl = typeof options.overflowRedirect === 'string' ? options.overflowRedirect : routeConfig.indexUrl;
    const historyRecord = root ? this.history.preBack(n, didOverflowRedirect) : this.history.getCurrentSubHistory().preBack(n, didOverflowRedirect);

    if (!historyRecord) {
      return this.relaunch(overflowRedirectUrl, root);
    }

    const {
      key,
      pagename
    } = historyRecord;
    const params = deepMerge(historyRecord.getParams(), options.payload);
    const routeState = {
      key,
      pagename,
      params,
      action: 'BACK'
    };
    const prevRootState = this.getCurrentStore().getState();
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState, prevRootState));
    let nativeData;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];

    if (!nativeCaller && notifyNativeRouter) {
      nativeData = await this.nativeRouter.execute('back', () => this.locationToNativeData(routeState), n, key);
    }

    this._nativeData = nativeData;
    this.routeState = routeState;
    this.internalUrl = eluxLocationToEluxUrl({
      pathname: routeState.pagename,
      params: routeState.params
    });

    if (root) {
      this.history.back(n);
    } else {
      this.history.getCurrentSubHistory().back(n);
    }

    this.dispatch({
      routeState,
      root
    });
    this.getCurrentStore().dispatch(routeChangeAction(routeState, prevRootState));
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