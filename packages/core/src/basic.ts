import env from './env';
import {LoadingState, TaskCounter, deepMerge, warn} from './sprite';

export const coreConfig: {
  NSP: string;
  MSP: string;
  MutableData: boolean;
  DepthTimeOnLoading: number;
} = {
  NSP: '.',
  MSP: ',',
  MutableData: false,
  DepthTimeOnLoading: 2,
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

export interface IModuleHandlers {
  moduleName: string;
  readonly initState: any;
  store: IStore;
}

export type Dispatch = (action: Action) => void | Promise<void>;

export type State = Record<string, Record<string, any>>;

export interface GetState<S extends State = {}> {
  (): S;
  (moduleName: string): Record<string, any> | undefined;
}
export interface BStoreOptions {
  initState?: Record<string, any>;
}

export interface BStore<S extends Record<string, any> = {}> {
  getState(): S;
  getPureState(): S;
  update: (actionName: string, state: S, actionData: any[]) => void;
  dispatch: (action: Action) => any;
  clone: {creator: (options: {initState: any}) => BStore; options: {initState?: any}};
  replaceState(state: S): void;
}

export type IStoreMiddleware = (api: {getState: GetState; dispatch: Dispatch}) => (next: Dispatch) => (action: Action) => void | Promise<void>;

export interface IStore<S extends State = {}> {
  dispatch: Dispatch;
  getState: GetState<S>;
  getPureState(): S;
  update: (actionName: string, state: Partial<S>, actionData: any[]) => void;
  replaceState(state: S): void;
  injectedModules: Record<string, IModuleHandlers>;
  getCurrentActionName: () => string;
  getCurrentState: GetState<S>;
  clone: {
    creator: (options: {initState: any}) => BStore;
    options: {initState?: any};
    middlewares?: IStoreMiddleware[];
    injectedModules: {[moduleName: string]: IModuleHandlers};
  };
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

/**
 * 框架内置的几个ActionTypes
 */
export const ActionTypes = {
  /**
   * 为模块注入加载状态时使用ActionType：{moduleName}.{MLoading}
   */
  MLoading: 'Loading',
  /**
   * 模块初始化时使用ActionType：{moduleName}.{MInit}
   */
  MInit: 'Init',
  /**
   * 模块初始化时使用ActionType：{moduleName}.{MReInit}
   */
  MReInit: 'ReInit',
  /**
   * 全局捕获到错误时使用ActionType：{Error}
   */
  Error: `Elux${coreConfig.NSP}Error`,
  Replace: `Elux${coreConfig.NSP}Replace`,
};
export function errorAction(error: Object): Action {
  return {
    type: ActionTypes.Error,
    payload: [error],
  };
}
export function moduleInitAction(moduleName: string, initState: any): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MInit}`,
    payload: [initState],
  };
}
export function moduleReInitAction(moduleName: string, initState: any): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MReInit}`,
    payload: [initState],
  };
}
export function moduleLoadingAction(moduleName: string, loadingState: {[group: string]: LoadingState}): Action {
  return {
    type: `${moduleName}${coreConfig.NSP}${ActionTypes.MLoading}`,
    payload: [loadingState],
  };
}
export interface EluxComponent {
  __elux_component__: 'view' | 'component';
}
export function isEluxComponent(data: any): data is EluxComponent {
  return data['__elux_component__'];
}
export const MetaData: {
  facadeMap: FacadeMap;
  appModuleName: string;
  // appViewName: string;
  moduleGetter: ModuleGetter;
  injectedModules: Record<string, boolean>;
  reducersMap: ActionHandlerMap;
  effectsMap: ActionHandlerMap;
  moduleCaches: Record<string, undefined | CommonModule | Promise<CommonModule>>;
  componentCaches: Record<string, undefined | EluxComponent | Promise<EluxComponent>>;
  loadings: Record<string, TaskCounter>;
} = {
  appModuleName: 'stage',
  injectedModules: {},
  reducersMap: {},
  effectsMap: {},
  moduleCaches: {},
  componentCaches: {},
  facadeMap: null as any,
  moduleGetter: null as any,
  loadings: {},
};

