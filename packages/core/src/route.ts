import env from './env';
import {
  ActionError,
  coreConfig,
  ErrorCodes,
  IRouter,
  IRouteRecord,
  Location,
  MetaData,
  RouteAction,
  RouteEvent,
  RouterInitOptions,
  RouteRuntime,
  RouteTarget,
  StoreState,
} from './basic';
import {deepClone, isPromise, UNListener} from './utils';
import {afterChangeAction, beforeChangeAction, errorAction, testChangeAction} from './actions';
import {PageStack, RouteRecord, WindowStack} from './history';
import {setLoading} from './module';
import {Store} from './store';

export interface RouteConfig {
  NotifyNativeRouter: {
    window: boolean;
    page: boolean;
  };
  QueryString: {
    parse(str: string): {[key: string]: any};
    stringify(query: {[key: string]: any}): string;
  };
  NativePathnameMapping: {
    in(nativePathname: string): string;
    out(internalPathname: string): string;
  };
}

/**
 * 原生路由Url转换为内部路由Url
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export function nativeUrlToUrl(nativeUrl: string): string {
  const [path = '', search = '', hash = ''] = nativeUrl.split(/[?#]/);
  const pathname = coreConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}

/**
 * 内部路由Url转换为原生路由Url
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export function urlToNativeUrl(eluxUrl: string): string {
  const [path = '', search = '', hash = ''] = eluxUrl.split(/[?#]/);
  const pathname = coreConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}

/**
 * Url转换为Location
 *
 * @public
 */
