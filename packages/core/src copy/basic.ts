import env from './env';
import {buildConfigSetter, deepMerge, UNListener} from './utils';

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
export type ModuleState = {[key: string]: any};

/**
 * 全局状态
 *
 * @remarks
 * 由多个 {@link ModuleState} 按moduleName组合起来的全局状态
 *
 * @public
 */
export type StoreState = {[moduleName: string]: ModuleState | undefined};

export interface ActionHandler {
  // __moduleName__: string;
  // __actionName__: string;
  __isReducer__?: boolean;
  __isEffect__?: boolean;
  // __isHandler__?: boolean;
  __decorators__?: [
    (store: IStore, action: Action, effectPromise: Promise<unknown>) => any,
    null | ((status: 'Rejected' | 'Resolved', beforeResult: unknown, effectResult: unknown) => void)
  ][];
  (...args: any[]): unknown;
}

/*** @public */
export type ActionCreator = (...args: any[]) => Action;

export type ModelAsHandlers = {[actionName: string]: ActionHandler};

export type ActionHandlersMap = {[actionName: string]: {[moduleName: string]: ActionHandler}};

/** @public */
export type ModelAsCreators = {[actionName: string]: ActionCreator};

/**
 * 获取全局状态
 *
 * @param moduleName - 如果指明moduleName则返回该模块的ModuleState，否则返回全局StoreState
 *
 * @public
 */
export interface GetState<TStoreState extends StoreState = StoreState> {
  (): TStoreState;
  <N extends string>(moduleName: N): TStoreState[N];
}

/**
 * Store实例
 *
 * @public
 */
export interface IStore<TStoreState extends StoreState = StoreState> {
  /**
   * ForkID
   */
  uid: number;
  /**
   * 实例ID
   */
  sid: number;
  /**
   * 当前是否是激活状态
   *
   * @remarks
   * 同一时刻只会有一个store被激活
   */
  active: boolean;
  /**
   * 所属router
   *
   * @remarks
   * router和store是一对多的关系
   */
  router: IRouter<TStoreState>;
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
  getState: GetState<TStoreState>;
  /**
   * 当前的Store状态
   */
  state: TStoreState;
  /**
   * 获取暂时未提交到store的状态
   *
   * @remarks
   * storeState由多个moduleState组成，更新时必须等所有moduleState全部更新完成后，后会才一次性commit到store中
   */
  getUncommittedState(): TStoreState;
  /**
   * 在该store中挂载指定的model
   *
   * @remarks
   * 该方法会触发model.onMount(env)钩子
   */
  mount(moduleName: keyof TStoreState, env: 'init' | 'route' | 'update'): void | Promise<void>;
  /**
   * 销毁（框架会自动调用）
   */
  destroy(): void;
}

/**
 * Store实例(用于View中)
 *
 * @public
 */
export interface VStore<TStoreState extends StoreState = StoreState> {
  /**
   * ForkID
   */
  uid: number;
  /**
   * 实例ID
   */
  sid: number;
  /**
   * 派发action
   */
  dispatch: Dispatch;
  /**
   * 当前的Store状态
   */
  state: TStoreState;
  /**
   * 在该store中挂载指定的model
   *
   * @remarks
   * 该方法会触发model.onMount(env)钩子
   */
  mount(moduleName: keyof TStoreState, env: 'init' | 'route' | 'update'): void | Promise<void>;
}
/**
 * 路由动作类别
 *
 * @public
 */
export type RouteAction = 'init' | 'relaunch' | 'push' | 'replace' | 'back';

/**
 * 路由历史栈类别
 *
 * @public
 */
export type RouteTarget = 'window' | 'page';

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
  key: string;
  /**
   * 路由描述
   */
  location: Location;
  /**
   * 页面标题
   */
  title: string;
}

/**
 * 本次路由前后的某些信息
 *
 * @remarks
 * 可以通过 {@link IRouter.runtime} 获得
 *
 * @public
 */
