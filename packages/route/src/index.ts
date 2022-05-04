import {
  ActionError,
  coreConfig,
  CoreRouter,
  deepClone,
  env,
  IRouteRecord,
  Location,
  RouteAction,
  RouterInitOptions,
  RouteTarget,
  setLoading,
  setProcessedError,
  Store,
  StoreState,
} from '@elux/core';

import {
  afterChangeAction,
  beforeChangeAction,
  ErrorCodes,
  locationToNativeLocation,
  locationToUrl,
  nativeUrlToUrl,
  routeConfig,
  testChangeAction,
  urlToLocation,
  urlToNativeUrl,
} from './basic';
import {PageStack, RouteRecord, WindowStack} from './history';

export {
  ErrorCodes,
  locationToNativeLocation,
  locationToUrl,
  nativeLocationToLocation,
  nativeUrlToUrl,
  routeConfig,
  setRouteConfig,
  urlToLocation,
  urlToNativeUrl,
} from './basic';

export abstract class BaseNativeRouter {
  public router: Router;
  public routeKey: string = '';

  protected curTask?: {resolve: () => void; timeout: number};

  constructor() {
    this.router = new Router(this);
  }

  protected abstract push(nativeLocation: Location, key: string): boolean;
  protected abstract replace(nativeLocation: Location, key: string): boolean;
  protected abstract relaunch(nativeLocation: Location, key: string): boolean;
  protected abstract back(nativeLocation: Location, key: string, index: [number, number]): boolean;

  protected onSuccess(): void {
    if (this.curTask) {
      const {resolve, timeout} = this.curTask;
      this.curTask = undefined;
      env.clearTimeout(timeout);
      this.routeKey = '';
      resolve();
    }
  }
  public testExecute(method: RouteAction, location: Location, backIndex?: number[]): void {
    const testMethod = '_' + method;
    this[testMethod] && this[testMethod](locationToNativeLocation(location), backIndex);
  }
  public execute(method: RouteAction, location: Location, key: string, backIndex?: number[]): void | Promise<void> {
    const nativeLocation = locationToNativeLocation(location);
    const result: boolean = this[method as string](nativeLocation, key, backIndex);
    if (result) {
      this.routeKey = key;
      return new Promise((resolve) => {
        const timeout = env.setTimeout(() => {
          env.console.error('Native router timeout: ' + nativeLocation.url);
          this.onSuccess();
        }, 2000);
        this.curTask = {resolve, timeout};
      });
    }
  }
}

type RouteTask = [() => Promise<void>, (value: void) => void, (reason?: any) => void];

export class Router extends CoreRouter {
  private curTask?: RouteTask;
  private taskList: RouteTask[] = [];
  private windowStack!: WindowStack;

  private onTaskComplete = () => {
    const task = this.taskList.shift();
    if (task) {
      this.curTask = task;
      const onTaskComplete = this.onTaskComplete;
      env.setTimeout(() => task[0]().finally(onTaskComplete).then(task[1], task[2]), 0);
    } else {
      this.curTask = undefined;
    }
  };

  constructor(private nativeRouter: BaseNativeRouter) {
    super();
  }

  // private addTask(execute: () => Promise<void>): void | Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const task = () => setLoading(execute(), this.getCurrentPage().store).then(resolve, reject);
  //     if (this.curTask) {
  //       this.taskList.push(task);
  //     } else {
  //       this.curTask = task;
  //       task().finally(this.onTaskComplete);
  //     }
  //   });
  // }

