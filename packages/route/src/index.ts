import {
  isPromise,
  deepMerge,
  UStore,
  EStore,
  CoreRouter,
  RootState,
  RouteState,
  UNListener,
  DeepPartial,
  routeChangeAction,
  routeBeforeChangeAction,
  routeTestChangeAction,
  coreConfig,
  deepClone,
  MultipleDispatcher,
  env,
  reinitApp,
} from '@elux/core';

import {routeConfig, EluxLocation, NativeLocation, StateLocation} from './basic';
import {RootStack, HistoryStack, HistoryRecord, UHistoryRecord} from './history';

import {location as createLocationTransform, ULocationTransform} from './transform';

export {setRouteConfig, routeConfig, safeJsonParse} from './basic';
export {location, createRouteModule, urlParser} from './transform';

export type {UHistoryRecord} from './history';
export type {ULocationTransform} from './transform';
export type {EluxLocation, NativeLocation, StateLocation, PagenameMap, NativeLocationMap} from './basic';

export abstract class BaseNativeRouter {
  protected curTask?: () => void;

  protected eluxRouter!: URouter;

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task

  protected abstract push(location: ULocationTransform, key: string): void | true | Promise<void>;

  protected abstract replace(location: ULocationTransform, key: string): void | true | Promise<void>;

  protected abstract relaunch(location: ULocationTransform, key: string): void | true | Promise<void>;

  protected abstract back(location: ULocationTransform, index: [number, number], key: string): void | true | Promise<void>;

  public abstract destroy(): void;

  protected onChange(key: string): boolean {
    if (this.curTask) {
      this.curTask();
      this.curTask = undefined;
      return false;
    }
    return key !== this.eluxRouter.routeState.key;
  }

  public startup(router: URouter): void {
    this.eluxRouter = router;
  }

  public execute(method: 'relaunch' | 'push' | 'replace' | 'back', location: ULocationTransform, ...args: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.curTask = resolve;
      const result: void | true | Promise<void> = this[method as string](location, ...args);
      if (!result) {
        // 表示native不做任何处理，也不会触发onChange
        resolve();
        this.curTask = undefined;
      } else if (isPromise(result)) {
        // 存在错误时，不会触发onChange，需要手动触发，否则都会触发onChange
        result.catch((e) => {
          reject(e);
          env.console.error(e);
          this.curTask = undefined;
        });
      }
    });
  }
}

export class BaseEluxRouter extends MultipleDispatcher<{change: {routeState: RouteState; root: boolean}}> implements CoreRouter, URouter {
  private _curTask?: () => Promise<void>;

  private _taskList: Array<() => Promise<void>> = [];

  public location: ULocationTransform;

  public routeState!: RouteState;

  public readonly name = coreConfig.RouteModuleName;

  public initialize: Promise<RouteState>;

  public readonly rootStack: RootStack = new RootStack();

  public latestState: Record<string, any> = {};

