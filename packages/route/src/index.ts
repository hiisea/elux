import {
  Location,
  RouteTarget,
  IRouteRecord,
  CoreRouter,
  Store,
  StoreState,
  ErrorCodes,
  deepClone,
  coreConfig,
  setLoading,
  errorAction,
  env,
} from '@elux/core';
import {
  urlToLocation,
  testChangeAction,
  beforeChangeAction,
  afterChangeAction,
  routeConfig,
  locationToUrl,
  toNativeLocation,
  toEluxLocation,
} from './basic';
import {WindowStack, PageStack, RouteRecord} from './history';

export {setRouteConfig, routeConfig, locationToUrl, urlToLocation, toNativeLocation, toEluxLocation} from './basic';

export abstract class BaseNativeRouter {
  protected curTask?: {resolve: () => void; reject: () => void};

  constructor(public readonly nativeLocation: Partial<Location>, public readonly nativeData: unknown) {}

  // 只有当native不处理时返回false，返回true将依赖onSuccess和onError来关闭task
  protected abstract push(nativeLocation: Location, key: string): boolean;

  protected abstract replace(nativeLocation: Location, key: string): boolean;

  protected abstract relaunch(nativeLocation: Location, key: string): boolean;

  protected abstract back(nativeLocation: Location, key: string, index: [number, number]): boolean;

  protected onSuccess(key: string): void {
    this.curTask?.resolve();
    // return key !== this.eluxRouter.routeState.key;
  }
  protected onError(key: string): void {
    this.curTask?.reject();
    //return key !== this.eluxRouter.routeState.key;
  }
  public execute(method: 'relaunch' | 'push' | 'replace' | 'back', location: Location, key: string, backIndex?: number[]): void | Promise<void> {
    const result: boolean = this[method as string](toNativeLocation(location), key, backIndex);
    if (result) {
      return new Promise((resolve, reject) => {
        this.curTask = {resolve, reject};
      });
    }
  }
}

export class Router extends CoreRouter {
  private curTask?: () => Promise<void>;
  private taskList: Array<() => Promise<void>> = [];
  private readonly windowStack: WindowStack;

  private onTaskComplete = () => {
    const task = this.taskList.shift();
    if (task) {
      this.curTask = task;
      const onTaskComplete = this.onTaskComplete;
      env.setTimeout(() => task().finally(onTaskComplete), 0);
    } else {
      this.curTask = undefined;
    }
  };

  constructor(private nativeRouter: BaseNativeRouter) {
    super(
      toEluxLocation(urlToLocation(nativeRouter.nativeLocation.url || locationToUrl(nativeRouter.nativeLocation))),
      'relaunch',
      nativeRouter.nativeData
    );
    this.windowStack = new WindowStack(this.location, new Store(0, this));
  }

  private addTask(execute: () => Promise<void>): void | Promise<void> {
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

  getHistoryLength(target: RouteTarget = 'page'): number {
    return target === 'window' ? this.windowStack.getLength() : this.windowStack.getCurrentItem().getLength();
  }

  findRecordByKey(recordKey: string): {record: IRouteRecord; overflow: boolean; index: [number, number]} {
    const {
      record: {key, location},
      overflow,
      index,
    } = this.windowStack.findRecordByKey(recordKey);
    return {overflow, index, record: {key, location}};
  }

  findRecordByStep(delta: number, rootOnly: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]} {
    const {
      record: {key, location},
      overflow,
      index,
    } = this.windowStack.testBack(delta, rootOnly);
    return {overflow, index, record: {key, location}};
  }

  getCurrentPage(): {url: string; store: Store} {
    return this.windowStack.getCurrentWindowPage();
  }

  getWindowPages(): {url: string; store: Store}[] {
    return this.windowStack.getWindowPages();
  }

  public async init(prevState: StoreState): Promise<void> {
    this.runtime = {timestamp: Date.now(), payload: null, prevState, completed: false};
    const store = this.getCurrentPage().store;
    try {
      await store.mount(coreConfig.StageModuleName, true);
    } catch (error) {
      store.dispatch(errorAction({code: ErrorCodes.INIT_ERROR, message: error.message || error.toString()}));
    }
    this.runtime.completed = true;
  }

  private async mountStore(payload: unknown, prevStore: Store, newStore: Store, historyStore?: Store): Promise<void> {
    const prevState = prevStore.getState();
    this.runtime = {
      timestamp: Date.now(),
      payload,
      prevState: coreConfig.MutableData ? deepClone(prevState) : prevState,
      completed: false,
    };
    if (newStore === historyStore) {
      this.runtime.completed = false;
      return;
    }
    try {
      await newStore.mount(coreConfig.StageModuleName, true);
    } catch (error) {
      newStore.dispatch(errorAction({code: ErrorCodes.INIT_ERROR, message: error.message || error.toString()}));
    }
    this.runtime.completed = false;
  }

  relaunch(urlOrLocation: Partial<Location>, target: RouteTarget = 'page', payload: any = null, _nativeCaller = false): void | Promise<void> {
    return this.addTask(this._relaunch.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  private async _relaunch(urlOrLocation: Partial<Location>, target: RouteTarget, payload: any, _nativeCaller: boolean) {
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
    await this.dispatch({location, action, prevStore, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterChangeAction(location, action));
  }

  replace(urlOrLocation: Partial<Location>, target: RouteTarget = 'page', payload: any = null, _nativeCaller = false): void | Promise<void> {
    return this.addTask(this._replace.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  private async _replace(urlOrLocation: Partial<Location>, target: RouteTarget, payload: any, _nativeCaller: boolean) {
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
    await this.dispatch({location, action, prevStore, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterChangeAction(location, action));
  }

  push(urlOrLocation: Partial<Location>, target: RouteTarget = 'page', payload: any = null, _nativeCaller = false): void | Promise<void> {
    return this.addTask(this._push.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  private async _push(urlOrLocation: Partial<Location>, target: RouteTarget, payload: any, _nativeCaller: boolean) {
    const action = 'push';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    let newRecord: RouteRecord;
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
    await this.dispatch({location, action, prevStore, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterChangeAction(location, action));
  }

  back(
    stepOrKey: number | string = 1,
    target: RouteTarget = 'page',
    payload: any = null,
    overflowRedirect: string = '',
    _nativeCaller = false
  ): void | Promise<void> {
    if (!stepOrKey) {
      return;
    }
    return this.addTask(this._back.bind(this, stepOrKey, target, payload, overflowRedirect, _nativeCaller));
  }

  private async _back(stepOrKey: number | string, target: RouteTarget, payload: any, overflowRedirect: string, _nativeCaller: boolean) {
    const action = 'back';
    const {record, overflow, index} = this.windowStack.testBack(stepOrKey, target === 'window');
    if (overflow) {
      const url = overflowRedirect || routeConfig.HomeUrl;
      this.relaunch({url}, 'window');
      throw {code: ErrorCodes.ROUTE_BACK_OVERFLOW, message: 'Overflowed on route backward.'};
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
    const NotifyNativeRouter: boolean[] = [];
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
    //无有效历史快照
    if (index[1] !== 0) {
      newStore = prevStore.clone();
      pageStack.replaceStore(newStore);
    }
    await this.mountStore(payload, prevStore, newStore);
    if (!_nativeCaller && NotifyNativeRouter.length) {
      await this.nativeRouter.execute(action, location, record.key, index);
    }
    await this.dispatch({location, action, prevStore, newStore, windowChanged: !!index[0]});
    newStore.dispatch(afterChangeAction(location, action));
  }
}
