import {
  isPromise,
  deepMerge,
  IStore,
  ICoreRouter,
  IModuleHandlers,
  routeChangeAction,
  coreConfig,
  deepClone,
  MultipleDispatcher,
  Action,
  env,
  reinitApp,
} from '@elux/core';

import {routeConfig, RootParams, DeepPartial, EluxLocation, NativeLocation, StateLocation, RouteState} from './basic';
import {RootStack, HistoryStack, HistoryRecord} from './history';

import {location as createLocationTransform, ILocationTransform} from './transform';

export {setRouteConfig, routeConfig, routeMeta, safeJsonParse} from './basic';
export {location, createRouteModule, urlParser} from './transform';

export type {ILocationTransform} from './transform';
export type {
  RootParams,
  EluxLocation,
  NativeLocation,
  StateLocation,
  LocationState,
  RouteState,
  HistoryAction,
  PagenameMap,
  DeepPartial,
  NativeLocationMap,
} from './basic';

export abstract class BaseNativeRouter {
  protected curTask?: () => void;

  protected eluxRouter!: IEluxRouter;

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task

  protected abstract push(location: ILocationTransform, key: string): void | true | Promise<void>;

  protected abstract replace(location: ILocationTransform, key: string): void | true | Promise<void>;

  protected abstract relaunch(location: ILocationTransform, key: string): void | true | Promise<void>;

  protected abstract back(location: ILocationTransform, index: [number, number], key: string): void | true | Promise<void>;

  public abstract destroy(): void;

  protected onChange(key: string): boolean {
    if (this.curTask) {
      this.curTask();
      this.curTask = undefined;
      return false;
    }
    return key !== this.eluxRouter.routeState.key;
  }

  public startup(router: IEluxRouter): void {
    this.eluxRouter = router;
  }

  public execute(method: 'relaunch' | 'push' | 'replace' | 'back', location: ILocationTransform, ...args: any[]): Promise<void> {
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

export abstract class BaseEluxRouter<P extends RootParams = {}, N extends string = string, NT = unknown>
  extends MultipleDispatcher<{change: {routeState: RouteState<P>; root: boolean}}>
  implements IEluxRouter<P, N, NT>
{
  private _curTask?: () => Promise<void>;

  private _taskList: Array<() => Promise<void>> = [];

  public location: ILocationTransform;

  public routeState!: RouteState<P>;

  public readonly name = routeConfig.RouteModuleName;

  public initialize: Promise<RouteState<P>>;

  public readonly injectedModules: {[moduleName: string]: IModuleHandlers} = {};

  public readonly rootStack: RootStack = new RootStack();

  public latestState: Record<string, any> = {};

  constructor(nativeUrl: string, protected nativeRouter: BaseNativeRouter, public nativeData: NT) {
    super();
    nativeRouter.startup(this);
    const location = createLocationTransform<P>(nativeUrl);
    this.location = location;
    const pagename = location.getPagename();
    const paramsOrPromise = location.getParams();
    const callback = (params: Partial<P>) => {
      const routeState: RouteState<P> = {pagename, params, action: 'RELAUNCH', key: ''};
      this.routeState = routeState;
      return routeState;
    };
    if (isPromise(paramsOrPromise)) {
      this.initialize = paramsOrPromise.then(callback);
    } else {
      this.initialize = Promise.resolve(callback(paramsOrPromise));
    }
  }
  startup(store: IStore): void {
    const historyStack = new HistoryStack(this.rootStack, store);
    const historyRecord = new HistoryRecord(this.location, historyStack);
    historyStack.startup(historyRecord);
    this.rootStack.startup(historyStack);
    this.routeState.key = historyRecord.key;
  }
  getCurrentPages(): {pagename: string; store: IStore; page?: any}[] {
    return this.rootStack.getCurrentPages();
  }
  getCurrentStore(): IStore {
    return this.rootStack.getCurrentItem().store;
  }
  getStoreList(): IStore[] {
    return this.rootStack.getItems().map(({store}) => store);
  }
  getHistoryLength(root?: boolean): number {
    return root ? this.rootStack.getLength() : this.rootStack.getCurrentItem().getLength();
  }
  findRecordByKey(key: string): {record: HistoryRecord; overflow: boolean; index: [number, number]} {
    return this.rootStack.findRecordByKey(key);
  }
  findRecordByStep(delta: number, rootOnly: boolean): {record: HistoryRecord; overflow: boolean; index: [number, number]} {
    return this.rootStack.testBack(delta, rootOnly);
  }
  extendCurrent(params: DeepPartial<P>, pagename?: N): StateLocation<P, N> {
    return {payload: deepMerge({}, this.routeState.params, params), pagename: (pagename || this.routeState.pagename) as N};
  }
  relaunch(
    dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation,
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
    const routeState: RouteState<P> = {pagename, params, action: 'RELAUNCH', key};
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    await this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));
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
    dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation,
    root = false,
    nonblocking?: boolean,
    nativeCaller = false
  ): void | Promise<void> {
    return this.addTask(this._push.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  private async _push(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root: boolean, nativeCaller: boolean) {
    const location = createLocationTransform(dataOrUrl);
    const pagename = location.getPagename();
    const params = await location.getParams();
    let key = '';
    const routeState: RouteState<P> = {pagename, params, action: 'PUSH', key};
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    await this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));
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
    dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation,
    root = false,
    nonblocking?: boolean,
    nativeCaller = false
  ): void | Promise<void> {
    return this.addTask(this._replace.bind(this, dataOrUrl, root, nativeCaller), nonblocking);
  }