  constructor(nativeUrl: string, protected nativeRouter: BaseNativeRouter, public nativeData: unknown) {
    super();
    nativeRouter.startup(this);
    const location = createLocationTransform(nativeUrl);
    this.location = location;
    const pagename = location.getPagename();
    const paramsOrPromise = location.getParams();
    const callback = (params: RootState) => {
      const routeState: RouteState = {pagename, params, action: 'RELAUNCH', key: ''};
      this.routeState = routeState;
      return routeState;
    };
    if (isPromise(paramsOrPromise)) {
      this.initialize = paramsOrPromise.then(callback);
    } else {
      this.initialize = Promise.resolve(callback(paramsOrPromise));
    }
  }
  startup(store: EStore): void {
    const historyStack = new HistoryStack(this.rootStack, store);
    const historyRecord = new HistoryRecord(this.location, historyStack);
    historyStack.startup(historyRecord);
    this.rootStack.startup(historyStack);
    this.routeState.key = historyRecord.key;
  }
  getCurrentPages(): {pagename: string; store: UStore; pageData?: any}[] {
    return this.rootStack.getCurrentPages();
  }
  getCurrentStore(): EStore {
    return this.rootStack.getCurrentItem().store;
  }
  getStoreList(): EStore[] {
    return this.rootStack.getItems().map(({store}) => store);
  }
  getHistoryLength(root?: boolean): number {
    return root ? this.rootStack.getLength() : this.rootStack.getCurrentItem().getLength();
  }
  findRecordByKey(recordKey: string): {record: UHistoryRecord; overflow: boolean; index: [number, number]} {
    const {
      record: {key, location},
      overflow,
      index,
    } = this.rootStack.findRecordByKey(recordKey);
    return {overflow, index, record: {key, location}};
  }
  findRecordByStep(delta: number, rootOnly: boolean): {record: UHistoryRecord; overflow: boolean; index: [number, number]} {
    const {
      record: {key, location},
      overflow,
      index,
    } = this.rootStack.testBack(delta, rootOnly);
    return {overflow, index, record: {key, location}};
  }
  extendCurrent(params: DeepPartial<RootState>, pagename?: string): StateLocation {
    return {payload: deepMerge({}, this.routeState.params, params), pagename: pagename || this.routeState.pagename};
  }
  relaunch(
    dataOrUrl: string | EluxLocation | StateLocation | NativeLocation,
    root = false,
    nonblocking?: boolean,
    nativeCaller = false
  ): void | Promise<void> {
    return this.addTask(this._relaunch.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  private async _relaunch(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation, root: boolean, nativeCaller: boolean) {
    const location = createLocationTransform(dataOrUrl);
    const pagename = location.getPagename();
    const params = await location.getParams();
    let key = '';
    const routeState: RouteState = {pagename, params, action: 'RELAUNCH', key};
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
    await this.dispatch('change', {routeState: cloneState, root});
  }

  push(
    dataOrUrl: string | EluxLocation | StateLocation | NativeLocation,
    root = false,
    nonblocking?: boolean,
    nativeCaller = false
  ): void | Promise<void> {
    return this.addTask(this._push.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  private async _push(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation, root: boolean, nativeCaller: boolean) {
    const location = createLocationTransform(dataOrUrl);
    const pagename = location.getPagename();
    const params = await location.getParams();
    let key = '';
    const routeState: RouteState = {pagename, params, action: 'PUSH', key};
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

    await this.dispatch('change', {routeState: cloneState, root});
  }

  replace(
    dataOrUrl: string | EluxLocation | StateLocation | NativeLocation,
    root = false,
    nonblocking?: boolean,
    nativeCaller = false
  ): void | Promise<void> {
    return this.addTask(this._replace.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  private async _replace(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation, root: boolean, nativeCaller: boolean) {
    const location = createLocationTransform(dataOrUrl);
    const pagename = location.getPagename();
    const params = await location.getParams();
    let key = '';
    const routeState: RouteState = {pagename, params, action: 'REPLACE', key};
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
    await this.dispatch('change', {routeState: cloneState, root});
  }

  back(
    stepOrKey: number | string = 1,
    root = false,
    options?: {overflowRedirect?: string; payload?: any},
    nonblocking?: boolean,
    nativeCaller = false
  ): void | Promise<void> {
    if (!stepOrKey) {
      return;
    }
    return this.addTask(this._back.bind(this, stepOrKey, root, options || {}, nativeCaller), nonblocking);
  }

  private async _back(stepOrKey: number | string, root: boolean, options: {overflowRedirect?: string; payload?: any}, nativeCaller: boolean) {
    const {record, overflow, index} = this.rootStack.testBack(stepOrKey, root);
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
    const routeState: RouteState = {key, pagename, params, action: 'BACK'};
    //const prevRootState = this.getCurrentStore().getState();
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
    await this.dispatch('change', {routeState, root});
  }

  private _taskComplete = () => {
    const task = this._taskList.shift();
    if (task) {
      this.executeTask(task);
    } else {
      this._curTask = undefined;
    }
  };

  private executeTask(task: () => Promise<void>): void {
    this._curTask = task;
    task().finally(this._taskComplete);
  }

  private addTask(execute: () => Promise<any>, nonblocking?: boolean): void | Promise<void> {
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

  destroy(): void {
    this.nativeRouter.destroy();
  }
}

/*** @public */
export interface URouter<S extends RouteState = RouteState, T = unknown> {
  nativeData: T;
  location: ULocationTransform;
  routeState: S;
  initialize: Promise<RouteState>;
  addListener(name: 'change', callback: (data: {routeState: RouteState; root: boolean}) => void | Promise<void>): UNListener;
  getCurrentPages(): {pagename: string; store: UStore; pageData?: any}[];
  findRecordByKey(key: string): {record: UHistoryRecord; overflow: boolean; index: [number, number]};
  findRecordByStep(delta: number, rootOnly: boolean): {record: UHistoryRecord; overflow: boolean; index: [number, number]};
  extendCurrent(params: DeepPartial<S['params']>, pagename?: S['pagename']): StateLocation<S['params'], S['pagename']>;
  relaunch(
    dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation,
    root?: boolean,
    nonblocking?: boolean
  ): void | Promise<void>;
  push(
    dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation,
    root?: boolean,
    nonblocking?: boolean
  ): void | Promise<void>;
  replace(
    dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation,
    root?: boolean,
    nonblocking?: boolean
  ): void | Promise<void>;
  back(
    stepOrKey?: number | string,
    root?: boolean,
    options?: {overflowRedirect?: string; payload?: any},
    nonblocking?: boolean
  ): void | Promise<void>;
  getHistoryLength(root?: boolean): number;
}

export function toURouter(router: BaseEluxRouter): URouter {
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
    back,
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
    back: back.bind(router),
  };
}
