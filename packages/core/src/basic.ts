import env from './env';
import {deepCloneState} from './utils';

/**
 * 定义Action
 *
 * @public
 */
export interface Action {
  /**
   * type通常由ModuleName.ActionName组成
   */
  type: string;
  /**
   * 同时有多个handler时，可以特别指明处理顺序，通常无需设置
   */
  priority?: string[];
  /**
   * action载体
   */
  payload?: any[];
}

/**
 * 派发Action
 *
 * @public
 */
export type Dispatch = (action: Action) => void | Promise<void>;

/**
 * 模块状态
 *
 * @public
 */
export type ModuleState = {
  _error?: string;
  [key: string]: any;
};

/**
 * 全局状态
 *
 * @remarks
 * 由多个 {@link ModuleState} 按moduleName组合起来的全局状态
 *
 * @public
 */
export type StoreState = {[moduleName: string]: ModuleState | undefined};

/** @public */
export type ModelAsCreators = {[actionName: string]: ActionCreator};

/*** @public */
export type ActionCreator = (...args: any[]) => Action;

export abstract class AStore {
  abstract dispatch: Dispatch;
  abstract clone(brand?: boolean): AStore;
  abstract getState(): StoreState;
  abstract getModule(moduleName: string): IModule | Promise<IModule>;
  abstract destroy(): void;

  private mountedModules: {[moduleName: string]: Promise<void> | true | undefined} = {};
  private injectedModels: {[moduleName: string]: IModel} = {};
  private active: boolean = false;

  mount(moduleName: string, env: 'init' | 'route' | 'update'): void | Promise<void> {
    if (!coreConfig.ModuleGetter[moduleName]) {
      return;
    }
    const mountedModules = this.mountedModules;
    if (!mountedModules[moduleName]) {
      mountedModules[moduleName] = this.execMount(moduleName);
    }
    const result = mountedModules[moduleName];
    return result === true ? undefined : result;
  }
  private async execMount(moduleName: string): Promise<void> {
    let model: IModel, initState: ModuleState, initError: any;
    try {
      const module = await this.getModule(moduleName);
      model = new module.ModelClass(moduleName, this);
      initState = await model.onInit();
    } catch (e: any) {
      initError = e;
    }
    if (initError) {
      this.dispatch(initStateAction(moduleName, {_error: initError + ''}));
      this.mountedModules[moduleName] = undefined;
      throw initError;
    }
    this.dispatch(initStateAction(moduleName, initState!));
    this.mountedModules[moduleName] = true;
    this.injectedModels[moduleName] = model!;
    if (this.active) {
      model!.onActive();
    }
    model!.onBuild();
  }
}
/**
 * Model的基础定义
 *
 * @public
 */
export interface IModel {
  /**
   * 模块名称
   */
  readonly moduleName: string;
  /**
   * 模块状态
   */
  readonly state: ModuleState;
  /**
   * model被挂载到store时触发，在一个store中一个model只会被挂载一次
   */
  onInit(): ModuleState | Promise<ModuleState>;
  onBuild(): void | Promise<void>;
  /**
   * 当前page被激活时触发
   */
  onActive(): void;
  /**
   * 当前page被变为历史快照时触发
   */
  onInactive(): void;
}

/**
 * Model的构造类
 *
 * @public
 */
export interface ModelClass<H = IModel> {
  new (moduleName: string, store: AStore): H;
}

/**
 * EluxComponent定义
 *
 * @remarks
 * EluxComponent通过 {@link exportComponent} 导出，可使用 {@link ILoadComponent} 加载
 *
 * @public
 */
export interface EluxComponent {
  __elux_component__: 'view' | 'component';
}

/**
 * Module的基础定义
 *
 * @public
 */
export interface IModule<TModuleName extends string = string> {
  moduleName: TModuleName;
  ModelClass: ModelClass;
  components: {[componentName: string]: EluxComponent};
  state: ModuleState;
  actions: ModelAsCreators;
  data?: any;
}

