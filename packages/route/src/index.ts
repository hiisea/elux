import {isPromise, getModuleList} from '@elux/core';

import {routeConfig, setRouteConfig, EluxLocation} from './basic';
import {History, uriToLocation} from './history';
import {testRouteChangeAction, routeChangeAction} from './module';
import {
  assignDefaultData,
  dataIsNativeLocation,
  eluxLocationToEluxUrl,
  eluxLocationToNativeUrl,
  nativeUrlToEluxLocation,
  nativeLocationToEluxLocation,
  nativeLocationToNativeUrl,
  urlToEluxLocation,
  payloadToEluxLocation,
} from './transform';
import type {LocationTransform, NativeLocation} from './transform';
import type {RootParams, Location, RouteState, PayloadLocation} from './basic';

export {setRouteConfig, routeConfig} from './basic';
export {createLocationTransform, nativeUrlToNativeLocation} from './transform';
export {routeMiddleware, createRouteModule, RouteActionTypes, ModuleWithRouteHandlers} from './module';
export type {RouteModule} from './module';
export type {PagenameMap, LocationTransform, NativeLocation} from './transform';
export type {RootParams, Location, RouteState, HistoryAction, DeepPartial, PayloadLocation} from './basic';

interface Store {
  dispatch(action: {type: string}): any;
}

export type NativeData = {nativeLocation: NativeLocation; nativeUrl: string};

interface RouterTask {
  method: string;
}
interface NativeRouterTask {
  resolve: (nativeData: NativeData | undefined) => void;
  reject: () => void;
  nativeData: undefined | NativeData;
}
export abstract class BaseNativeRouter {
  protected curTask?: NativeRouterTask;

  protected taskList: RouterTask[] = [];

  protected router: BaseRouter<any, string> = null as any;

  // 只有当native不处理时返回void，否则必须返回NativeData，返回void会导致不依赖onChange来关闭task

