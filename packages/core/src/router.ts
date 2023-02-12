import env from './env';
import {isPromise, UNListener} from './utils';
import {afterRouteChangeAction, beforeRouteChangeAction, errorAction, testRouteChangeAction} from './action';
import {
  ActionError,
  ANativeRouter,
  ARouter,
  AStore,
  ErrorCodes,
  IPageStack,
  IRecord,
  IRouteRecord,
  IWindowStack,
  Location,
  RouteAction,
  RouteEvent,
  RouteRecord,
  RouteTarget,
  StoreState,
} from './basic';
import {Store} from './store';

export class HistoryStack<T extends IRecord> {
  protected currentRecord: T = undefined as any;
  protected records: T[] = [];

  constructor(protected limit: number = 10) {}

  protected init(record: T): void {
    this.records = [record];
    this.currentRecord = record;
    record.active();
  }
  protected onChanged(): void {
    if (this.currentRecord !== this.records[0]) {
      this.currentRecord.inactive();
      this.currentRecord = this.records[0];
      this.currentRecord.active();
    }
  }
  getCurrentItem(): T {
    return this.currentRecord;
  }
  getEarliestItem(): T {
    return this.records[this.records.length - 1]!;
  }
  getItemAt(n: number): T | undefined {
    return this.records[n];
  }
  getItems(): T[] {
    return [...this.records];
  }
  getLength(): number {
    return this.records.length;
  }
  // getRecordAt(n: number): T | undefined {
  //   if (n < 0) {
  //     return this.records[this.records.length + n];
  //   } else {
  //     return this.records[n];
  //   }
  // }
  push(item: T): void {
    const records = this.records;
    records.unshift(item);
    if (records.length > this.limit) {
      const delItem = records.pop()!;
      delItem !== item && delItem.destroy();
    }
    this.onChanged();
  }
  replace(item: T): void {
    const records = this.records;
    const delItem = records[0];
    records[0] = item;
    delItem !== item && delItem.destroy();
    this.onChanged();
  }
  relaunch(item: T): void {
    const delList = this.records;
    this.records = [item];
    this.currentRecord = item;
    delList.forEach((delItem) => {
      delItem !== item && delItem.destroy();
    });
    this.onChanged();
  }
  // protected _preBack(delta: number): {item: T; overflow: number} {
  //   let overflow = 0;
  //   const records = this.records.slice(delta);
  //   if (records.length === 0) {
  //     overflow = delta - this.records.length + 1;
  //     records.push(this.records.pop()!);
  //   }
  //   return {item: records[0], overflow};
  // }
  back(delta: number): void {
    const delList = this.records.splice(0, delta);
    if (this.records.length === 0) {
      const last = delList.pop()!;
      this.records.push(last);
    }
    delList.forEach((delItem) => {
      if (delItem.destroy) {
        delItem.destroy();
      }
    });
    this.onChanged();
  }
}

export class PageStack extends HistoryStack<RouteRecord> implements IRecord, IPageStack {
  public num = 0;
  public readonly key: string;
  constructor(public readonly windowStack: IWindowStack, location: Location, store: AStore) {
    super();
    this.key = '' + windowStack.num++;
    this.init(new RouteRecord(location, this, store));
  }
  findRecordByKey(key: string): [RouteRecord, number] | undefined {
    for (let i = 0, k = this.records.length; i < k; i++) {
      const item = this.records[i];
      if (item.key === key) {
        return [item, i];
      }
    }
    return undefined;
  }
  active(): void {
    this.getCurrentItem().active();
  }
  inactive(): void {
    this.getCurrentItem().inactive();
  }
  destroy(): void {
    this.records.forEach((item) => {
      item.destroy();
    });
  }
}