  private addTask(execute: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      const task: RouteTask = [() => setLoading(execute(), this.getCurrentPage().store), resolve, reject];
      if (this.curTask) {
        this.taskList.push(task);
      } else {
        this.curTask = task;
        task[0]().finally(this.onTaskComplete).then(task[1], task[2]);
      }
    });
  }

  nativeInitiated(): boolean {
    return !this.nativeRouter.routeKey;
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

  findRecordByStep(delta: number, rootOnly?: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]} {
    const {
      record: {key, location},
      overflow,
      index,
    } = this.windowStack.testBack(delta, !!rootOnly);
    return {overflow, index, record: {key, location}};
  }

  getCurrentPage(): {url: string; store: Store} {
    return this.windowStack.getCurrentWindowPage();
  }

  getWindowPages(): {url: string; store: Store}[] {
    return this.windowStack.getWindowPages();
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
      this.runtime.completed = true;
      return;
    }
    try {
      await newStore.mount(coreConfig.StageModuleName, 'route');
    } catch (err) {
      env.console.error(err);
    }
    this.runtime.completed = true;
  }

  private redirectOnServer(urlOrLocation: Partial<Location>) {
    if (env.isServer) {
      const url = urlOrLocation.url || locationToUrl(urlOrLocation);
      const nativeUrl = urlToNativeUrl(url);
      const err: ActionError = {code: ErrorCodes.ROUTE_REDIRECT, message: 'Route change in server is not allowed.', detail: nativeUrl};
      throw err;
    }
  }

  public init(routerInitOptions: RouterInitOptions, prevState: StoreState): Promise<void> {
    this.init = () => Promise.resolve();
    this.initOptions = routerInitOptions;
    this.location = urlToLocation(nativeUrlToUrl(routerInitOptions.url));
    this.windowStack = new WindowStack(this.location, new Store(0, this));
    this.routeKey = this.findRecordByStep(0).record.key;
    this.runtime = {timestamp: Date.now(), payload: null, prevState, completed: false};
    const task: RouteTask = [this._init.bind(this), () => undefined, () => undefined];
    this.curTask = task;
    return task[0]().finally(this.onTaskComplete);
  }

  private async _init() {
    const {action, location, routeKey} = this;
    await this.nativeRouter.execute(action, location, routeKey);
    const store = this.getCurrentPage().store;
    try {
      await store.mount(coreConfig.StageModuleName, 'init');
      await store.dispatch(testChangeAction(this.location, this.action));
    } catch (err) {
      if (err.code === ErrorCodes.ROUTE_REDIRECT) {
        this.taskList = [];
        throw err;
      }
      env.console.error(err);
    }
    this.runtime.completed = true;
    this.dispatch({location, action, prevStore: store, newStore: store, windowChanged: true});
  }

  relaunch(urlOrLocation: Partial<Location>, target: RouteTarget = 'page', payload: any = null, _nativeCaller = false): Promise<void> {
    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._relaunch.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  private async _relaunch(urlOrLocation: Partial<Location>, target: RouteTarget, payload: any, _nativeCaller: boolean) {
    const action = 'relaunch';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];
    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);
    this.routeKey = newRecord.key;
    if (target === 'window') {
      pageStack.relaunch(newRecord);
      this.windowStack.relaunch(pageStack);
    } else {
      pageStack.relaunch(newRecord);
    }
    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);
    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }
    await this.dispatch({location, action, prevStore, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterChangeAction(location, action));
  }

  replace(urlOrLocation: Partial<Location>, target: RouteTarget = 'page', payload: any = null, _nativeCaller = false): Promise<void> {
    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._replace.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  private async _replace(urlOrLocation: Partial<Location>, target: RouteTarget, payload: any, _nativeCaller: boolean) {
    const action = 'replace';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];
    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone();
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);
    this.routeKey = newRecord.key;
    if (target === 'window') {
      pageStack.relaunch(newRecord);
    } else {
      pageStack.replace(newRecord);
    }
    pageStack.replaceStore(newStore);
    await this.mountStore(payload, prevStore, newStore);
    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }
    await this.dispatch({location, action, prevStore, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterChangeAction(location, action));
  }

  push(urlOrLocation: Partial<Location>, target: RouteTarget = 'page', payload: any = null, _nativeCaller = false): Promise<void> {
    this.redirectOnServer(urlOrLocation);
    return this.addTask(this._push.bind(this, urlOrLocation, target, payload, _nativeCaller));
  }

  private async _push(urlOrLocation: Partial<Location>, target: RouteTarget, payload: any, _nativeCaller: boolean) {
    const action = 'push';
    const location = urlToLocation(urlOrLocation.url || locationToUrl(urlOrLocation));
    const NotifyNativeRouter = routeConfig.NotifyNativeRouter[target];
    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }
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
      this.routeKey = newRecord.key;
      this.windowStack.push(newPageStack);
      await this.mountStore(payload, prevStore, newStore);
    } else {
      newRecord = new RouteRecord(location, pageStack);
      this.routeKey = newRecord.key;
      pageStack.push(newRecord);
      pageStack.replaceStore(newStore);
      await this.mountStore(payload, prevStore, newStore);
    }
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
  ): Promise<void> {
    if (!stepOrKey) {
      return Promise.resolve();
    }
    this.redirectOnServer({url: overflowRedirect || routeConfig.HomeUrl});
    return this.addTask(this._back.bind(this, stepOrKey, target, payload, overflowRedirect, _nativeCaller));
  }

  private async _back(stepOrKey: number | string, target: RouteTarget, payload: any, overflowRedirect: string, _nativeCaller: boolean) {
    const action = 'back';
    const {record, overflow, index} = this.windowStack.testBack(stepOrKey, target === 'window');
    if (overflow) {
      const url = overflowRedirect || routeConfig.HomeUrl;
      this.relaunch({url}, 'window');
      const err: ActionError = {code: ErrorCodes.ROUTE_BACK_OVERFLOW, message: 'Overflowed on route backward.', detail: stepOrKey};
      throw setProcessedError(err, true);
    }
    if (!index[0] && !index[1]) {
      throw 'Route backward invalid.';
    }
    const location = record.location;
    const NotifyNativeRouter: boolean[] = [];
    if (index[0]) {
      NotifyNativeRouter[0] = routeConfig.NotifyNativeRouter.window;
    }
    if (index[1]) {
      NotifyNativeRouter[1] = routeConfig.NotifyNativeRouter.page;
    }
    if (!_nativeCaller && NotifyNativeRouter.length) {
      this.nativeRouter.testExecute(action, location, index);
    }
    const prevStore = this.getCurrentPage().store;
    await prevStore.dispatch(testChangeAction(location, action));
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.location = location;
    this.action = action;
    this.routeKey = record.key;
    if (index[0]) {
      this.windowStack.back(index[0]);
    }
    if (index[1]) {
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