export type ModuleGetter = {[moduleName: string]: () => IModule | Promise<{default: IModule}>};

/**
 * 路由历史栈类别
 *
 * @public
 */
export type RouteTarget = 'window' | 'page';

/**
 * 路由动作类别
 *
 * @public
 */
export type RouteAction = 'init' | 'relaunch' | 'push' | 'replace' | 'back';

/**
 * 路由信息
 *
 * @public
 */
export interface Location {
  url: string;
  pathname: string;
  search: string;
  hash: string;
  classname: string;
  searchQuery: {[key: string]: any};
  hashQuery: {[key: string]: any};
  state: any;
}

export interface ANativeRouter {
  getInitUrl(): Promise<string>;
  testExecute(method: RouteAction, location: Location, backIndex?: number[]): any;
  execute(method: RouteAction, location: Location, key: string, backIndex?: number[]): void | Promise<void>;
  exit(): void;
}

export function testChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_testRouteChange`,
    payload: [location, routeAction],
  };
}
export function beforeChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_beforeRouteChange`,
    payload: [location, routeAction],
  };
}
export function afterChangeAction(location: Location, routeAction: RouteAction): Action {
  return {
    type: `${coreConfig.StageModuleName}${coreConfig.NSP}_afterRouteChange`,
    payload: [location, routeAction],
  };
}
export function initStateAction(moduleName: string, initState: ModuleState): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}_initState`,
    payload: [initState],
  };
}
interface IWindowStack {
  num: number;
  getCurrentItem(): IPageStack;
  getRecords(): IRouteRecord[];
  relaunch(record: IPageStack): void;
  push(record: IPageStack): void;
  backTest(stepOrKey: number | string, rootOnly: boolean): {record: RouteRecord; overflow: boolean; index: [number, number]};
  back(delta: number): void;
}
interface IPageStack {
  num: number;
  readonly key: string;
  readonly windowStack: IWindowStack;
  getCurrentItem(): IRouteRecord;
  getItems(): IRouteRecord[];
  push(record: IRouteRecord): void;
  relaunch(record: IRouteRecord): void;
  replace(record: IRouteRecord): void;
  back(delta: number): void;
}

/**
 * 路由历史记录
 *
 * @remarks
 * 可以通过 {@link IRouter.findRecordByKey}、{@link IRouter.findRecordByStep} 获得
 *
 * @public
 */
export interface IRouteRecord {
  /**
   * 唯一的key
   */
  readonly key: string;
  /**
   * 路由描述
   */
  readonly location: Location;
  /**
   * 页面标题
   */
  readonly title: string;
  readonly store: AStore;
}

export class RouteRecord implements IRouteRecord {
  public readonly key: string;
  private _title: string = '';

  constructor(public readonly location: Location, public readonly pageStack: IPageStack, public readonly store: AStore) {
    this.key = [pageStack.key, pageStack.num++].join('_');
  }
  public get title(): string {
    return this._title;
  }
  public saveTitle(val: string): void {
    this._title = val;
  }
}

/**
 * 路由事件
 *
 * @remarks
 * 发生路由时，路由器本身会派发路由事件
 *
 * @public
 */
export interface RouteEvent {
  location: Location;
  action: RouteAction;
  prevStore: AStore;
  newStore: AStore;
  windowChanged: boolean;
}

/**
 * 内置的错误描述接口
 *
 * @public
 */
export interface ActionError {
  code: string;
  message: string;
  detail?: any;
}

/**
 * 内置ErrorCode
 *
 * @public
 */
export const ErrorCodes = {
  /**
   * 在路由被强制中断并返回时抛出该错误
   */
  ROUTE_RETURN: 'ELIX.ROUTE_RETURN',
  /**
   * 在SSR服务器渲染时，操作路由跳转会抛出该错误
   */
  ROUTE_REDIRECT: 'ELIX.ROUTE_REDIRECT',
  /**
   * 在路由后退时，如果步数溢出则抛出该错误
   */
  ROUTE_BACK_OVERFLOW: 'ELUX.ROUTE_BACK_OVERFLOW',
};

export const errorProcessed = '__eluxProcessed__';

/**
 * 创建一个特殊的ErrorAction
 *
 * @param error - 错误体
 *
 * @public
 */
export function errorAction(error: any): Action {
  if (typeof error !== 'object') {
    error = {message: error};
  }
  const processed = !!error[errorProcessed];
  const {code = '', message = 'unkown error', detail} = error;
  const actionError: ActionError = {code, message, detail};
  Object.defineProperty(actionError, errorProcessed, {value: processed, enumerable: false, writable: true});
  //env.console.error(error);
  return {
    type: coreConfig.StageModuleName + coreConfig.NSP + '_error',
    payload: [actionError],
  };
}

type Execute = () => Promise<void>;
type Resolved = () => void;
type Rejected = (reason?: any) => void;
type RouteTask = [Execute, Resolved, Rejected];

export abstract class ARouter {
  protected abstract dispatch(data: RouteEvent): void | Promise<void>;
  protected abstract needToNotifyNativeRouter(action: RouteAction, target: RouteTarget): boolean;
  protected abstract computeLocation(partialLocation: Partial<Location>, action: RouteAction, target: RouteTarget): Location;
  protected abstract WindowStackClass: {new (location: Location, store: AStore): IWindowStack};
  private declare PageStackClass: {new (windowStack: IWindowStack, location: Location, store: AStore): IPageStack};
  protected abstract StoreClass: {new (sid: number, uid: number, router: ARouter): AStore};
  protected abstract getDocumentTitle(): string;
  protected abstract setDocumentHead(title: string): void;
  protected abstract nativeUrlToLocation(nativeUrl: string): Location;
  private declare windowStack: IWindowStack;
  private nativeRouter: ANativeRouter;
  private taskList: RouteTask[] = [];
  private curTask?: RouteTask;
  private curTaskError?: any;
  private curLoopTaskCallback?: [Resolved, Rejected];

  private onTaskComplete = () => {
    const task = this.taskList.shift();
    if (task) {
      this.curTask = task;
      this.curTaskError = undefined;
      const onTaskComplete = this.onTaskComplete;
      const [exec, resolve, reject] = task;
      env.setTimeout(
        () =>
          exec()
            .then(onTaskComplete, (reason) => {
              this.curTaskError = reason;
              onTaskComplete();
              throw reason;
            })
            .then(resolve, reject),
        0
      );
    } else {
      this.curTask = undefined;
      if (this.curLoopTaskCallback) {
        const [resolve, reject] = this.curLoopTaskCallback;
        if (this.curTaskError) {
          reject(this.curTaskError);
        } else {
          resolve();
        }
      }
    }
  };

  private addTask(exec: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      //TODO 是否需要？
      //const task: RouteTask = [() => setLoading(exec(), this.getActivePage().store), resolve, reject];
      const task: RouteTask = [exec, resolve, reject];
      if (this.curTask) {
        this.taskList.push(task);
      } else {
        this.curTask = task;
        this.curTaskError = undefined;
        const onTaskComplete = this.onTaskComplete;
        const [exec, resolve, reject] = task;
        exec()
          .then(onTaskComplete, (reason) => {
            this.curTaskError = reason;
            onTaskComplete();
            throw reason;
          })
          .then(resolve, reject);
      }
    });
  }

  constructor(nativeRouter: ANativeRouter, prevState: StoreState) {
    this.nativeRouter = nativeRouter;
  }

  initialize(): Promise<void> {
    return this.nativeRouter.getInitUrl().then((nativeUrl) => {
      const location = this.nativeUrlToLocation(nativeUrl);
      this.windowStack = new this.WindowStackClass(location, new this.StoreClass(0, 0, this));
      const task: RouteTask = [this._init.bind(this), () => undefined, () => undefined];
      this.curTask = task;
      return new Promise((resolve, reject) => {
        this.curLoopTaskCallback = [resolve, reject];
        task[0]().finally(this.onTaskComplete);
      });
    });
  }

  private async _init() {
    //TODO 是否需要？
    //const {action, location, routeKey} = this;
    //await this.nativeRouter.execute(action, location, routeKey);
    const store = this.getCurrentPage().store;
    try {
      await store.mount(coreConfig.StageModuleName, 'init');
    } catch (err: any) {
      env.console.error(err);
    }
    //TODO 是否需要？
    //this.dispatch({location, action, prevStore: store, newStore: store, windowChanged: true});
  }

  getCurrentPage(): IRouteRecord {
    return this.windowStack.getCurrentItem().getCurrentItem();
  }

  getHistory(target: RouteTarget): IRouteRecord[] {
    return target === 'window' ? this.windowStack.getRecords().slice(1) : this.windowStack.getCurrentItem().getItems().slice(1);
  }

  private mountStore(prevStore: AStore, newStore: AStore) {
    const prevState = prevStore.getState();
    this.prevState = coreConfig.MutableData ? deepCloneState(prevState) : prevState;
    //TODO 是否需要？
    // this.runtime = {
    //   prevState: coreConfig.MutableData ? deepCloneState(prevState) : prevState,
    // };
    return newStore.mount(coreConfig.StageModuleName, 'route');
  }

  private backError(stepOrKey: number | string, redirect: string) {
    const curStore = this.getCurrentPage().store;
    const backOverflow: ActionError = {
      code: ErrorCodes.ROUTE_BACK_OVERFLOW,
      message: 'Overflowed on route backward.',
      detail: {stepOrKey, redirect},
    };
    return curStore.dispatch(errorAction(backOverflow));
  }

  ssr(html: string): Promise<void> {
    return this.addTask(this._ssr.bind(this, html));
  }

  async _ssr(html: string): Promise<void> {
    const err: ActionError = {code: ErrorCodes.ROUTE_RETURN, message: 'Route cutting out', detail: html};
    throw err;
  }

  relaunch(partialLocation: Partial<Location>, target: RouteTarget = 'page', refresh: boolean = false, _nativeCaller = false): Promise<void> {
    return this.addTask(this._relaunch.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  private async _relaunch(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, nativeCaller: boolean) {
    const action: RouteAction = 'relaunch';
    //TODO 是否需要？
    // const url = this.computeUrl(partialLocation, action, target);
    // this.redirectOnServer(url);
    const location = this.computeLocation(partialLocation, action, target);
    const needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);
    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location);
      if (reject) {
        throw reject;
      }
    }
    const curPage = this.getCurrentPage() as RouteRecord;
    try {
      await curPage.store.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }
    await curPage.store.dispatch(beforeChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    //this.location = location;
    //this.action = action;
    const newStore = curPage.store.clone(refresh);
    const curPageStack = this.windowStack.getCurrentItem();
    const newRecord = new RouteRecord(location, curPageStack, newStore);
    //this.routeKey = newRecord.key;
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
    newStore.dispatch(afterChangeAction(location, action));
  }

  replace(partialLocation: Partial<Location>, target: RouteTarget = 'page', refresh: boolean = false, _nativeCaller = false): Promise<void> {
    return this.addTask(this._replace.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  private async _replace(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, nativeCaller: boolean) {
    const action: RouteAction = 'replace';
    // const url = this.computeUrl(partialLocation, action, target);
    // this.redirectOnServer(url);
    const location = this.computeLocation(partialLocation, action, target);
    const needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);
    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location);
      if (reject) {
        throw reject;
      }
    }
    const curPage = this.getCurrentPage() as RouteRecord;
    try {
      await curPage.store.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }
    await curPage.store.dispatch(beforeChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    //this.location = location;
    //this.action = action;
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
    newStore.dispatch(afterChangeAction(location, action));
  }

  push(partialLocation: Partial<Location>, target: RouteTarget = 'page', refresh: boolean = false, _nativeCaller = false): Promise<void> {
    return this.addTask(this._push.bind(this, partialLocation, target, refresh, _nativeCaller));
  }

  async _push(partialLocation: Partial<Location>, target: RouteTarget, refresh: boolean, nativeCaller: boolean): Promise<void> {
    const action: RouteAction = 'push';
    const location = this.computeLocation(partialLocation, action, target);
    const needToNotifyNativeRouter = this.needToNotifyNativeRouter(action, target);
    if (!nativeCaller && needToNotifyNativeRouter) {
      const reject = this.nativeRouter.testExecute(action, location);
      if (reject) {
        throw reject;
      }
    }
    const curPage = this.getCurrentPage() as RouteRecord;
    try {
      await curPage.store.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }
    await curPage.store.dispatch(beforeChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
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
    newStore.dispatch(afterChangeAction(location, action));
  }

  back(
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

  private async _back(
    stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean),
    target: RouteTarget,
    overflowRedirect: string,
    nativeCaller: boolean
  ) {
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
      await curPage.store.dispatch(testChangeAction(location, action));
    } catch (err) {
      if (!nativeCaller) {
        throw err;
      }
    }
    await curPage.store.dispatch(beforeChangeAction(location, action));
    curPage.saveTitle(this.getDocumentTitle());
    //this.location = location;
    //this.action = action;
    //this.routeKey = record.key;
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
    historyStore.dispatch(afterChangeAction(location, action));
  }
}

export interface RenderOptions {
  /**
   * 挂载应用Dom的id
   *
   * @defaultValue `root`
   *
   * @remarks
   * 默认: `root`
   */
  id?: string;
}
/**
 * @public
 */
export type EluxApp = {
  render(options?: RenderOptions): Promise<void>;
};

// const webApp = new WebApp();

// export function createApp(appConfig: AppConfig) {
//   return webApp.boot();
// }
export abstract class WebApp<INS = {}> {
  private cientSingleton?: INS & {
    render(options?: RenderOptions): Promise<void>;
  };
  protected abstract NativeRouterClass: {new (): ANativeRouter};
  protected abstract RouterClass: {new (nativeRouter: ANativeRouter, prevState: StoreState): ARouter};
  protected abstract createUI: () => any;
  protected abstract toDocument: (domId: string, router: ARouter) => void;

  boot(): INS & {
    render(options?: RenderOptions): Promise<void>;
  } {
    if (this.cientSingleton) {
      return this.cientSingleton;
    }
    const ssrData = env[coreConfig.SSRDataKey];
    const nativeRouter = new this.NativeRouterClass();
    const router = new this.RouterClass(nativeRouter, ssrData);
    const ui = this.createUI();
    this.cientSingleton = Object.assign(ui, {
      render() {
        return Promise.resolve();
      },
    });
    const toDocument = this.toDocument;
    return Object.assign(ui, {
      render({id = 'root'}: RenderOptions = {}) {
        return router.initialize().then(() => {
          toDocument(id, {router}, !!ssrData, ins);
        });
      },
    });
  }
}

export abstract class SsrApp {
  protected abstract NativeRouterClass: {new (): ANativeRouter};
  protected abstract RouterClass: {new (nativeRouter: ANativeRouter, prevState: StoreState): ARouter};
  protected abstract createUI: () => any;
  protected abstract toString: (domId: string, router: ARouter) => void;

  boot(): {render(options?: RenderOptions): Promise<void>} {
    const nativeRouter = new this.NativeRouterClass();
    const router = new this.RouterClass(nativeRouter, {});
    const ui = this.createUI();

    const toString = this.toString;
    return Object.assign(ui, {
      render({id = 'root'}: RenderOptions = {}) {
        return router.initialize().then(() => {
          const store = router.getCurrentPage().store;
          store.destroy();
          toString(id, {router}, !!ssrData, ins);
        });
      },
    });
  }
}

export const coreConfig: {NSP: string; MSP: string; StageModuleName: string; MutableData: boolean; SSRDataKey: string; ModuleGetter: ModuleGetter} = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  StageModuleName: 'stage',
  SSRDataKey: 'eluxSSRData',
  ModuleGetter: {},
};
