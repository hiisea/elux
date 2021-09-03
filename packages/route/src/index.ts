import {
  isPromise,
  deepMerge,
  IStore,
  ICoreRouter,
  IModuleHandlers,
  routeChangeAction,
  CommonModule,
  coreConfig,
  exportModule,
  deepClone,
  MultipleDispatcher,
  Action,
  RouteModuleHandlers,
  IRouteModuleHandlersClass,
  env,
  reinitApp,
} from '@elux/core';

import {routeConfig, setRouteConfig, PartialLocationState, NativeLocation, RootParams, LocationState, RouteState, PayloadData} from './basic';
import {RootStack, HistoryStack, HistoryRecord} from './history';

import {eluxLocationToEluxUrl, LocationTransform, NativeLocationMap, PagenameMap, createLocationTransform} from './transform';

export {setRouteConfig, routeConfig, routeMeta} from './basic';
export {createLocationTransform, nativeUrlToNativeLocation, nativeLocationToNativeUrl} from './transform';

export type {PagenameMap, LocationTransform} from './transform';
export type {RootParams, LocationState, RouteState, HistoryAction, DeepPartial, PayloadData, NativeLocation} from './basic';

export type NativeData = {nativeLocation: NativeLocation; nativeUrl: string};

interface NativeRouterTask {
  resolve: (nativeData: NativeData | undefined) => void;
  reject: () => void;
  nativeData: undefined | NativeData;
}

export abstract class BaseNativeRouter {
  protected curTask?: NativeRouterTask;

  protected eluxRouter!: IEluxRouter;

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task

