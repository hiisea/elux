import env from './env';
import {deepCloneState, Listener, LoadingState, UNListener} from './utils';
import {actionConfig, initModuleErrorAction, initModuleSuccessAction} from './action';
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
  _loading?: {[group: string]: LoadingState};
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

/**
 * 获取全局状态
 *
 * @param moduleName - 如果指明moduleName则返回该模块的ModuleState，否则返回全局StoreState
 *
 * @public
 */
export interface GetState<S extends StoreState = StoreState> {
  (): S;
  <N extends string>(moduleName: N): S[N];
}

/**
 * Model的基础定义
 *
 * @public
 */
export interface IModel<S extends ModuleState = ModuleState> {
  /**
   * 模块名称
   */
  readonly moduleName: string;
  // /**
  //  * 模块状态
  //  */
  // readonly state: ModuleState;
  /**
   * model被挂载到store时触发，在一个store中一个model只会被挂载一次
   */
  onInit(): S | Promise<S>;
  onBuild(): any;
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
export interface IModelClass<H = IModel> {
  new (moduleName: string, store: IStore): H;
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

export function isEluxView(view: EluxComponent): boolean {
  return view['__elux_component__'] === 'view';
}
export function isEluxComponent(data: any): data is EluxComponent {
  return data['__elux_component__'];
}

/**
 * 向外导出UI组件
 *
 * @returns
 * 返回实现 EluxComponent 接口的UI组件
 *
 * @public
 */
export function exportComponent<T>(component: T): T & EluxComponent {
  const eluxComponent: EluxComponent & T = component as any;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}

/**
 * 向外导出业务视图
 *
 * @returns
 * 返回实现 EluxComponent 接口的业务视图
 *
 * @public
 */
export function exportView<T>(component: T): T & EluxComponent {
  const eluxComponent: EluxComponent & T = component as any;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}
/**
 * 异步EluxComponent定义
 *
 * @remarks
 * EluxComponent通过 {@link exportComponent} 导出，可使用 {@link ILoadComponent} 加载
 *
 * @public
 */
export type AsyncEluxComponent = () => Promise<{
  default: EluxComponent;
}>;

/**
 * Module的基础定义
 *
 * @public
 */
export interface IModule<TModuleName extends string = string> {
  moduleName: TModuleName;
  ModelClass: IModelClass;
  components: {[componentName: string]: EluxComponent | AsyncEluxComponent};
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
  getInitData(): Promise<{url: string; state: StoreState; context: any}>;
  testExecute(method: RouteAction, location: Location, backIndex?: number[]): string | void;
  execute(method: RouteAction, location: Location, key: string, backIndex?: number[]): void | Promise<void>;
  setPageTitle(title: string): void;
  exit(): void;
}

export interface IWindowStack {
  num: number;
  getCurrentItem(): IPageStack;
  getRecords(): IRouteRecord[];
  getLength(): number;
  findRecordByKey(key: string): {record: RouteRecord; overflow: boolean; index: [number, number]};
  relaunch(record: IPageStack): void;
  push(record: IPageStack): void;
  backTest(stepOrKey: number | string, rootOnly: boolean): {record: RouteRecord; overflow: boolean; index: [number, number]};
  back(delta: number): void;
}
export interface IPageStack {
  num: number;
  readonly key: string;
  readonly windowStack: IWindowStack;
  getCurrentItem(): IRouteRecord;
  getItems(): IRouteRecord[];
  getLength(): number;
  push(record: IRouteRecord): void;
  relaunch(record: IRouteRecord): void;
  replace(record: IRouteRecord): void;
  back(delta: number): void;
}

export interface IRecord {
  destroy: () => void;
  active: () => void;
  inactive: () => void;
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

export class RouteRecord implements IRouteRecord, IRecord {
  public readonly key: string;
  protected _title: string = '';

