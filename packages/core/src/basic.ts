import env from './env';
import {buildConfigSetter, SingleDispatcher, UNListener, deepMerge} from './utils';

export const coreConfig: {
  NSP: string;
  MSP: string;
  MutableData: boolean;
  DepthTimeOnLoading: number;
  AppModuleName: string;
  RouteModuleName: string;
} = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
  RouteModuleName: '',
  AppModuleName: 'stage',
};

export const setCoreConfig = buildConfigSetter(coreConfig);

/*** @public */
export enum LoadingState {
  /**
   * 开始加载.
   */
  Start = 'Start',
  /**
   * 加载完成.
   */
  Stop = 'Stop',
  /**
   * 开始深度加载，对于加载时间超过setLoadingDepthTime设置值时将转为深度加载状态
   */
  Depth = 'Depth',
}

/*** @public */
export interface Action {
  type: string;
  /**
   * priority属性用来设置handlers的优先处理顺序，值为moduleName[]
   */
  priority?: string[];
  payload?: any[];
}

export interface ActionHandler {
  // __moduleName__: string;
  // __actionName__: string;
  __isReducer__?: boolean;
  __isEffect__?: boolean;
  // __isHandler__?: boolean;
  __decorators__?: [
    (action: Action, effectResult: Promise<any>) => any,
    null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
  ][];
  __decoratorResults__?: any[];
  (...args: any[]): any;
}

/*** @public */
export type ActionCreator = (...args: any[]) => Action;

export type ModelAsHandlers = {[actionName: string]: ActionHandler};

export type ModelAsCreators = {[actionName: string]: ActionCreator};

export type ActionHandlersMap = {[actionName: string]: {[moduleName: string]: ActionHandler}};

//export type ActionHandlerMap = Record<string, ActionHandlerList>;

// export type ActionCreator = (...args: any[]) => Action;

// export type ActionCreatorList = Record<string, ActionCreator>;

// export type ActionCreatorMap = Record<string, ActionCreatorList>;

/*** @public */
export type Dispatch = (action: Action) => void | Promise<void>;

/*** @public */
export type ModuleState = {[key: string]: any};

/*** @public */
export type RootState = {[moduleName: string]: ModuleState | undefined};

/*** @public */
export interface GetState<RS extends RootState = RootState> {
  (): RS;
  <N extends string>(moduleName: N): RS[N];
}

export interface Flux {
  getState: GetState;
  update: (actionName: string, state: RootState) => void;
  subscribe(listener: () => void): UNListener;
}

/*** @public */
export interface UStore<RS extends RootState = RootState, PS extends RootState = RootState> {
  sid: number;
  dispatch: Dispatch;
  isActive(): boolean;
  getState: GetState<RS>;
  getRouteParams: GetState<PS>;
  subscribe(listener: () => void): UNListener;
}

/*** @public */
export type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';

/*** @public */
export interface RouteState<P extends RootState = RootState, N extends string = string> {
  action: HistoryAction;
  key: string;
  pagename: N;
  params: P;
}

export interface CoreRouter {
  //moduleName: string;
  routeState: RouteState;
  startup(store: EStore): void;
  getCurrentStore(): EStore;
  getStoreList(): EStore[];
  latestState: RootState;
}

/*** @public */
export interface EluxComponent {
  __elux_component__: 'view' | 'component';
}

/*** @public */
export type AsyncEluxComponent = () => Promise<{
  default: EluxComponent;
}>;

export function isEluxComponent(data: any): data is EluxComponent {
  return data['__elux_component__'];
}

/*** @public */
export interface CommonModel {
  moduleName: string;
  defaultRouteParams: ModuleState;
  store: UStore;
  init(latestState: RootState, preState: RootState): ModuleState;
  destroy(): void;
}

/*** @public */
export interface CommonModelClass<H = CommonModel> {
  new (moduleName: string, store: UStore): H;
}

/*** @public */
export interface CommonModule<ModuleName extends string = string, Store extends UStore = UStore> {
  moduleName: ModuleName;
  initModel: (store: Store) => void | Promise<void>;
  state: ModuleState;
  routeParams: ModuleState;
  actions: {[actionName: string]: ActionCreator};
  components: {[componentName: string]: EluxComponent | AsyncEluxComponent};
  data?: any;
}

export interface EStore extends UStore, Flux {
  router: CoreRouter;
  getCurrentActionName: () => string;
  getUncommittedState: (moduleName?: string) => any;
  injectedModules: {[moduleName: string]: CommonModel};
  loadingGroups: {[moduleNameAndGroupName: string]: TaskCounter};
  setActive(status: boolean): void;
  destroy(): void;
  options: {
    initState: (data: RootState) => RootState;
    middlewares?: StoreMiddleware[];
    logger?: StoreLogger;
  };
}

/*** @public */
export type StoreMiddleware = (api: {getStore: () => UStore; dispatch: Dispatch}) => (next: Dispatch) => (action: Action) => void | Promise<void>;

/*** @public */
export type StoreLogger = (
  {id, isActive}: {id: number; isActive: boolean},
  actionName: string,
  payload: any[],
  priority: string[],
  handers: string[],
  state: {[moduleName: string]: any},
  effect: boolean
) => void;

export class TaskCounter extends SingleDispatcher<LoadingState> {
  public readonly list: {promise: Promise<any>; note: string}[] = [];

  private ctimer = 0;

  public constructor(public deferSecond: number) {
    super();
  }

  public addItem(promise: Promise<any>, note = ''): Promise<any> {
    if (!this.list.some((item) => item.promise === promise)) {
      this.list.push({promise, note});
      promise.finally(() => this.completeItem(promise));

      if (this.list.length === 1 && !this.ctimer) {
        this.dispatch(LoadingState.Start);
        this.ctimer = env.setTimeout(() => {
          this.ctimer = 0;
          if (this.list.length > 0) {
            this.dispatch(LoadingState.Depth);
          }
        }, this.deferSecond * 1000);
      }
    }
    return promise;
  }

  private completeItem(promise: Promise<any>): this {
    const i = this.list.findIndex((item) => item.promise === promise);
    if (i > -1) {
      this.list.splice(i, 1);
      if (this.list.length === 0) {
        if (this.ctimer) {
          env.clearTimeout.call(null, this.ctimer);
          this.ctimer = 0;
        }
        this.dispatch(LoadingState.Stop);
      }
    }
    return this;
  }
}

export type ModuleMap = Record<string, {name: string; actions: ModelAsCreators; actionNames: Record<string, string>}>;

/*** @public */
export type ModuleGetter = {[moduleName: string]: () => CommonModule | Promise<{default: CommonModule}>};

export const MetaData: {
  moduleMap: ModuleMap;
  moduleGetter: ModuleGetter;
  moduleExists: {[moduleName: string]: boolean};
  injectedModules: {[moduleName: string]: boolean};
  reducersMap: ActionHandlersMap;
  effectsMap: ActionHandlersMap;
  moduleCaches: {[moduleName: string]: undefined | CommonModule | Promise<CommonModule>};
  componentCaches: {[moduleNameAndComponentName: string]: undefined | EluxComponent | Promise<EluxComponent>};
  currentRouter: CoreRouter;
} = {
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  moduleMap: null as any,
  moduleGetter: null as any,
  moduleExists: null as any,
  currentRouter: null as any,
};

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

/*** @public */
export function isServer(): boolean {
  return env.isServer;
}