  protected abstract push(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;

  protected abstract replace(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;

  protected abstract relaunch(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;

  protected abstract back(getNativeData: () => NativeData, n: number, key: string): void | NativeData | Promise<NativeData>;

  public abstract destroy(): void;

  protected onChange(key: string): boolean {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }
    return key !== this.eluxRouter.routeState.key;
  }

  public startup(router: IEluxRouter): void {
    this.eluxRouter = router;
  }

  public execute(method: 'relaunch' | 'push' | 'replace' | 'back', getNativeData: () => NativeData, ...args: any[]): Promise<NativeData | undefined> {
    return new Promise((resolve, reject) => {
      const task: NativeRouterTask = {resolve, reject, nativeData: undefined};
      this.curTask = task;
      const result: void | NativeData | Promise<NativeData> = this[method as string](() => {
        const nativeData = getNativeData();
        task.nativeData = nativeData;
        return nativeData;
      }, ...args);
      if (!result) {
        // 表示native不做任何处理，也不会触发onChange
        resolve(undefined);
        this.curTask = undefined;
      } else if (isPromise(result)) {
        // 存在错误时，不会触发onChange，需要手动触发，否则都会触发onChange
        result.catch((e) => {
          reject(e);
          this.curTask = undefined;
        });
      }
    });
  }
}

export abstract class BaseEluxRouter<P extends RootParams = {}, N extends string = string, NT = unknown>
  extends MultipleDispatcher<{change: {routeState: RouteState<P>; root: boolean}}>
  implements IEluxRouter<P, N, NT> {
  private _curTask?: () => Promise<void>;

  private _taskList: Array<() => Promise<void>> = [];

  private _nativeData: {nativeLocation: NativeLocation; nativeUrl: string} | undefined;

  private _internalUrl!: string;

  public routeState!: RouteState<P>;

  public readonly name = routeConfig.RouteModuleName;

  public initialize: Promise<RouteState<P>>;

  public readonly injectedModules: {[moduleName: string]: IModuleHandlers} = {};

  public readonly rootStack: RootStack = new RootStack();

  public latestState: Record<string, any> = {};

  constructor(nativeUrl: string, protected nativeRouter: BaseNativeRouter, public locationTransform: LocationTransform, public nativeData: NT) {
    super();
    nativeRouter.startup(this);
    const nativeLocation = locationTransform.nativeUrlToNativeLocation(nativeUrl);
    const locationStateOrPromise = locationTransform.partialLocationStateToLocationState<P>(
      locationTransform.nativeLocationToPartialLocationState(nativeLocation)
    );
    const callback = (locationState: LocationState<P>) => {
      const routeState: RouteState<P> = {...locationState, action: 'RELAUNCH', key: ''};
      this.routeState = routeState;
      this._internalUrl = eluxLocationToEluxUrl({pathname: routeState.pagename, params: routeState.params});
      if (!routeConfig.indexUrl) {
        setRouteConfig({indexUrl: this._internalUrl});
      }
      return routeState;
    };
    if (isPromise(locationStateOrPromise)) {
      this.initialize = locationStateOrPromise.then(callback);
    } else {
      this.initialize = Promise.resolve(callback(locationStateOrPromise));
    }
  }
  startup(store: IStore): void {
    const historyStack = new HistoryStack(this.rootStack, store);
    const historyRecord = new HistoryRecord(this.routeState, historyStack);
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
  getInternalUrl(): string {
    return this._internalUrl;
  }
  getNativeLocation(): NativeLocation {
    if (!this._nativeData) {
      this._nativeData = this.partialLocationStateToNativeData(this.routeState);
    }
    return this._nativeData.nativeLocation;
  }
  getNativeUrl(): string {
    if (!this._nativeData) {
      this._nativeData = this.partialLocationStateToNativeData(this.routeState);
    }
    return this._nativeData.nativeUrl;
  }
  getHistoryLength(root?: boolean): number {
    return root ? this.rootStack.getLength() : this.rootStack.getCurrentItem().getLength();
  }
  findRecordByKey(key: string): HistoryRecord | undefined {
    return this.rootStack.findRecordByKey(key);
  }
  findRecordByStep(delta: number, rootOnly: boolean): {record: HistoryRecord; overflow: boolean; steps: [number, number]} {
    return this.rootStack.testBack(delta, rootOnly);
  }
  private partialLocationStateToNativeData(partialLocationState: PartialLocationState): {nativeUrl: string; nativeLocation: NativeLocation} {
    const nativeLocation = this.locationTransform.partialLocationStateToNativeLocation(partialLocationState);
    const nativeUrl = this.locationTransform.nativeLocationToNativeUrl(nativeLocation);
    return {nativeUrl, nativeLocation};
  }
  private preAdditions(eluxUrlOrPayload: PayloadData | string): LocationState<P> | Promise<LocationState<P>> {
    let partialLocationState: PartialLocationState;
    if (typeof eluxUrlOrPayload === 'string') {
      const eluxLocation = this.locationTransform.eluxUrlToEluxLocation(eluxUrlOrPayload);
      partialLocationState = this.locationTransform.eluxLocationToPartialLocationState(eluxLocation);
    } else {
      const {extendParams, pagename} = eluxUrlOrPayload;
      const data = {...eluxUrlOrPayload};
      if (extendParams === 'current') {
        data.extendParams = this.routeState.params;
        data.pagename = pagename || this.routeState.pagename;
      }
      partialLocationState = this.locationTransform.payloadToPartialLocationState(data as any);
    }
    return this.locationTransform.partialLocationStateToLocationState(partialLocationState);
  }

  relaunch(eluxUrlOrPayload: PayloadData<P, N> | string, root = false, nonblocking?: boolean, nativeCaller = false): void | Promise<void> {
    return this.addTask(this._relaunch.bind(this, eluxUrlOrPayload, root, nativeCaller), nonblocking);
  }

  private async _relaunch(eluxUrlOrPayload: PayloadData<P, N> | string, root: boolean, nativeCaller: boolean) {
    const location = await this.preAdditions(eluxUrlOrPayload);
    let key = '';
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    await this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));
    if (root) {
      key = this.rootStack.relaunch(routeState).key;
    } else {
      key = this.rootStack.getCurrentItem().relaunch(routeState).key;
    }
    routeState.key = key;
    let nativeData: NativeData | undefined;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];
    if (!nativeCaller && notifyNativeRouter) {
      nativeData = await this.nativeRouter.execute('relaunch', () => this.partialLocationStateToNativeData(routeState), key);
    }
    this._nativeData = nativeData;
    this.routeState = routeState;
    this._internalUrl = eluxLocationToEluxUrl({pathname: routeState.pagename, params: routeState.params});
    const cloneState = deepClone(routeState);
    this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    await this.dispatch('change', {routeState: cloneState, root});
  }

  push(eluxUrlOrPayload: PayloadData<P, N> | string, root = false, nonblocking?: boolean, nativeCaller = false): void | Promise<void> {
    return this.addTask(this._push.bind(this, eluxUrlOrPayload, root, nativeCaller), nonblocking);
  }