export function urlToLocation(url: string, state: any): Location {
  const [path = '', query = '', hash = ''] = url.split(/[?#]/);
  const arr = `?${query}`.match(/[?&]__c=([^&]*)/) || ['', ''];
  const classname = arr[1];
  let search = `?${query}`.replace(/[?&]__c=[^&]*/g, '').substr(1);
  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {parse} = coreConfig.QueryString;
  const searchQuery = parse(search);
  const hashQuery = parse(hash);
  if (classname) {
    search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
  }
  return {url: `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`, pathname, search, hash, classname, searchQuery, hashQuery, state};
}

/**
 * Location转换为Url
 *
 * @public
 */
export function locationToUrl({url, pathname, search, hash, classname, searchQuery, hashQuery}: Partial<Location>, defClassname?: string): string {
  if (url) {
    [pathname, search, hash] = url.split(/[?#]/);
  }
  pathname = '/' + (pathname || '').replace(/^\/|\/$/g, '');
  const {stringify} = coreConfig.QueryString;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';
  if (!/[?&]__c=/.test(`?${search}`) && defClassname && classname === undefined) {
    classname = defClassname;
  }
  if (typeof classname === 'string') {
    search = `?${search}`.replace(/[?&]__c=[^&]*/g, '').substr(1);
    if (classname) {
      search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
    }
  }
  url = `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
  return url;
}

/**
 * 内部路由Location转换为原生路由Location
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export function locationToNativeLocation(location: Location): Location {
  const pathname = coreConfig.NativePathnameMapping.out(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return {...location, pathname, url};
}

/**
 * 原生路由Location转换为内部路由Location
 *
 * @remarks
 * - 内部路由：框架内置路由系统，不依赖于运行平台的路由，实际使用的都是内部路由。
 *
 * - 原生路由：运行平台（如浏览器）的路由，内部路由可以关联为原生路由。
 *
 * @public
 */
export function nativeLocationToLocation(location: Location): Location {
  const pathname = coreConfig.NativePathnameMapping.in(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return {...location, pathname, url};
}

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
  public abstract exit(): void;
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

let clientDocumentHeadTimer = 0;

export class Router implements IRouter {
  private curTask?: RouteTask;
  private taskList: RouteTask[] = [];
  private windowStack!: WindowStack;
  private documentHead: string = '';
  action: RouteAction = 'init';
  routeKey: string = '';
  declare runtime: RouteRuntime<StoreState>;
  declare location: Location;
  declare initOptions: RouterInitOptions;
  protected listenerId = 0;
  protected readonly listenerMap: {[id: string]: (data: RouteEvent) => void | Promise<void>} = {};

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
    if (!MetaData.clientRouter) {
      MetaData.clientRouter = this;
    }
  }
  addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }
  dispatch(data: RouteEvent): void | Promise<void> {
    const listenerMap = this.listenerMap;
    const promiseResults: Promise<void>[] = [];
    Object.keys(listenerMap).forEach((id) => {
      const result = listenerMap[id](data);
      if (isPromise(result)) {
        promiseResults.push(result);
      }
    });
    if (promiseResults.length === 0) {
      return undefined;
    } else if (promiseResults.length === 1) {
      return promiseResults[0];
    } else {
      return Promise.all(promiseResults).then(() => undefined);
    }
  }

  // private addTask(execute: () => Promise<void>): void | Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     const task = () => setLoading(execute(), this.getActivePage().store).then(resolve, reject);
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
      const task: RouteTask = [() => setLoading(execute(), this.getActivePage().store), resolve, reject];
      if (this.curTask) {
        this.taskList.push(task);
      } else {
        this.curTask = task;
        task[0]().finally(this.onTaskComplete).then(task[1], task[2]);
      }
    });
  }

  getDocumentHead(): string {
    return this.documentHead;
  }
  setDocumentHead(html: string): void {
    this.documentHead = html;
    if (!env.isServer && !clientDocumentHeadTimer) {
      clientDocumentHeadTimer = env.setTimeout(() => {
        clientDocumentHeadTimer = 0;
        const arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];
        if (arr[1]) {
          coreConfig.SetPageTitle(arr[1]);
        }
      }, 0);
    }
  }
  private savePageTitle(): void {
    const arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];
    const title = arr[1] || '';
    this.windowStack.getCurrentItem().getCurrentItem().title = title;
  }

  nativeInitiated(): boolean {
    return !this.nativeRouter.routeKey;
  }

  getHistoryLength(target: RouteTarget): number {
    return target === 'window' ? this.windowStack.getLength() - 1 : this.windowStack.getCurrentItem().getLength() - 1;
  }

  getHistory(target: RouteTarget): IRouteRecord[] {
    return target === 'window' ? this.windowStack.getRecords().slice(1) : this.windowStack.getCurrentItem().getItems().slice(1);
  }

  findRecordByKey(recordKey: string): {record: IRouteRecord; overflow: boolean; index: [number, number]} {
    const {
      record: {key, location, title},
      overflow,
      index,
    } = this.windowStack.findRecordByKey(recordKey);
    return {overflow, index, record: {key, location, title}};
  }

  findRecordByStep(delta: number, rootOnly?: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]} {
    const {
      record: {key, location, title},
      overflow,
      index,
    } = this.windowStack.testBack(delta, !!rootOnly);
    return {overflow, index, record: {key, location, title}};
  }

  getActivePage(): {location: Location; store: Store} {
    return this.windowStack.getCurrentWindowPage();
  }

  getCurrentPages(): {location: Location; store: Store}[] {
    return this.windowStack.getCurrentPages();
  }

  private async mountStore(prevStore: Store, newStore: Store, historyStore?: Store): Promise<void> {
    const prevState = prevStore.getState();
    this.runtime = {
      timestamp: Date.now(),
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

  private redirectOnServer(url: string) {
    if (env.isServer) {
      const nativeUrl = urlToNativeUrl(url);
      const err: ActionError = {code: ErrorCodes.ROUTE_REDIRECT, message: 'Route change in server is not allowed.', detail: nativeUrl};
      throw err;
    }
  }

  public init(routerInitOptions: RouterInitOptions, prevState: StoreState): Promise<void> {
    this.init = () => Promise.resolve();
    this.initOptions = routerInitOptions;
    this.location = urlToLocation(nativeUrlToUrl(routerInitOptions.url), undefined);
    this.action = 'init';
    this.windowStack = new WindowStack(this.location, new Store(0, 0, this));
    this.routeKey = this.findRecordByStep(0).record.key;
    this.runtime = {timestamp: Date.now(), prevState, completed: false};
    const task: RouteTask = [this._init.bind(this), () => undefined, () => undefined];
    this.curTask = task;
    return task[0]().finally(this.onTaskComplete);
  }

  private async _init() {
    const {action, location, routeKey} = this;
    await this.nativeRouter.execute(action, location, routeKey);
    const store = this.getActivePage().store;
    try {
      await store.mount(coreConfig.StageModuleName, 'init');
      await store.dispatch(testChangeAction(this.location, this.action));
    } catch (err) {
      if (err.code === ErrorCodes.ROUTE_RETURN || err.code === ErrorCodes.ROUTE_REDIRECT) {
        this.taskList = [];
        throw err;
      }
      env.console.error(err);
    }
    this.runtime.completed = true;
    this.dispatch({location, action, prevStore: store, newStore: store, windowChanged: true});
  }

  computeUrl(partialLocation: Partial<Location>, action: RouteAction, target: RouteTarget): string {
    const curClassname = this.location.classname;
    let defClassname = curClassname;
    if (action === 'relaunch') {
      defClassname = target === 'window' ? '' : curClassname;
    }
    return locationToUrl(partialLocation, defClassname);
  }

  relaunch(partialLocation: Partial<Location>, target: RouteTarget = 'page', refresh: boolean = false, _nativeCaller = false): Promise<void> {
    return this.addTask(this._relaunch.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  private async _relaunch(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, _nativeCaller: boolean) {
    const action: RouteAction = 'relaunch';
    const url = this.computeUrl(partialLocation, action, target);
    this.redirectOnServer(url);
    const location = urlToLocation(url, partialLocation.state);
    const NotifyNativeRouter = coreConfig.NotifyNativeRouter[target];
    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }
    const prevStore = this.getActivePage().store;
    try {
      await prevStore.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!_nativeCaller) {
        throw err;
      }
    }
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.savePageTitle();
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone(refresh);
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
    await this.mountStore(prevStore, newStore);
    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }
    await this.dispatch({location, action, prevStore, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterChangeAction(location, action));
  }

  replace(partialLocation: Partial<Location>, target: RouteTarget = 'page', refresh: boolean = false, _nativeCaller = false): Promise<void> {
    return this.addTask(this._replace.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  private async _replace(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, _nativeCaller: boolean) {
    const action: RouteAction = 'replace';
    const url = this.computeUrl(partialLocation, action, target);
    this.redirectOnServer(url);
    const location = urlToLocation(url, partialLocation.state);
    const NotifyNativeRouter = coreConfig.NotifyNativeRouter[target];
    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }
    const prevStore = this.getActivePage().store;
    try {
      await prevStore.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!_nativeCaller) {
        throw err;
      }
    }
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.savePageTitle();
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone(refresh);
    const pageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, pageStack);
    this.routeKey = newRecord.key;
    if (target === 'window') {
      pageStack.relaunch(newRecord);
    } else {
      pageStack.replace(newRecord);
    }
    pageStack.replaceStore(newStore);
    await this.mountStore(prevStore, newStore);
    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }
    await this.dispatch({location, action, prevStore, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterChangeAction(location, action));
  }

  push(partialLocation: Partial<Location>, target: RouteTarget = 'page', refresh: boolean = false, _nativeCaller = false): Promise<void> {
    return this.addTask(this._push.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  private async _push(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, _nativeCaller: boolean) {
    const action: RouteAction = 'push';
    const url = this.computeUrl(partialLocation, action, target);
    this.redirectOnServer(url);
    const location = urlToLocation(url, partialLocation.state);
    const NotifyNativeRouter = coreConfig.NotifyNativeRouter[target];
    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location);
    }
    const prevStore = this.getActivePage().store;
    try {
      await prevStore.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!_nativeCaller) {
        throw err;
      }
    }
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.savePageTitle();
    this.location = location;
    this.action = action;
    const newStore = prevStore.clone(target === 'window' || refresh);
    const pageStack = this.windowStack.getCurrentItem();
    let newRecord: RouteRecord;
    if (target === 'window') {
      const newPageStack = new PageStack(this.windowStack, location, newStore);
      newRecord = newPageStack.getCurrentItem();
      this.routeKey = newRecord.key;
      this.windowStack.push(newPageStack);
      await this.mountStore(prevStore, newStore);
    } else {
      newRecord = new RouteRecord(location, pageStack);
      this.routeKey = newRecord.key;
      pageStack.push(newRecord);
      pageStack.replaceStore(newStore);
      await this.mountStore(prevStore, newStore);
    }
    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }
    await this.dispatch({location, action, prevStore, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterChangeAction(location, action));
  }

  back(
    stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean),
    target: RouteTarget = 'page',
    refresh: boolean = false,
    overflowRedirect: string = '',
    _nativeCaller = false
  ): Promise<void> {
    if (typeof stepOrKeyOrCallback === 'string') {
      stepOrKeyOrCallback = stepOrKeyOrCallback.trim();
    }
    if (stepOrKeyOrCallback === '') {
      this.nativeRouter.exit();
      return Promise.resolve();
    }
    if (!stepOrKeyOrCallback) {
      return this.replace(this.location, 'page', refresh);
    }
    return this.addTask((this._back as any).bind(this, stepOrKeyOrCallback, target, refresh, overflowRedirect, _nativeCaller));
  }

  private async _back(
    stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean),
    target: RouteTarget,
    refresh: boolean,
    overflowRedirect: string,
    _nativeCaller: boolean
  ) {
    const action = 'back';
    this.redirectOnServer(overflowRedirect || '/');
    let stepOrKey: number | string = '';
    if (typeof stepOrKeyOrCallback === 'function') {
      const items = this.getHistory(target);
      const i = items.findIndex(stepOrKeyOrCallback);
      if (i > -1) {
        stepOrKey = items[i].key;
      }
    } else {
      stepOrKey = stepOrKeyOrCallback;
    }
    if (!stepOrKey) {
      return this.backError(stepOrKey, overflowRedirect);
    }
    const {record, overflow, index} = this.windowStack.testBack(stepOrKey, target === 'window');
    if (overflow) {
      return this.backError(stepOrKey, overflowRedirect);
    }
    if (!index[0] && !index[1]) {
      return;
    }
    const prevStore = this.getActivePage().store;
    const location = record.location;
    const title = record.title;
    const NotifyNativeRouter = (index[0] && coreConfig.NotifyNativeRouter.window) || (index[1] && coreConfig.NotifyNativeRouter.page);

    if (!_nativeCaller && NotifyNativeRouter) {
      this.nativeRouter.testExecute(action, location, index);
    }
    try {
      await prevStore.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!_nativeCaller) {
        throw err;
      }
    }
    await prevStore.dispatch(beforeChangeAction(location, action));
    this.savePageTitle();
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
      newStore = prevStore.clone(refresh);
      pageStack.replaceStore(newStore);
    }
    await this.mountStore(prevStore, newStore);
    if (!_nativeCaller && NotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, record.key, index);
    }
    this.setDocumentHead(`<title>${title}</title>`);
    await this.dispatch({location, action, prevStore, newStore, windowChanged: !!index[0]});
    newStore.dispatch(afterChangeAction(location, action));
  }

  private backError(stepOrKey: number | string, redirect: string) {
    const prevStore = this.getActivePage().store;
    const backOverflow: ActionError = {
      code: ErrorCodes.ROUTE_BACK_OVERFLOW,
      message: 'Overflowed on route backward.',
      detail: {stepOrKey, redirect},
    };
    return prevStore.dispatch(errorAction(backOverflow));
  }
}
