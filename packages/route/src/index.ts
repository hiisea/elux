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
  RouteHistoryAction,
} from '@elux/core';

import {routeConfig, EluxLocation, NativeLocation, StateLocation} from './basic';
import {WindowStack, PageStack, RouteRecord, URouteRecord} from './history';

import {location as createLocationTransform, ULocationTransform} from './transform';

export {setRouteConfig, routeConfig, routeJsonParse} from './basic';
export {location, createRouteModule, urlParser} from './transform';

export type {URouteRecord} from './history';
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

  public readonly windowStack: WindowStack = new WindowStack();

  public latestState: Record<string, any> = {};

  constructor(nativeUrl: string, protected nativeRouter: BaseNativeRouter, public nativeData: unknown) {
    super();
    nativeRouter.startup(this);
    const location = createLocationTransform(nativeUrl);
    this.location = location;
    const pagename = location.getPagename();
    const paramsOrPromise = location.getParams();
    const callback = (params: RootState) => {
      const routeState: RouteState = {pagename, params, action: RouteHistoryAction.RELAUNCH, key: ''};
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
    const pageStack = new PageStack(this.windowStack, store);
    const routeRecord = new RouteRecord(this.location, pageStack);
    pageStack.startup(routeRecord);
    this.windowStack.startup(pageStack);
    this.routeState.key = routeRecord.key;
  }
  getCurrentPages(): {pagename: string; store: UStore; pageComponent?: any}[] {
    return this.windowStack.getCurrentPages();
  }
  getCurrentStore(): EStore {
    return this.windowStack.getCurrentItem().store;
  }
  getStoreList(): EStore[] {
    return this.windowStack.getItems().map(({store}) => store);
  }
  getHistoryLength(root?: boolean): number {
    return root ? this.windowStack.getLength() : this.windowStack.getCurrentItem().getLength();
  }
  findRecordByKey(recordKey: string): {record: URouteRecord; overflow: boolean; index: [number, number]} {
    const {
      record: {key, location},
      overflow,
      index,
    } = this.windowStack.findRecordByKey(recordKey);
    return {overflow, index, record: {key, location}};
  }
  findRecordByStep(delta: number, rootOnly: boolean): {record: URouteRecord; overflow: boolean; index: [number, number]} {
    const {
      record: {key, location},
      overflow,
      index,
    } = this.windowStack.testBack(delta, rootOnly);
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
    const routeState: RouteState = {pagename, params, action: RouteHistoryAction.RELAUNCH, key};
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));
    if (root) {
      key = this.windowStack.relaunch(location).key;
    } else {
      key = this.windowStack.getCurrentItem().relaunch(location).key;
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
    const routeState: RouteState = {pagename, params, action: RouteHistoryAction.PUSH, key};
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));
    if (root) {
      key = this.windowStack.push(location).key;
    } else {
      key = this.windowStack.getCurrentItem().push(location).key;
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
    const routeState: RouteState = {pagename, params, action: RouteHistoryAction.REPLACE, key};
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));
    if (root) {
      key = this.windowStack.replace(location).key;
    } else {
      key = this.windowStack.getCurrentItem().replace(location).key;
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
    const {record, overflow, index} = this.windowStack.testBack(stepOrKey, root);
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
    const routeState: RouteState = {key, pagename, params, action: RouteHistoryAction.BACK};
    //const prevRootState = this.getCurrentStore().getState();
    await this.getCurrentStore().dispatch(routeTestChangeAction(routeState));
    await this.getCurrentStore().dispatch(routeBeforeChangeAction(routeState));
    if (index[0]) {
      root = true;
      this.windowStack.back(index[0]);
    }
    if (index[1]) {
      this.windowStack.getCurrentItem().back(index[1]);
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

/**
 * 路由实例
 *
 * @remarks
 * 可以通过 {@link getApi | GetRouter() 或 useRouter()} 获得，在 model 中也可通过 {@link BaseModel.router} 获得
 *
 * 在CSR（`客户端渲染`）中，只存在一个唯一的 Router 实例，在SSR（`服务端渲染`）中，每个 request 请求都会生成一个 Router 实例
 *
 * @public
 */
export interface URouter<S extends RouteState = RouteState, T = unknown> {
  /**
   * 用于SSR中，注入请求的原始数据
   *
   * @example
   * 如：createSSR(moduleGetter, request.url, `{request, response}`).render();
   */
  nativeData: T;
  /**
   * 当前的 {@link ULocationTransform | location}
   */
  location: ULocationTransform;
  /**
   * 当前的 {@link RouteState}
   */
  routeState: S;
  /**
   * 初始的 {@link RouteState}
   */
  initialize: Promise<RouteState>;
  /**
   * 单独监听路由的 `change` 事件，通常无需这么做，推荐直接在 model 中利用 {@link effect} 监听
   */
  addListener(name: 'change', callback: (data: {routeState: RouteState; root: boolean}) => void | Promise<void>): UNListener;
  /**
   * 获取所有`EWindow窗口`中的当前页面，多页模式下可以存在多个`EWindow`
   */
  getCurrentPages(): {pagename: string; store: UStore; pageComponent?: any}[];
  /**
   * 用`唯一key`来查找某条路由历史记录，如果没找到则返回 `{overflow: true}`
   */
  findRecordByKey(key: string): {record: URouteRecord; overflow: boolean; index: [number, number]};
  /**
   * 用`回退步数`来查找某条路由历史记录，如果步数溢出则返回 `{overflow: true}`
   */
  findRecordByStep(delta: number, rootOnly: boolean): {record: URouteRecord; overflow: boolean; index: [number, number]};
  /**
   * 基于当前路由的状态来创建一个新的 {@link StateLocation}
   */
  extendCurrent(params: DeepPartial<S['params']>, pagename?: S['pagename']): StateLocation<S['params'], S['pagename']>;
  /**
   * 跳转一条路由，并清空所有历史记录，对应 {@link RouteHistoryAction.RELAUNCH}
   *
   * @param dataOrUrl - 3种路由描述或3种路由协议的url，参见 {@link location}
   * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈；`false`表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
   * @param nonblocking - `ture`表示如果一条路由切换过程中（未执行完成）又触发另一条新的路由切换，新的路由切换将随后继续执行；`false`表示忽略新的路由切换，默认为`false`
   */
  relaunch(
    dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation,
    root?: boolean,
    nonblocking?: boolean
  ): void | Promise<void>;
  /**
   * 新增一条路由，对应 {@link RouteHistoryAction.PUSH}
   *
   * @param dataOrUrl - 3种路由描述或3种路由协议的url，参见 {@link location}
   * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈；`false`表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
   * @param nonblocking - `ture`表示如果一条路由切换过程中（未执行完成）又触发另一条新的路由切换，新的路由切换将随后继续执行；`false`表示忽略新的路由切换，默认为`false`
   */
  push(
    dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation,
    root?: boolean,
    nonblocking?: boolean
  ): void | Promise<void>;
  /**
   * 替换当前路由，对应 {@link RouteHistoryAction.REPLACE}
   *
   * @param dataOrUrl - 3种路由描述或3种路由协议的url，参见 {@link location}
   * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈；`false`表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
   * @param nonblocking - `ture`表示如果一条路由切换过程中（未执行完成）又触发另一条新的路由切换，新的路由切换将随后继续执行；`false`表示忽略新的路由切换，默认为`false`
   */
  replace(
    dataOrUrl: string | EluxLocation<S['params']> | StateLocation<S['params'], S['pagename']> | NativeLocation,
    root?: boolean,
    nonblocking?: boolean
  ): void | Promise<void>;
  /**
   * 回退历史记录，对应 {@link RouteHistoryAction.BACK}
   *
   * @param stepOrKey - 需要回退的步数或者历史记录的唯一id
   * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈；`false`表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
   * @param options - `-overflowRedirect`：如果回退步数溢出，将跳往该 `url `或 {@link UserConfig.indexUrl | 首页}； `-payload`：此参数将合并到回退后的路由参数中
   * @param nonblocking - `ture`表示如果一条路由切换过程中（未执行完成）又触发另一条新的路由切换，新的路由切换将随后继续执行；`false`表示忽略新的路由切换，默认为`false`
   */
  back(
    stepOrKey?: number | string,
    root?: boolean,
    options?: {overflowRedirect?: string; payload?: any},
    nonblocking?: boolean
  ): void | Promise<void>;
  /**
   * 获取历史记录数
   *
   * @param root - `ture`表示操作的是`窗口EWindow`的历史堆栈，否则表示操作的是当前`窗口EWindow`里面的历史堆栈，默认为`false`
   */
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