export class WindowStack extends HistoryStack<PageStack> implements IWindowStack {
  public num = 0;
  constructor(location: Location, store: AStore) {
    super();
    this.init(new PageStack(this, location, store));
  }
  getRecords(): RouteRecord[] {
    return this.records.map((item) => item.getCurrentItem());
  }
  protected countBack(delta: number): [number, number] {
    const historyStacks = this.records;
    const backSteps: [number, number] = [0, 0];
    for (let i = 0, k = historyStacks.length; i < k; i++) {
      const pageStack = historyStacks[i];
      const recordNum = pageStack.getLength();
      delta = delta - recordNum;
      if (delta > 0) {
        backSteps[0]++;
      } else if (delta === 0) {
        backSteps[0]++;
        break;
      } else {
        backSteps[1] = recordNum + delta;
        break;
      }
    }
    return backSteps;
  }
  backTest(stepOrKey: number | string, rootOnly: boolean): {record: RouteRecord; overflow: boolean; index: [number, number]} {
    if (typeof stepOrKey === 'string') {
      return this.findRecordByKey(stepOrKey);
    }
    const delta = stepOrKey;
    if (delta === 0) {
      const record = this.getCurrentItem().getCurrentItem();
      return {record, overflow: false, index: [0, 0]};
    }
    if (rootOnly) {
      if (delta < 0 || delta >= this.records.length) {
        const record = this.getEarliestItem().getCurrentItem();
        return {record, overflow: !(delta < 0), index: [this.records.length - 1, 0]};
      } else {
        const record = this.getItemAt(delta)!.getCurrentItem();
        return {record, overflow: false, index: [delta, 0]};
      }
    }
    if (delta < 0) {
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {record, overflow: false, index: [this.records.length - 1, pageStack.getLength() - 1]};
    }
    const [rootDelta, recordDelta] = this.countBack(delta);
    if (rootDelta < this.records.length) {
      const record = this.getItemAt(rootDelta)!.getItemAt(recordDelta)!;
      return {record, overflow: false, index: [rootDelta, recordDelta]};
    } else {
      const pageStack = this.getEarliestItem();
      const record = pageStack.getEarliestItem();
      return {record, overflow: true, index: [this.records.length - 1, pageStack.getLength() - 1]};
    }
  }
  findRecordByKey(key: string): {record: RouteRecord; overflow: boolean; index: [number, number]} {
    const arr = key.split('_');
    if (arr[0] && arr[1]) {
      for (let i = 0, k = this.records.length; i < k; i++) {
        const pageStack = this.records[i];
        if (pageStack.key === arr[0]) {
          const item = pageStack.findRecordByKey(key);
          if (item) {
            return {record: item[0], index: [i, item[1]], overflow: false};
          }
        }
      }
    }
    return {record: this.getCurrentItem().getCurrentItem(), index: [0, 0], overflow: true};
  }
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
  const pathname = routerConfig.NativePathnameMapping.out(location.pathname);
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
  const pathname = routerConfig.NativePathnameMapping.in(location.pathname);
  const url = location.url.replace(location.pathname, pathname);
  return {...location, pathname, url};
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
  const pathname = routerConfig.NativePathnameMapping.in('/' + path.replace(/^\/|\/$/g, ''));
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
  const pathname = routerConfig.NativePathnameMapping.out('/' + path.replace(/^\/|\/$/g, ''));
  return `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
}

/**
 * Url转换为Location
 *
 * @public
 */
export function urlToLocation(url: string, state?: any): Location {
  const [path = '', query = '', hash = ''] = url.split(/[?#]/);
  const arr = `?${query}`.match(/[?&]__c=([^&]*)/) || ['', ''];
  const classname = arr[1];
  let search = `?${query}`.replace(/[?&]__c=[^&]*/g, '').substring(1);
  const pathname = '/' + path.replace(/^\/|\/$/g, '');
  const {parse} = routerConfig.QueryString;
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
  const {stringify} = routerConfig.QueryString;
  search = search ? search.replace('?', '') : searchQuery ? stringify(searchQuery) : '';
  hash = hash ? hash.replace('#', '') : hashQuery ? stringify(hashQuery) : '';
  if (!/[?&]__c=/.test(`?${search}`) && defClassname && classname === undefined) {
    classname = defClassname;
  }
  if (typeof classname === 'string') {
    search = `?${search}`.replace(/[?&]__c=[^&]*/g, '').substring(1);
    if (classname) {
      search = search ? `${search}&__c=${classname}` : `__c=${classname}`;
    }
  }
  url = `${pathname}${search ? `?${search}` : ''}${hash ? `#${hash}` : ''}`;
  return url;
}

export abstract class BaseNativeRouter implements ANativeRouter {
  public declare router: Router;
  public routeKey: string = '';
  protected curTask?: {resolve: () => void; timeout: number};
  public abstract getInitData(): Promise<{url: string; state: StoreState; context: any}>;
  public abstract exit(): void;
  public abstract setPageTitle(title: string): void;
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
  public testExecute(method: RouteAction, location: Location, backIndex?: number[]): string | void {
    const testMethod = '_' + method;
    if (this[testMethod]) {
      return this[testMethod](locationToNativeLocation(location), backIndex);
    }
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

export class Router extends ARouter {
  protected WindowStackClass = WindowStack;
  protected PageStackClass = PageStack;
  protected StoreClass = Store;
  protected listenerId = 0;
  protected readonly listenerMap: {[id: string]: (data: RouteEvent) => void | Promise<void>} = {};

  protected dispatch(data: RouteEvent): void | Promise<void> {
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

  protected nativeUrlToUrl(nativeUrl: string): string {
    return nativeUrlToUrl(nativeUrl);
  }

  protected urlToLocation(url: string, state: any): Location {
    return urlToLocation(url, state);
  }

  protected locationToUrl(location: Partial<Location>, defClassname?: string): string {
    return locationToUrl(location, defClassname);
  }

  protected needToNotifyNativeRouter(action: RouteAction, target: RouteTarget): boolean {
    return routerConfig.NeedToNotifyNativeRouter(action, target);
  }

  public addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener {
    this.listenerId++;
    const id = this.listenerId + '';
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }
  public relaunch(partialLocation: Partial<Location>, target: RouteTarget = 'page', refresh: boolean = false, _nativeCaller = false): Promise<void> {
    return this.addTask(this._relaunch.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  protected async _relaunch(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, nativeCaller: boolean): Promise<void> {
    const action: RouteAction = 'relaunch';
    const url = this.computeUrl(partialLocation, action, target);
    //this.redirectOnServer(url);
    const location = this.urlToLocation(url, partialLocation.state);
    const needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);
    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location);
      if (reject) {
        throw reject;
      }
    }
    const curPage = this.getCurrentPage() as RouteRecord;
    try {
      await curPage.store.dispatch(testRouteChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }
    await curPage.store.dispatch(beforeRouteChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    //this.location = location;
    this.action = action;
    const newStore = curPage.store.clone(refresh);
    const curPageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, curPageStack, newStore);
    if (target === 'window') {
      curPageStack.relaunch(newRecord);
      this.windowStack.relaunch(curPageStack);
    } else {
      curPageStack.relaunch(newRecord);
    }
    try {
      await this.mountStore(curPage.store, newStore);
    } catch (err) {
      env.console.error(err);
    }
    if (!nativeCaller && needToNotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }
    await this.dispatch({location, action, prevStore: curPage.store, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterRouteChangeAction(location, action));
  }

  public replace(partialLocation: Partial<Location>, target: RouteTarget = 'page', refresh: boolean = false, _nativeCaller = false): Promise<void> {
    return this.addTask(this._replace.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  protected async _replace(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, nativeCaller: boolean): Promise<void> {
    const action: RouteAction = 'replace';
    const url = this.computeUrl(partialLocation, action, target);
    //this.redirectOnServer(url);
    const location = this.urlToLocation(url, partialLocation.state);
    const needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);
    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location);
      if (reject) {
        throw reject;
      }
    }
    const curPage = this.getCurrentPage() as RouteRecord;
    try {
      await curPage.store.dispatch(testRouteChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }
    await curPage.store.dispatch(beforeRouteChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    //this.location = location;
    this.action = action;
    const newStore = curPage.store.clone(refresh);
    const curPageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, curPageStack, newStore);
    //this.routeKey = newRecord.key;
    if (target === 'window') {
      curPageStack.relaunch(newRecord);
    } else {
      curPageStack.replace(newRecord);
    }
    try {
      await this.mountStore(curPage.store, newStore);
    } catch (err) {
      env.console.error(err);
    }
    if (!nativeCaller && needToNotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }
    await this.dispatch({location, action, prevStore: curPage.store, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterRouteChangeAction(location, action));
  }

  public push(partialLocation: Partial<Location>, target: RouteTarget = 'page', refresh: boolean = false, _nativeCaller = false): Promise<void> {
    return this.addTask(this._push.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  protected async _push(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, nativeCaller: boolean): Promise<void> {
    const action: RouteAction = 'push';
    const url = this.computeUrl(partialLocation, action, target);
    //this.redirectOnServer(url);
    const location = this.urlToLocation(url, partialLocation.state);
    const needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);
    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location);
      if (reject) {
        throw reject;
      }
    }
    const curPage = this.getCurrentPage() as RouteRecord;
    try {
      await curPage.store.dispatch(testRouteChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }
    await curPage.store.dispatch(beforeRouteChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    //this.location = location;
    this.action = action;
    const newStore = curPage.store.clone(target === 'window' || refresh);
    const curPageStack = this.windowStack.getCurrentItem();
    let newRecord: IRouteRecord;
    if (target === 'window') {
      const newPageStack = new this.PageStackClass(this.windowStack, location, newStore);
      newRecord = newPageStack.getCurrentItem();
      this.windowStack.push(newPageStack);
    } else {
      newRecord = new RouteRecord(location, curPageStack, newStore);
      curPageStack.push(newRecord);
    }
    try {
      await this.mountStore(curPage.store, newStore);
    } catch (err) {
      env.console.error(err);
    }
    if (!nativeCaller && needToNotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, newRecord.key);
    }
    await this.dispatch({location, action, prevStore: curPage.store, newStore, windowChanged: target === 'window'});
    newStore.dispatch(afterRouteChangeAction(location, action));
  }

  public back(
    stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean),
    target: RouteTarget = 'page',
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
      return this.replace(this.getCurrentPage().location, 'page');
    }
    return this.addTask((this._back as any).bind(this, stepOrKeyOrCallback, target, overflowRedirect, _nativeCaller));
  }

  protected async _back(
    stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean),
    target: RouteTarget,
    overflowRedirect: string,
    nativeCaller: boolean
  ): Promise<void> {
    const action = 'back';
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
    const {record, overflow, index} = this.windowStack.backTest(stepOrKey, target === 'window');
    if (overflow) {
      return this.backError(stepOrKey, overflowRedirect);
    }
    if (!index[0] && !index[1]) {
      return;
    }
    const location = record.location;
    const title = record.title;
    const needToNotifyNativeRouter =
      Boolean(index[0] && this.needToNotifyNativeRouter(action, 'window')) || Boolean(index[1] && this.needToNotifyNativeRouter(action, 'page'));

    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location, index);
      if (reject) {
        throw reject;
      }
    }
    const curPage = this.getCurrentPage() as RouteRecord;
    try {
      await curPage.store.dispatch(testRouteChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }
    await curPage.store.dispatch(beforeRouteChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    //this.location = location;
    this.action = action;
    if (index[0]) {
      this.windowStack.back(index[0]);
    }
    if (index[1]) {
      this.windowStack.getCurrentItem().back(index[1]);
    }
    const historyStore = this.getCurrentPage().store;
    try {
      await this.mountStore(curPage.store, historyStore);
    } catch (err) {
      env.console.error(err);
    }
    if (!nativeCaller && needToNotifyNativeRouter) {
      await this.nativeRouter.execute(action, location, record.key, index);
    }
    this.setDocumentHead(title);
    await this.dispatch({location, action, prevStore: curPage.store, newStore: historyStore, windowChanged: !!index[0]});
    historyStore.dispatch(afterRouteChangeAction(location, action));
  }

  protected backError(stepOrKey: number | string, redirect: string): void | Promise<void> {
    const curStore = this.getCurrentPage().store;
    const backOverflow: ActionError = {
      code: ErrorCodes.ROUTE_BACK_OVERFLOW,
      message: 'Overflowed on route backward.',
      detail: {stepOrKey, redirect},
    };
    return curStore.dispatch(errorAction(backOverflow));
  }
}

export const routerConfig: {
  QueryString: {
    parse(str: string): {[key: string]: any};
    stringify(query: {[key: string]: any}): string;
  };
  NativePathnameMapping: {
    in(nativePathname: string): string;
    out(internalPathname: string): string;
  };
  NeedToNotifyNativeRouter(action: RouteAction, target: RouteTarget): boolean;
} = {
  QueryString: {
    parse: (str: string) => ({}),
    stringify: () => '',
  },
  NativePathnameMapping: {
    in: (pathname: string) => pathname,
    out: (pathname: string) => pathname,
  },
  NeedToNotifyNativeRouter() {
    return false;
  },
};