  protected abstract push(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;

  protected abstract replace(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;

  protected abstract relaunch(getNativeData: () => NativeData, key: string): void | NativeData | Promise<NativeData>;

  protected abstract back(getNativeData: () => NativeData, n: number, key: string): void | NativeData | Promise<NativeData>;

  public abstract toOutside(url: string): void;

  abstract destroy(): void;

  protected onChange(key: string): boolean {
    if (this.curTask) {
      this.curTask.resolve(this.curTask.nativeData);
      this.curTask = undefined;
      return false;
    }
    return key !== this.router.getCurKey();
  }

  setRouter(router: BaseRouter<any, string>) {
    this.router = router;
  }

  execute(method: 'relaunch' | 'push' | 'replace' | 'back', getNativeData: () => NativeData, ...args: any[]): Promise<NativeData | undefined> {
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

export abstract class BaseRouter<P extends RootParams, N extends string> implements IBaseRouter<P, N> {
  private _tid = 0;

  private curTask?: () => Promise<void>;

  private taskList: Array<() => Promise<void>> = [];

  private _nativeData: {nativeLocation: NativeLocation; nativeUrl: string} | undefined;

  private routeState!: RouteState<P>;

  private eluxUrl!: string;

  protected store!: Store;

  public history!: History;

  private _lid: number = 0;

  protected readonly listenerMap: {[id: string]: (data: RouteState<P>) => void | Promise<void>} = {};

  public initedPromise: Promise<RouteState<P>>;

  // input
  constructor(
    nativeLocationOrNativeUrl: NativeLocation | string,
    public nativeRouter: BaseNativeRouter,
    protected locationTransform: LocationTransform
  ) {
    nativeRouter.setRouter(this);
    const eluxLocation =
      typeof nativeLocationOrNativeUrl === 'string'
        ? nativeUrlToEluxLocation(nativeLocationOrNativeUrl, locationTransform)
        : nativeLocationToEluxLocation(nativeLocationOrNativeUrl, locationTransform);
    const callback = (location: Location<P>) => {
      const key = this._createKey();
      const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
      this.routeState = routeState;
      this.eluxUrl = eluxLocationToEluxUrl(routeState);
      if (!routeConfig.indexUrl) {
        setRouteConfig({indexUrl: this.eluxUrl});
      }
      this.history = new History({location, key});
      return routeState;
    };
    const locationOrPromise = this.eluxLocationToLocation(eluxLocation);
    if (isPromise(locationOrPromise)) {
      this.initedPromise = locationOrPromise.then(callback);
    } else {
      const routeState = callback(locationOrPromise);
      this.initedPromise = Promise.resolve(routeState);
    }
  }

  addListener(callback: (data: RouteState<P>) => void | Promise<void>) {
    this._lid++;
    const id = `${this._lid}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  protected dispatch(data: RouteState<P>) {
    const listenerMap = this.listenerMap;
    const arr = Object.keys(listenerMap).map((id) => listenerMap[id](data));
    return Promise.all(arr);
  }

  getRouteState(): RouteState<P> {
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
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {nativeLocation, nativeUrl};
    }
    return this._nativeData.nativeLocation;
  }

  getNativeUrl() {
    if (!this._nativeData) {
      const nativeLocation = this.locationTransform.out(this.routeState);
      const nativeUrl = nativeLocationToNativeUrl(nativeLocation);
      this._nativeData = {nativeLocation, nativeUrl};
    }
    return this._nativeData.nativeUrl;
  }

  setStore(_store: Store) {
    this.store = _store;
  }

  getCurKey(): string {
    return this.routeState.key;
  }

  findHistoryIndexByKey(key: string) {
    return this.history.findIndex(key);
  }

  eluxLocationToNativeUrl(location: EluxLocation): string {
    return eluxLocationToNativeUrl(location, this.locationTransform);
  }

  urlToEluxLocation(url: string): EluxLocation {
    return urlToEluxLocation(url, this.locationTransform);
  }

  urlToLocation(url: string): Location<P> | Promise<Location<P>> {
    const eluxLocation = urlToEluxLocation(url, this.locationTransform);
    return this.eluxLocationToLocation(eluxLocation);
  }

  private _createKey() {
    this._tid++;
    return `${this._tid}`;
  }

  private eluxLocationToLocation(eluxLocation: EluxLocation): Location<P> | Promise<Location<P>> {
    const {pagename} = eluxLocation;
    const params: any = eluxLocation.params || {};
    if (routeConfig.defaultParams) {
      return {pagename, params: assignDefaultData(params) as P};
    }
    return getModuleList(Object.keys(params)).then(() => {
      return {pagename, params: assignDefaultData(params) as P};
    });
  }

  private preAdditions(data: PayloadLocation<P, N> | NativeLocation | string): Location<P> | Promise<Location<P>> | null {
    let eluxLocation: EluxLocation;
    if (typeof data === 'string') {
      if (/^[\w:]*\/\//.test(data)) {
        this.nativeRouter.toOutside(data);
        return null;
      }
      eluxLocation = urlToEluxLocation(data, this.locationTransform);
    } else if (dataIsNativeLocation(data)) {
      eluxLocation = nativeLocationToEluxLocation(data, this.locationTransform);
    } else {
      eluxLocation = this.locationTransform.in(payloadToEluxLocation(data, this.routeState));
    }
    return this.eluxLocationToLocation(eluxLocation);
  }

  relaunch(
    data: PayloadLocation<P, N> | NativeLocation | string,
    internal: boolean = false,
    disableNative: boolean = routeConfig.disableNativeRoute
  ) {
    this.addTask(this._relaunch.bind(this, data, internal, disableNative));
  }

  private async _relaunch(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean, disableNative: boolean) {
    const preData = await this.preAdditions(data);
    if (!preData) {
      return;
    }
    const location: Location<P> = preData;
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'RELAUNCH', key};
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData: NativeData | undefined;
    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute(
        'relaunch',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        key
      );
    }
    this._nativeData = nativeData;
    this.routeState = routeState;
    this.eluxUrl = eluxLocationToEluxUrl(routeState);
    this.store.dispatch(routeChangeAction(routeState));
    if (internal) {
      this.history.getCurrentInternalHistory()!.relaunch(location, key);
    } else {
      this.history.relaunch(location, key);
    }
  }

  push(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean = false, disableNative: boolean = routeConfig.disableNativeRoute) {
    this.addTask(this._push.bind(this, data, internal, disableNative));
  }

  private async _push(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean, disableNative: boolean) {
    const preData = await this.preAdditions(data);
    if (!preData) {
      return;
    }
    const location: Location<P> = preData;
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'PUSH', key};
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData: NativeData | void;
    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute(
        'push',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        key
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.eluxUrl = eluxLocationToEluxUrl(routeState);
    if (internal) {
      this.history.getCurrentInternalHistory()!.push(location, key);
    } else {
      this.history.push(location, key);
    }
    this.store.dispatch(routeChangeAction(routeState));
  }

  replace(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean = false, disableNative: boolean = routeConfig.disableNativeRoute) {
    this.addTask(this._replace.bind(this, data, internal, disableNative));
  }

  private async _replace(data: PayloadLocation<P, N> | NativeLocation | string, internal: boolean, disableNative: boolean) {
    const preData = await this.preAdditions(data);
    if (!preData) {
      return;
    }
    const location: Location<P> = preData;
    const key = this._createKey();
    const routeState: RouteState<P> = {...location, action: 'REPLACE', key};
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData: NativeData | void;
    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute(
        'replace',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        key
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.eluxUrl = eluxLocationToEluxUrl(routeState);
    if (internal) {
      this.history.getCurrentInternalHistory()!.replace(location, key);
    } else {
      this.history.replace(location, key);
    }
    this.store.dispatch(routeChangeAction(routeState));
  }

  back(n: number = 1, indexUrl: string = 'index', internal: boolean = false, disableNative: boolean = routeConfig.disableNativeRoute) {
    this.addTask(this._back.bind(this, n, indexUrl === 'index' ? routeConfig.indexUrl : indexUrl, internal, disableNative));
  }

  private async _back(n: number = 1, indexUrl: string, internal: boolean, disableNative: boolean) {
    const stack = internal ? this.history.getCurrentInternalHistory()!.getRecord(n - 1) : this.history.getRecord(n - 1);
    if (!stack) {
      if (indexUrl) {
        return this._relaunch(indexUrl || routeConfig.indexUrl, internal, disableNative);
      }
      throw {code: '1', message: 'history not found'};
    }
    const uri = stack.uri;
    const {key, location} = uriToLocation<P>(uri);
    const routeState: RouteState<P> = {...location, action: 'BACK', key};
    await this.store.dispatch(testRouteChangeAction(routeState));
    await this.dispatch(routeState);
    let nativeData: NativeData | void;
    if (!disableNative && !internal) {
      nativeData = await this.nativeRouter.execute(
        'back',
        () => {
          const nativeLocation = this.locationTransform.out(routeState);
          const nativeUrl = nativeLocationToNativeUrl(nativeLocation);
          return {nativeLocation, nativeUrl};
        },
        n,
        key
      );
    }
    this._nativeData = nativeData || undefined;
    this.routeState = routeState;
    this.eluxUrl = eluxLocationToEluxUrl(routeState);
    if (internal) {
      this.history.getCurrentInternalHistory()!.back(n);
    } else {
      this.history.back(n);
    }
    this.store.dispatch(routeChangeAction(routeState));
    return undefined;
  }

  private taskComplete() {
    const task = this.taskList.shift();
    if (task) {
      this.executeTask(task);
    } else {
      this.curTask = undefined;
    }
  }

  private executeTask(task: () => Promise<void>) {
    this.curTask = task;
    task().finally(this.taskComplete.bind(this));
  }

  private addTask(task: () => Promise<any>) {
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

export interface IBaseRouter<P extends RootParams, N extends string> {
  history: History;
  nativeRouter: BaseNativeRouter;
  addListener(callback: (data: RouteState<P>) => void | Promise<void>): void;
  getRouteState(): RouteState<P>;
  getPagename(): string;
  getParams(): Partial<P>;
  getEluxUrl(): string;
  getNativeLocation(): NativeLocation;
  getNativeUrl(): string;
  setStore(_store: Store): void;
  getCurKey(): string;
  findHistoryIndexByKey(key: string): number;
  relaunch(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
  push(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
  replace(data: PayloadLocation<P, N> | NativeLocation | string, internal?: boolean, disableNative?: boolean): void;
  back(n?: number, indexUrl?: string, internal?: boolean, disableNative?: boolean): void;
  destroy(): void;
  eluxLocationToNativeUrl(location: EluxLocation): string;
  urlToEluxLocation(url: string): EluxLocation;
  // nativeUrlToNativeLocation(url: string): NativeLocation;
  // nativeLocationToEluxLocation(nativeLocation: NativeLocation): EluxLocation;
  // nativeUrlToPartialLocation(nativeUrl: string): PartialLocation<P>;
  // nativeLocationToNativeUrl(nativeLocation: NativeLocation): string;
  // urlToPartialLocation(url: string): PartialLocation<P>;

  // partialLocationToEluxUrl(location: PartialLocation<P>): string;
  // payloadToPartial(payload: PayloadLocation<P, N>): PartialLocation<P>;
}