function transformAction(actionName: string, handler: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlerMap) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (actionHandlerMap[actionName][listenerModule]) {
    warn(`Action duplicate or conflict : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = handler;
}

export function injectActions(moduleName: string, handlers: ActionHandlerList): void {
  const injectedModules = MetaData.injectedModules;
  if (injectedModules[moduleName]) {
    return;
  }
  injectedModules[moduleName] = true;
  // eslint-disable-next-line no-restricted-syntax
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];
      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(coreConfig.MSP).forEach((actionName) => {
          actionName = actionName.trim().replace(new RegExp(`^this[${coreConfig.NSP}]`), `${moduleName}${coreConfig.NSP}`);
          const arr = actionName.split(coreConfig.NSP);
          if (arr[1]) {
            // handler.__isHandler__ = true;
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap);
          } else {
            // handler.__isHandler__ = false;
            transformAction(
              moduleName + coreConfig.NSP + actionName,
              handler,
              moduleName,
              handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap
            );
            // addModuleActionCreatorList(moduleName, actionName);
          }
        });
      }
    }
  }
  // return MetaData.facadeMap[moduleName].actions;
}

/**
 * 手动设置Loading状态，同一个key名的loading状态将自动合并
 * - 参见LoadingState
 * @param item 一个Promise加载项
 * @param moduleName moduleName+groupName合起来作为该加载项的key
 * @param groupName moduleName+groupName合起来作为该加载项的key
 */
export function setLoading<T extends Promise<any>>(store: IStore, item: T, moduleName: string, groupName: string): T {
  const key = moduleName + coreConfig.NSP + groupName;
  const loadings = MetaData.loadings;
  if (!loadings[key]) {
    loadings[key] = new TaskCounter(coreConfig.DepthTimeOnLoading);
    loadings[key].addListener((loadingState) => {
      const action = moduleLoadingAction(moduleName, {[groupName]: loadingState});
      store.dispatch(action);
    });
  }
  loadings[key].addItem(item);
  return item;
}

export function reducer(target: any, key: string, descriptor: PropertyDescriptor): any {
  if (!key && !descriptor) {
    key = target.key;
    descriptor = target.descriptor;
  }
  const fun = descriptor.value as ActionHandler;
  // fun.__actionName__ = key;
  fun.__isReducer__ = true;
  descriptor.enumerable = true;
  return target.descriptor === descriptor ? target : descriptor;
}
/**
 * 一个类方法的装饰器，用来指示该方法为一个effectHandler
 * - effectHandler必须通过dispatch Action来触发
 * @param loadingKey 注入加载状态到state，如果为null表示不注入加载状态，默认为'app.loading.global'
 */
export function effect(loadingKey: string | null = 'app.loading.global'): Function {
  let loadingForModuleName: string | undefined;
  let loadingForGroupName: string | undefined;
  if (loadingKey !== null) {
    [loadingForModuleName, , loadingForGroupName] = loadingKey.split('.');
  }
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun = descriptor.value as ActionHandler;
    // fun.__actionName__ = key;
    fun.__isEffect__ = true;
    descriptor.enumerable = true;
    if (loadingForModuleName && loadingForGroupName && !env.isServer) {
      // eslint-disable-next-line no-inner-declarations
      function injectLoading(this: IModuleHandlers, curAction: Action, promiseResult: Promise<any>) {
        if (loadingForModuleName === 'app') {
          loadingForModuleName = MetaData.appModuleName;
        } else if (loadingForModuleName === 'this') {
          loadingForModuleName = this.moduleName;
        }
        setLoading(this.store, promiseResult, loadingForModuleName!, loadingForGroupName!);
      }
      if (!fun.__decorators__) {
        fun.__decorators__ = [];
      }
      fun.__decorators__.push([injectLoading, null]);
    }
    return target.descriptor === descriptor ? target : descriptor;
  };
}
export const mutation = reducer;
export const action = effect;
/**
 * 一个类方法的装饰器，用来向effect中注入before和after的钩子
 * - 注意不管该handler是否执行成功，前后钩子都会强制执行
 * @param before actionHandler执行前的钩子
 * @param after actionHandler执行后的钩子
 */
export function logger(
  before: (action: Action, promiseResult: Promise<any>) => void,
  after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
) {
  return (target: any, key: string, descriptor: PropertyDescriptor): void => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun: ActionHandler = descriptor.value;
    if (!fun.__decorators__) {
      fun.__decorators__ = [];
    }
    fun.__decorators__.push([before, after]);
  };
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

// export function snapshotState(target: any) {
//   if (coreConfig.MutableData) {
//     return JSON.parse(JSON.stringify(target));
//   }
//   return target;
// }