  constructor(public readonly location: Location, public readonly pageStack: IPageStack, public readonly store: AStore) {
    this.key = [pageStack.key, pageStack.num++].join('_');
  }
  destroy(): void {
    this.store.destroy();
  }
  active(): void {
    this.store.setActive(true);
  }
  inactive(): void {
    this.store.setActive(false);
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

type Execute = () => Promise<void>;
type Resolved = () => void;
type Rejected = (reason?: any) => void;
type RouteTask = [Execute, Resolved, Rejected];

/**
 * Store实例
 *
 * @public
 */
export interface IStore<S extends StoreState = StoreState> {
  /**
   * ForkID
   */
  readonly uid: number;
  /**
   * 实例ID
   */
  readonly sid: number;
  /**
   * 当前是否是激活状态
   *
   * @remarks
   * 同一时刻只会有一个store被激活
   */
  readonly active: boolean;
  /**
   * 所属router
   *
   * @remarks
   * router和store是一对多的关系
   */
  readonly router: IRouter<S>;
  /**
   * 派发action
   */
  dispatch: Dispatch;
  /**
   * 获取store的状态
   *
   * @remarks
   * storeState由多个moduleState组成，更新时必须等所有moduleState全部更新完成后，后会才一次性commit到store中
   */
  getState: GetState<S>;
  /**
   * 获取暂时未提交到store的状态
   *
   * @remarks
   * storeState由多个moduleState组成，更新时必须等所有moduleState全部更新完成后，后会才一次性commit到store中
   */
  getUncommittedState(): S;
  /**
   * 在该store中挂载指定的model
   *
   * @remarks
   * 该方法会触发model.onMount(env)钩子
   */
  mount(moduleName: keyof S, env: 'init' | 'route' | 'update'): void | Promise<void>;
  getCurrentAction(): Action;
  setLoading<T extends Promise<any>>(item: T, groupName: string, moduleName?: string): T;
  subscribe(listener: Listener): UNListener;
}
export abstract class AStore implements IStore {
  public abstract dispatch: Dispatch;
  public abstract getState: GetState;
  public abstract getUncommittedState(): StoreState;
  public abstract setActive(active: boolean): void;
  public abstract destroy(): void;
  public abstract clone(brand?: boolean): AStore;
  public abstract subscribe(listener: Listener): UNListener;
  public abstract getCurrentAction(): Action;
  public abstract setLoading<T extends Promise<any>>(item: T, loadingKey: string): T;
  public get active(): boolean {
    return this._active;
  }
  protected mountedModules: {[moduleName: string]: Promise<void> | true | undefined} = {};
  protected injectedModels: {[moduleName: string]: IModel} = {};
  protected _active: boolean = false;

  constructor(public readonly sid: number, public readonly uid: number, public readonly router: IRouter) {}

  public mount(moduleName: string, env: 'init' | 'route' | 'update'): void | Promise<void> {
    if (!baseConfig.ModuleGetter![moduleName]) {
      return;
    }
    const mountedModules = this.mountedModules;
    if (!mountedModules[moduleName]) {
      mountedModules[moduleName] = this.execMount(moduleName);
    }
    const result = mountedModules[moduleName];
    return result === true ? undefined : result;
  }

  protected async execMount(moduleName: string): Promise<void> {
    let model: IModel, initState: ModuleState, initError: any;
    try {
      const module = await baseConfig.GetModule(moduleName);
      model = new module!.ModelClass(moduleName, this);
      initState = await model.onInit();
    } catch (e: any) {
      initError = e;
    }
    if (initError) {
      this.dispatch(initModuleErrorAction(moduleName, initError));
      this.mountedModules[moduleName] = undefined;
      throw initError;
    }
    this.dispatch(initModuleSuccessAction(moduleName, initState!));
    this.mountedModules[moduleName] = true;
    this.injectedModels[moduleName] = model!;
    if (this.active) {
      model!.onActive();
    }
    //TODO 是否需要return 等待?
    model!.onBuild();
  }
}
export interface IRouter<S extends StoreState = StoreState> {
  /**
   * 路由初始化时的参数，通常用于SSR时传递原生的Request和Response对象
   */
  readonly context: any;
  readonly prevState: S;
  /**
   * 当前路由动作
   */
  readonly action: RouteAction;
  initialize(): Promise<void>;
  /**
   * 监听路由事件
   */
  addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
  /**
   * 当前路由信息
   */
  getLocation(): Location;
  /**
   * 获取当前页面的DocumentHead
   */
  getDocumentHead(): string;
  /**
   * 设置当前页面的DocumentHead
   */
  setDocumentHead(html: string): void;
  /**
   * 获取当前被激活显示的页面
   */
  getCurrentPage(): IRouteRecord;
  /**
   * 获取当前所有虚拟Window中的Page
   */
  getWindowPages(): IRouteRecord[];
  /**
   * 获取指定历史栈的长度
   */
  getHistoryLength(target: RouteTarget): number;
  /**
   * 获取指定历史栈中的记录
   */
  getHistory(target: RouteTarget): IRouteRecord[];
  /**
   * 用`唯一key`来查找历史记录，如果没找到则返回 `{overflow: true}`
   */
  findRecordByKey(key: string): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  /**
   * 用`回退步数`来查找历史记录，如果步数溢出则返回 `{overflow: true}`
   */
  findRecordByStep(delta: number, rootOnly: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  /**
   * 根据部分信息计算完整Url
   */
  computeUrl(partialLocation: Partial<Location>, action: RouteAction, target: RouteTarget): string;
  /**
   * 清空指定栈中的历史记录，并跳转路由
   *
   * @param partialLocation - 路由信息 {@link Location}
   * @param target - 指定要操作的历史栈，默认:`page`
   * @param refresh - 是否强制刷新，默认: false
   */
  relaunch(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
  /**
   * 在指定栈中新增一条历史记录，并跳转路由
   *
   * @param partialLocation - 路由信息 {@link Location}
   * @param target - 指定要操作的历史栈，默认:`page`
   * @param refresh - 是否强制刷新，默认: false
   */
  push(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
  /**
   * 在指定栈中替换当前历史记录，并跳转路由
   *
   * @param partialLocation - 路由信息 {@link Location}
   * @param target - 指定要操作的历史栈，默认:`page`
   * @param refresh - 是否强制刷新，默认: false
   */
  replace(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
  /**
   * 回退指定栈中的历史记录，并跳转路由
   *
   * @param stepOrKeyOrCallback - 需要回退的步数/历史记录ID/回调函数
   * @param target - 指定要操作的历史栈，默认:`page`
   * @param refresh - 是否强制刷新，默认: false
   * @param overflowRedirect - 如果回退溢出，跳往哪个路由
   */
  back(
    stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean),
    target?: RouteTarget,
    overflowRedirect?: string
  ): void | Promise<void>;
}

let clientDocumentHeadTimer = 0;
export abstract class ARouter implements IRouter {
  public abstract addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
  protected abstract WindowStackClass: {new (location: Location, store: AStore): IWindowStack};
  protected abstract PageStackClass: {new (windowStack: IWindowStack, location: Location, store: AStore): IPageStack};
  protected abstract StoreClass: {new (sid: number, uid: number, router: ARouter): AStore};
  protected abstract nativeUrlToUrl(nativeUrl: string): string;
  protected abstract urlToLocation(url: string, state?: any): Location;
  protected abstract locationToUrl(location: Partial<Location>, defClassname?: string): string;
  public abstract relaunch(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
  public abstract push(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
  public abstract replace(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
  public abstract back(
    stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean),
    target?: RouteTarget,
    overflowRedirect?: string
  ): void | Promise<void>;

  public action: RouteAction = 'init';
  public prevState: StoreState = {};
  public context = {};
  protected declare windowStack: IWindowStack;
  protected nativeRouter: ANativeRouter;
  protected taskList: RouteTask[] = [];
  protected curTask?: RouteTask;
  protected curTaskError?: any;
  protected curLoopTaskCallback?: [Resolved, Rejected];
  protected documentHead: string = '';
  protected onTaskComplete = (): void => {
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

  constructor(nativeRouter: ANativeRouter) {
    this.nativeRouter = nativeRouter;
    baseConfig.ClientRouter = this;
  }

  protected addTask(exec: () => Promise<void>): Promise<void> {
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

  public getHistoryLength(target: RouteTarget): number {
    return target === 'window' ? this.windowStack.getLength() - 1 : this.windowStack.getCurrentItem().getLength() - 1;
  }
  public findRecordByKey(recordKey: string): {record: IRouteRecord; overflow: boolean; index: [number, number]} {
    return this.windowStack.findRecordByKey(recordKey);
  }

  public findRecordByStep(delta: number, rootOnly?: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]} {
    return this.windowStack.backTest(delta, !!rootOnly);
  }

  public getWindowPages(): IRouteRecord[] {
    return this.windowStack.getRecords();
  }

  public getCurrentPage(): IRouteRecord {
    return this.windowStack.getCurrentItem().getCurrentItem();
  }

  public getHistory(target: RouteTarget): IRouteRecord[] {
    return target === 'window' ? this.windowStack.getRecords().slice(1) : this.windowStack.getCurrentItem().getItems().slice(1);
  }

  public getDocumentTitle(): string {
    const arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];
    return arr[1] || '';
  }

  public getDocumentHead(): string {
    return this.documentHead;
  }

  public setDocumentHead(html: string): void {
    this.documentHead = html;
    if (!env.isServer && !clientDocumentHeadTimer) {
      clientDocumentHeadTimer = env.setTimeout(() => {
        clientDocumentHeadTimer = 0;
        const arr = this.documentHead.match(/<title>(.*?)<\/title>/) || [];
        if (arr[1]) {
          this.nativeRouter.setPageTitle(arr[1]);
        }
      }, 0);
    }
  }

  public getLocation(): Location {
    return this.getCurrentPage().location;
  }

  public computeUrl(partialLocation: Partial<Location>, action: RouteAction, target: RouteTarget): string {
    const curClassname = this.getLocation().classname;
    let defClassname = curClassname;
    if (action === 'relaunch') {
      defClassname = target === 'window' ? '' : curClassname;
    }
    return this.locationToUrl(partialLocation, defClassname);
  }

  protected mountStore(prevStore: AStore, newStore: AStore): void | Promise<void> {
    const prevState = prevStore.getState();
    this.prevState = baseConfig.MutableData ? deepCloneState(prevState) : prevState;
    //TODO 是否需要？
    // this.runtime = {
    //   prevState: baseConfig.MutableData ? deepCloneState(prevState) : prevState,
    // };
    return newStore.mount(actionConfig.StageModuleName, 'route');
  }

  public initialize(): Promise<void> {
    return this.nativeRouter.getInitData().then(({url: nativeUrl, state, context}) => {
      this.context = context;
      this.prevState = state;
      const url = this.nativeUrlToUrl(nativeUrl);
      const location = this.urlToLocation(url);
      this.windowStack = new this.WindowStackClass(location, new this.StoreClass(0, 0, this));
      const task: RouteTask = [this._init.bind(this), () => undefined, () => undefined];
      this.curTask = task;
      return new Promise((resolve, reject) => {
        this.curLoopTaskCallback = [resolve, reject];
        task[0]().finally(this.onTaskComplete);
      });
    });
  }

  protected async _init(): Promise<void> {
    //TODO 是否需要？
    //const {action, location, routeKey} = this;
    //await this.nativeRouter.execute(action, location, routeKey);
    const store = this.getCurrentPage().store;
    try {
      await store.mount(actionConfig.StageModuleName, 'init');
    } catch (err: any) {
      env.console.error(err);
    }
    //TODO 是否需要？
    //this.dispatch({location, action, prevStore: store, newStore: store, windowChanged: true});
  }

  public ssr(html: string): Promise<void> {
    return this.addTask(this._ssr.bind(this, html));
  }

  protected async _ssr(html: string): Promise<void> {
    const err: ActionError = {code: ErrorCodes.ROUTE_RETURN, message: 'Route cutting out', detail: html};
    throw err;
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
  protected cientSingleton?: INS & {
    render(options?: RenderOptions): Promise<void>;
  };
  protected abstract NativeRouterClass: {new (): ANativeRouter};
  protected abstract RouterClass: {new (nativeRouter: ANativeRouter, prevState: StoreState): ARouter};
  protected abstract createUI: () => any;
  protected abstract toDocument: (domId: string, router: ARouter, ssrData: any, ui: any) => void;

  boot(): INS & {
    render(options?: RenderOptions): Promise<void>;
  } {
    if (this.cientSingleton) {
      return this.cientSingleton;
    }
    const ssrData = env[baseConfig.SSRDataKey];
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
          toDocument(id, router, !!ssrData, ui);
        });
      },
    });
  }
}

export abstract class SsrApp {
  protected abstract NativeRouterClass: {new (): ANativeRouter};
  protected abstract RouterClass: {new (nativeRouter: ANativeRouter, prevState: StoreState): ARouter};
  protected abstract createUI: () => any;
  protected abstract toString: (domId: string, router: ARouter, ui: any) => void;

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
          toString(id, router, ui);
        });
      },
    });
  }
}

export function mergeState(target: any = {}, ...args: any[]): any {
  if (baseConfig.MutableData) {
    return Object.assign(target, ...args);
  }
  return Object.assign({}, target, ...args);
}

export const baseConfig: {
  StageViewName: string;
  MutableData: boolean;
  SSRDataKey: string;
  ClientRouter: IRouter;
  GetModule: (moduleName: string) => IModule | Promise<IModule> | undefined;
  ModuleGetter?: ModuleGetter;
} = {
  MutableData: false,
  StageViewName: 'main',
  SSRDataKey: 'eluxSSRData',
  ClientRouter: undefined as any,
  GetModule: undefined as any,
  ModuleGetter: undefined,
};