export interface RouteRuntime<TStoreState extends StoreState = StoreState> {
  /**
   * 路由发生的时间戳
   */
  timestamp: number;
  /**
   * 路由跳转前的store状态
   */
  prevState: TStoreState;
  /**
   * 路由跳转是否已经完成
   */
  completed: boolean;
}

/**
 * 路由初始化时参数
 *
 * @remarks
 * 可以通过 {@link IRouter.initOptions} 获得，通常用于SSR时传递原生的Request和Response对象
 *
 * @public
 */
export interface RouterInitOptions {
  url: string;
  [key: string]: any;
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
  prevStore: IStore;
  newStore: IStore;
  windowChanged: boolean;
}

/**
 * 路由器的定义
 *
 * @remarks
 * - 在 CSR 中全局只有一个 Router
 *
 * - 在 SSR 中每个客户请求都会生成一个Router
 *
 * @public
 */
export interface IRouter<TStoreState extends StoreState = StoreState> {
  init(initOptions: RouterInitOptions, prevState: TStoreState): Promise<void>;
  /**
   * 监听路由事件
   */
  addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
  /**
   * 路由初始化时的参数，通常用于SSR时传递原生的Request和Response对象
   */
  initOptions: RouterInitOptions;
  /**
   * 当前路由动作
   */
  action: RouteAction;
  /**
   * 当前路由信息
   */
  location: Location;
  /**
   * 当前路由的唯一ID
   */
  routeKey: string;
  /**
   * 当前路由的相关运行信息
   */
  runtime: RouteRuntime<TStoreState>;
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
  getActivePage(): {store: IStore; location: Location};
  /**
   * 获取当前所有CurrentPage(PageHistoryStack中的第一条)
   */
  getCurrentPages(): {store: IStore; location: Location}[];
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
    refresh?: boolean,
    overflowRedirect?: string
  ): void | Promise<void>;
}

/**
 * Model的基础定义
 *
 * @public
 */