  private async _push(eluxUrlOrPayload: PayloadData<P, N> | string, root: boolean, nativeCaller: boolean) {
    const location = await this.preAdditions(eluxUrlOrPayload);
    let key = '';
    const routeState: RouteState<P> = {...location, action: 'PUSH', key};
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    await this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));
    if (root) {
      key = this.rootStack.push(routeState).key;
    } else {
      key = this.rootStack.getCurrentItem().push(routeState).key;
    }
    routeState.key = key;
    let nativeData: NativeData | undefined;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];
    if (!nativeCaller && notifyNativeRouter) {
      nativeData = await this.nativeRouter.execute('push', () => this.partialLocationStateToNativeData(routeState), key);
    }
    this._nativeData = nativeData;
    this.routeState = routeState;
    this._internalUrl = eluxLocationToEluxUrl({pathname: routeState.pagename, params: routeState.params});
    const cloneState = deepClone(routeState);
    if (root) {
      await reinitApp(this.getCurrentStore());
    } else {
      this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    }

    await this.dispatch('change', {routeState: cloneState, root});
  }

  replace(eluxUrlOrPayload: PayloadData<P, N> | string, root = false, nonblocking?: boolean, nativeCaller = false): void | Promise<void> {
    return this.addTask(this._replace.bind(this, eluxUrlOrPayload, root, nativeCaller), nonblocking);
  }

  private async _replace(eluxUrlOrPayload: PayloadData<P, N> | string, root: boolean, nativeCaller: boolean) {
    const location = await this.preAdditions(eluxUrlOrPayload);
    let key = '';
    const routeState: RouteState<P> = {...location, action: 'REPLACE', key};
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    await this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));
    if (root) {
      key = this.rootStack.replace(routeState).key;
    } else {
      key = this.rootStack.getCurrentItem().replace(routeState).key;
    }
    routeState.key = key;
    let nativeData: NativeData | undefined;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];
    if (!nativeCaller && notifyNativeRouter) {
      nativeData = await this.nativeRouter.execute('replace', () => this.partialLocationStateToNativeData(routeState), key);
    }
    this._nativeData = nativeData;
    this.routeState = routeState;
    this._internalUrl = eluxLocationToEluxUrl({pathname: routeState.pagename, params: routeState.params});
    const cloneState = deepClone(routeState);
    this.getCurrentStore().dispatch(routeChangeAction(cloneState));
    await this.dispatch('change', {routeState: cloneState, root});
  }

  back(n = 1, root = false, options?: {overflowRedirect?: string; payload?: any}, nonblocking?: boolean, nativeCaller = false): void | Promise<void> {
    return this.addTask(this._back.bind(this, n, root, options || {}, nativeCaller), nonblocking);
  }

  private async _back(n = 1, root: boolean, options: {overflowRedirect?: string; payload?: any}, nativeCaller: boolean) {
    if (n < 1) {
      return;
    }
    const {record, overflow, steps} = this.rootStack.testBack(n, root);
    if (overflow) {
      const url = options.overflowRedirect || routeConfig.indexUrl;
      env.setTimeout(() => this.relaunch(url, root), 0);
      return;
    }
    const key = record.key;
    const pagename = record.pagename;
    const params = deepMerge({}, record.params, options.payload);
    const routeState: RouteState<P> = {key, pagename, params, action: 'BACK'};
    //const prevRootState = this.getCurrentStore().getState();
    await this.getCurrentStore().dispatch(testRouteChangeAction(routeState));
    await this.getCurrentStore().dispatch(beforeRouteChangeAction(routeState));
    if (steps[0]) {
      root = true;
      this.rootStack.back(steps[0]);
    }
    if (steps[1]) {
      this.rootStack.getCurrentItem().back(steps[1]);
    }
    let nativeData: NativeData | undefined;
    const notifyNativeRouter = routeConfig.notifyNativeRouter[root ? 'root' : 'internal'];
    if (!nativeCaller && notifyNativeRouter) {
      nativeData = await this.nativeRouter.execute('back', () => this.partialLocationStateToNativeData(routeState), n, key);
    }
    this._nativeData = nativeData;
    this.routeState = routeState;
    this._internalUrl = eluxLocationToEluxUrl({pathname: routeState.pagename, params: routeState.params});
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
  addListener(name: 'change', callback: (data: {routeState: RouteState<P>; root: boolean}) => void | Promise<void>): () => void;
  getInternalUrl(): string;
  getNativeLocation(): NativeLocation;
  getNativeUrl(): string;
  getCurrentPages(): {pagename: string; store: IStore; page?: any}[];
  findRecordByKey(key: string): HistoryRecord | undefined;
  relaunch(eluxUrlOrPayload: PayloadData<P, N> | string, root?: boolean, nonblocking?: boolean): void | Promise<void>;
  push(eluxUrlOrPayload: PayloadData<P, N> | string, root?: boolean, nonblocking?: boolean): void | Promise<void>;
  replace(eluxUrlOrPayload: PayloadData<P, N> | string, root?: boolean, nonblocking?: boolean): void | Promise<void>;
  back(n?: number, root?: boolean, options?: {overflowRedirect?: string; payload?: any}, nonblocking?: boolean): void | Promise<void>;
  getHistoryLength(root?: boolean): number;
  destroy(): void;
  locationTransform: LocationTransform;
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

export type RouteModule = CommonModule & {locationTransform: LocationTransform};

const defaultNativeLocationMap: NativeLocationMap = {
  in(nativeLocation) {
    return nativeLocation;
  },
  out(nativeLocation) {
    return nativeLocation;
  },
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createRouteModule<N extends string, G extends PagenameMap>(
  moduleName: N,
  pagenameMap: G,
  nativeLocationMap: NativeLocationMap = defaultNativeLocationMap,
  notfoundPagename = '/404',
  paramsKey = '_'
) {
  const locationTransform = createLocationTransform(pagenameMap, nativeLocationMap, notfoundPagename, paramsKey);
  const routeModule = exportModule(moduleName, RouteModuleHandlers as IRouteModuleHandlersClass<RouteState>, {}, {} as {[k in keyof G]: any});
  return {...routeModule, locationTransform};
}