  private async _replace(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root: boolean, nativeCaller: boolean) {
    const location = createLocationTransform(dataOrUrl);
    const pagename = location.getPagename();
    const params = await location.getParams();
    let key = '';
    const routeState: RouteState<P> = {pagename, params, action: 'REPLACE', key};
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    await this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));
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
    const routeState: RouteState<P> = {key, pagename, params, action: 'BACK'};
    //const prevRootState = this.getCurrentStore().getState();
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    await this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));
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

export interface IEluxRouter<P extends RootParams = {}, N extends string = string, NT = unknown> extends ICoreRouter<RouteState<P>> {
  initialize: Promise<RouteState<P>>;
  nativeData: NT;
  location: ILocationTransform;
  addListener(name: 'change', callback: (data: {routeState: RouteState<P>; root: boolean}) => void | Promise<void>): () => void;
  getCurrentPages(): {pagename: string; store: IStore; page?: any}[];
  findRecordByKey(key: string): {record: HistoryRecord; overflow: boolean; index: [number, number]};
  findRecordByStep(delta: number, rootOnly: boolean): {record: HistoryRecord; overflow: boolean; index: [number, number]};
  extendCurrent(params: DeepPartial<P>, pagename?: N): StateLocation<P, N>;
  relaunch(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
  push(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
  replace(dataOrUrl: string | EluxLocation<P> | StateLocation<P, N> | NativeLocation, root?: boolean, nonblocking?: boolean): void | Promise<void>;
  back(
    stepOrKey?: number | string,
    root?: boolean,
    options?: {overflowRedirect?: string; payload?: any},
    nonblocking?: boolean
  ): void | Promise<void>;
  getHistoryLength(root?: boolean): number;
  destroy(): void;
}

export const RouteActionTypes = {
  TestRouteChange: `${routeConfig.RouteModuleName}${coreConfig.NSP}TestRouteChange`,
  BeforeRouteChange: `${routeConfig.RouteModuleName}${coreConfig.NSP}BeforeRouteChange`,
};
export function beforeRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action {
  return {
    type: RouteActionTypes.BeforeRouteChange,
    payload: [routeState],
  };
}
export function testRouteChangeAction<P extends RootParams>(routeState: RouteState<P>): Action {
  return {
    type: RouteActionTypes.TestRouteChange,
    payload: [routeState],
  };
}