export interface CommonModel {
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
  onMount(env: 'init' | 'route' | 'update'): void | Promise<void>;
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
export interface CommonModelClass<H = CommonModel> {
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

export function isEluxComponent(data: any): data is EluxComponent {
  return data['__elux_component__'];
}

/**
 * Module的基础定义
 *
 * @public
 */
export interface CommonModule<TModuleName extends string = string> {
  moduleName: TModuleName;
  ModelClass: CommonModelClass;
  components: {[componentName: string]: EluxComponent};
  state: ModuleState;
  actions: ModelAsCreators;
  data?: any;
}

/**
 * 配置模块的获取方式
 *
 * @remarks
 * 模块获取可以使用同步或异步，定义成异步方式可以做到`按需加载`
 *
 * @example
 * ```js
 * import stage from '@/modules/stage';
 *
 * export const moduleGetter = {
 *   stage: () => stage,
 *   article: () => import('@/modules/article'),
 *   my: () => import('@/modules/my'),
 * };
 * ```
 *
 * @public
 */
export type ModuleGetter = {[moduleName: string]: () => CommonModule | Promise<{default: CommonModule}>};

export type ModuleApiMap = Record<string, {name: string; actions: ModelAsCreators; actionNames: Record<string, string>}>;

export const MetaData: {
  moduleApiMap: ModuleApiMap;
  moduleCaches: {[moduleName: string]: undefined | CommonModule | Promise<CommonModule>};
  componentCaches: {[moduleNameAndComponentName: string]: undefined | EluxComponent | Promise<EluxComponent>};
  reducersMap: ActionHandlersMap;
  effectsMap: ActionHandlersMap;
  clientRouter?: IRouter;
} = {
  moduleApiMap: null as any,
  moduleCaches: {},
  componentCaches: {},
  reducersMap: {},
  effectsMap: {},
  clientRouter: undefined,
};

/**
 * Store的中间件
 *
 * @remarks
 * 类似于 Redux 的 Middleware
 *
 * @public
 */
export type StoreMiddleware = (api: {getStore: () => IStore; dispatch: Dispatch}) => (next: Dispatch) => (action: Action) => void | Promise<void>;

/**
 * 派发Action的日志信息
 *
 * @public
 */
export type StoreLoggerInfo = {
  id: number;
  isActive: boolean;
  actionName: string;
  payload: any[];
  priority: string[];
  handers: string[];
  state: any;
  effect: boolean;
};

/**
 * Store的日志记录器
 *
 * @remarks
 * Store派发Action都会调用该回调方法
 *
 * @public
 */
export type StoreLogger = (info: StoreLoggerInfo) => void;

export interface EluxContext {
  router: IRouter;
}

export interface EluxStoreContext {
  store: VStore;
}

export interface IAppRender {
  toDocument(id: string, eluxContext: EluxContext, fromSSR: boolean, app: any): void;
  toString(id: string, eluxContext: EluxContext, app: {}): Promise<string>;
  toProvider(eluxContext: EluxContext, app: any): Elux.Component<{children: any}>;
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

export const coreConfig: {
  NSP: string;
  MSP: string;
  MutableData: boolean;
  DepthTimeOnLoading: number;
  StageModuleName: string;
  StageViewName: string;
  SSRDataKey: string;
  SSRTPL: string;
  ModuleGetter: ModuleGetter;
  StoreInitState: () => {};
  StoreMiddlewares: StoreMiddleware[];
  StoreLogger: StoreLogger;
  SetPageTitle: (title: string) => void;
  Platform: 'taro' | '';
  StoreProvider?: Elux.Component<{store: IStore; children: JSX.Element}>;
  LoadComponent?: (
    moduleName: string,
    componentName: string,
    options: {onError: Elux.Component<{message: string}>; onLoading: Elux.Component<{}>}
  ) => EluxComponent | Promise<EluxComponent>;
  LoadComponentOnError?: Elux.Component<{message: string}>;
  LoadComponentOnLoading?: Elux.Component<{}>;
  UseRouter?: () => IRouter;
  UseStore?: () => VStore;
  AppRender?: IAppRender;
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
} = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 1,
  StageModuleName: 'stage',
  StageViewName: 'main',
  SSRDataKey: 'eluxSSRData',
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
  ModuleGetter: {},
  StoreInitState: () => ({}),
  StoreMiddlewares: [],
  StoreLogger: () => undefined,
  SetPageTitle: (title: string) => {
    if (env.document) {
      env.document.title = title;
    }
  },
  Platform: '',
  StoreProvider: undefined,
  LoadComponent: undefined,
  LoadComponentOnError: undefined,
  LoadComponentOnLoading: undefined,
  UseRouter: undefined,
  UseStore: undefined,
  AppRender: undefined,
  /**
   * 实际上只支持三种组合：[false,false],[true,true],[true,false]
   * 否则back时可以出错
   */
  NotifyNativeRouter: {
    window: true,
    page: false,
  },
  QueryString: {
    parse: (str: string) => ({}),
    stringify: () => '',
  },
  NativePathnameMapping: {
    in: (pathname: string) => pathname,
    out: (pathname: string) => pathname,
  },
};

export const setCoreConfig = buildConfigSetter(coreConfig);

export function deepMergeState(target: any = {}, ...args: any[]): any {
  if (coreConfig.MutableData) {
    return deepMerge(target, ...args);
  }
  return deepMerge({}, target, ...args);
}

export function mergeState(target: any = {}, ...args: any[]): any {
  if (coreConfig.MutableData) {
    return Object.assign(target, ...args);
  }
  return Object.assign({}, target, ...args);
}

export function getClientRouter(): IRouter {
  return MetaData.clientRouter!;
}

/**
 * 当前State模式是否为Mutable
 *
 * @public
 */
export function isMutable(): boolean {
  return coreConfig.MutableData;
}
