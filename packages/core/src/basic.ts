import {TaskCounter, deepMerge} from './sprite';

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
  RouteModuleName: 'route',
  AppModuleName: 'stage',
};
export function buildConfigSetter<T extends Record<string, any>>(data: T): (config: Partial<T>) => void {
  return (config) =>
    Object.keys(data).forEach((key) => {
      config[key] !== undefined && ((data as any)[key] = config[key]);
    });
}
export const setCoreConfig = buildConfigSetter(coreConfig);

/**
 *
 * 因为一个action可以触发多个模块的actionHandler，priority属性用来设置handlers的优先处理顺序，通常无需设置
 */
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
export type ActionHandlerList = Record<string, ActionHandler>;

export type ActionHandlerMap = Record<string, ActionHandlerList>;

export type ActionCreator = (...args: any[]) => Action;

export type ActionCreatorList = Record<string, ActionCreator>;

export type ActionCreatorMap = Record<string, ActionCreatorList>;

export interface IModuleHandlers<S = any> {
  readonly moduleName: string;
  readonly initState: S;
  readonly store: IStore;
  destroy(): void;
}

export type Dispatch = (action: Action) => void | Promise<void>;

export type State = Record<string, Record<string, any>>;

export interface GetState<S extends State = {}> {
  (): S;
  (moduleName: string): Record<string, any> | undefined;
}

export interface StoreOptions {
  initState?: Record<string, any>;
}
export interface StoreBuilder<O extends StoreOptions = StoreOptions, B extends BStore = BStore> {
  storeOptions: O;
  storeCreator: (options: O, id?: number) => B;
}

export interface BStore<S extends State = any> {
  id: number;
  builder: StoreBuilder;
  dispatch: Dispatch;
  getState: GetState<S>;
  update: (actionName: string, state: Partial<S>, actionData: any[]) => void;
  destroy(): void;
}

export type IStoreMiddleware = (api: {
  store: IStore;
  getState: GetState;
  dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;

export interface IStore<S extends State = any> extends BStore<S> {
  router: ICoreRouter;
  getCurrentActionName: () => string;
  getCurrentState: GetState<S>;
  injectedModules: {[moduleName: string]: IModuleHandlers};
  loadingGroups: Record<string, TaskCounter>;
  options: {
    middlewares?: IStoreMiddleware[];
  };
}

export interface ICoreRouteState {
  action: string;
  params: any;
}
export interface ICoreRouter {
  routeState: ICoreRouteState;
  startup(store: IStore): void;
  getCurrentStore(): IStore;
  getStoreList(): IStore[];
  readonly name: string;
  latestState: Record<string, any>;
}

export interface CommonModule<ModuleName extends string = string> {
  moduleName: ModuleName;
  model: (store: IStore) => void | Promise<void>;
  state: Record<string, any>;
  params: Record<string, any>;
  actions: Record<string, (...args: any[]) => Action>;
  components: Record<string, EluxComponent | (() => Promise<{default: EluxComponent}>)>;
}

export type ModuleGetter = Record<string, () => CommonModule | Promise<{default: CommonModule}>>;

export type FacadeMap = Record<string, {name: string; actions: ActionCreatorList; actionNames: Record<string, string>}>;

export interface EluxComponent {
  __elux_component__: 'view' | 'component';
}
export function isEluxComponent(data: any): data is EluxComponent {
  return data['__elux_component__'];
}
export const MetaData: {
  facadeMap: FacadeMap;
  moduleGetter: ModuleGetter;
  moduleExists: Record<string, boolean>;
  injectedModules: Record<string, boolean>;
  reducersMap: ActionHandlerMap;
  effectsMap: ActionHandlerMap;
  moduleCaches: Record<string, undefined | CommonModule | Promise<CommonModule>>;
  componentCaches: Record<string, undefined | EluxComponent | Promise<EluxComponent>>;
  currentRouter: ICoreRouter;
} = {
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  facadeMap: null as any,
  moduleGetter: null as any,
  moduleExists: null as any,
  currentRouter: null as any,
};

export function moduleExists(): Record<string, boolean> {
  return MetaData.moduleExists;
}

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
