import env from './env';
import {
  Action,
  EluxComponent,
  AsyncEluxComponent,
  CommonModule,
  CommonModel,
  CommonModelClass,
  ModuleState,
  StoreState,
  IRouter,
  IStore,
  MetaData,
  coreConfig,
  mergeState,
} from './basic';
import {LoadingState} from './utils';
import {getModuleApiMap} from './inject';
import {exportModuleFacade, reducer} from './module';
import {Store} from './store';

/*** @public */
export type GetPromiseModule<T> = T extends Promise<{default: infer R}> ? R : T;

/*** @public */
export type ModuleFacade<TModule extends CommonModule> = {
  name: string;
  components: TModule['components'];
  state: TModule['state'];
  actions: TModule['actions'];
  actionNames: {[K in keyof TModule['actions']]: string};
  data: TModule['data'];
};

/*** @public */
export type Facade<
  G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<{default: CommonModule<N>}>;
  } = any
> = {[K in Extract<keyof G, string>]: ModuleFacade<GetPromiseModule<ReturnType<G[K]>>>};

// type PickHandler<F> = F extends (...args: infer P) => any
//   ? (...args: P) => {
//       type: string;
//     }
//   : never;

// type PickActions<T> = Pick<
//   {[K in keyof T]: PickHandler<T[K]>},
//   {
//     [K in keyof T]: T[K] extends Function ? Exclude<K, 'onActive' | 'onInactive' | 'onMount'> : never;
//   }[keyof T]
// >;

/*** @public */
export type HandlerToAction<T> = T extends (...args: infer P) => any
  ? (...args: P) => {
      type: string;
    }
  : undefined;

/*** @public */
export type PickModelActions<T> = {[K in Exclude<keyof T, 'moduleName' | 'state' | 'onActive' | 'onInactive' | 'onMount'>]: HandlerToAction<T[K]>};

/*** @public */
export type GetPromiseComponent<T> = T extends () => Promise<{default: infer R}> ? R : T;

/*** @public */
export type ReturnComponents<CS extends Record<string, EluxComponent | AsyncEluxComponent>> = {
  [K in keyof CS]: GetPromiseComponent<CS[K]>;
};

export type GetPromiseReturn<T> = T extends Promise<infer R> ? R : T;

/**
 * 向外封装并导出Module
 *
 * @remarks
 * 参数 `components` 支持异步获取组件，当组件代码量大时，可以使用 `import(...)` 返回Promise
 *
 * @param moduleName - 模块名称，不能重复
 * @param ModelClass - Model类，模块必须有一个Model来维护State
 * @param components - EluxUI组件或视图，参见 {@link exportView}
 * @param data - 导出其它任何数据
 *
 * @returns
 * 返回实现 {@link CommonModule} 接口的模块
 *
 * @example
 * ```js
 * import UserModel from './model';
 * import MainView from './views/Main';
 *
 * exportModule('user', UserModel, {main: MainView, list: ()=>import('./views/List')})
 * ```
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function exportModule<
  TModuleName extends string,
  TModel extends CommonModel,
  TComponents extends {[componentName: string]: EluxComponent | AsyncEluxComponent},
  D
>(moduleName: TModuleName, ModelClass: CommonModelClass<TModel>, components: TComponents, data?: D) {
  return exportModuleFacade(moduleName, ModelClass, components, data) as {
    moduleName: TModuleName;
    ModelClass: CommonModelClass;
    state: TModel['state'];
    //state: GetPromiseReturn<ReturnType<TModel['onInit']>>;
    actions: PickModelActions<TModel>;
    components: ReturnComponents<TComponents>;
    data: D;
  };
}

export type ILoadComponent<TFacade extends Facade = {}> = <M extends keyof TFacade, V extends keyof TFacade[M]['components']>(
  moduleName: M,
  componentName: V,
  options?: {onError?: Elux.Component<{message: string}>; onLoading?: Elux.Component<{}>}
) => TFacade[M]['components'][V];

/*** @public */
export type API<TFacade extends Facade> = {
  State: {[N in keyof TFacade]?: TFacade[N]['state']};
  GetActions<N extends keyof TFacade>(...args: N[]): {[K in N]: TFacade[K]['actions']};
  LoadComponent: ILoadComponent<TFacade>;
  Modules: {[N in keyof TFacade]: Pick<TFacade[N], 'name' | 'actions' | 'actionNames' | 'data'>};
  Actions: {[N in keyof TFacade]: keyof TFacade[N]['actions']};
};

/**
 * 获取应用全局方法
 *
 * @remarks
 * 参数 `components` 支持异步获取组件，当组件代码量大时，可以使用 `import(...)` 返回Promise
 *
 * @param demoteForProductionOnly - 用于不支持Proxy的运行环境，参见：`兼容IE浏览器`
 * @param injectActions -  用于不支持Proxy的运行环境，参见：`兼容IE浏览器`
 *
 * @returns
 * 返回包含多个全局方法的结构体：
 *
 * - `LoadComponent`：用于加载其它模块导出的{@link exportView | EluxUI组件}，参见 {@link LoadComponent}。
 * 相比直接 `import`，使用此方法加载组件不仅可以`按需加载`，而且还可以自动初始化其所属 Model，例如：
 * ```js
 *   const Article = LoadComponent('article', 'main')
 * ```
 *
 * - `Modules`：用于获取所有模块的对外接口，参见 {@link FacadeModules}，例如：
 * ```js
 *   dispatch(Modules.article.actions.refresh())
 * ```
 *
 * - `GetActions`：当需要 dispatch 多个 module 的 action 时，例如：
 * ```js
 *   dispatch(Modules.a.actions.a1())
 *   dispatch(Modules.b.actions.b1())
 * ```
 *   这种写法可以简化为：
 * ```js
 *   const {a, b} = GetActions('a', 'b')
 *   dispatch(a.a1())
 *   dispatch(b.b1())
 * ```
 *
 * - `GetRouter`：用于获取全局Roter，注意此方法不能运行在SSR（`服务端渲染`）中，因为服务端每个 `request` 都将生成一个 Router，不存在全局 Roter，请使用 `useRouter()`
 *
 * - `useRouter`：React Hook，用于获取当前 Router，在CSR（`客户端渲染`）中，因为只存在一个Router，所以其值等于`GetRouter()`，例如：
 * ```js
 *   const blobalRouter = GetRouter()
 *   const currentRouter = useRouter()
 *   console.log(blobalRouter===currentRouter)
 * ```
 *
 * - `useStore`：React Hook，用于获取当前 Store，例如：
 * ```js
 *   const store = useStore()
 *   store.dispatch(Modules.article.actions.refresh())
 * ```
 *
 * @example
 * ```js
 * const {Modules, LoadComponent, GetActions, GetRouter, useStore, useRouter} = getApi<API, Router>();
 * ```
 *
 * @public
 */
export function getApi<TAPI extends {State: any; GetActions: any; LoadComponent: any; Modules: any}>(
  demoteForProductionOnly?: boolean,
  injectActions?: Record<string, string[]>
): Pick<TAPI, 'GetActions' | 'LoadComponent' | 'Modules'> & {
  GetClientRouter: () => IRouter;
  useRouter: () => IRouter;
  useStore: () => IStore<TAPI['State']>;
} {
  const modules = getModuleApiMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: (...args: string[]) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetClientRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use useRouter() instead';
      }
      return MetaData.clientRouter!;
    },
    LoadComponent: coreConfig.LoadComponent,
    Modules: modules,
    useRouter: coreConfig.UseRouter!,
    useStore: coreConfig.UseStore!,
  };
}

/**
 * Model基类
 *
 * @remarks
 * Model基类中提供了一些常用的方法，泛型参数：
 *
 * - `TModuleState`: 本模块的状态结构
 *
 * - `TStoreState`: 全局状态结构
 *
 * @typeParam TModuleState - 本模块的状态结构
 * @typeParam TRouteParams - 本模块的路由参数结构
 * @typeParam TStoreState - 全局状态结构
 *
 * @public
 */
export abstract class BaseModel<TModuleState extends ModuleState = {}, TStoreState extends StoreState = {}> implements CommonModel {
  protected readonly store: IStore<TStoreState>;

  public get state(): TModuleState {
    return this.store.getState(this.moduleName) as any;
  }

  constructor(public readonly moduleName: string, store: IStore) {
    this.store = store as any;
  }

  public abstract onMount(env: 'init' | 'route' | 'update'): void | Promise<void>;

  public onActive(): void {
    return;
  }

  public onInactive(): void {
    return;
  }

  protected getRouter(): IRouter<TStoreState> {
    return this.store.router;
  }

  protected getPrevState(): TModuleState | undefined {
    const runtime = this.store.router.runtime;
    return runtime.prevState[this.moduleName] as TModuleState;
  }

  protected getRootState(type?: 'previous' | 'uncommitted'): TStoreState {
    const runtime = this.store.router.runtime;
    let state: StoreState;
    if (type === 'previous') {
      state = runtime.prevState;
    } else if (type === 'uncommitted') {
      state = this.store.getUncommittedState();
    } else {
      state = this.store.getState();
    }
    return state as TStoreState;
  }

  /**
   * 获取本模块的`公开actions`构造器
   */
  protected get actions(): PickModelActions<this> {
    return MetaData.moduleApiMap[this.moduleName].actions as any;
  }

  /**
   * 获取本模块的`私有actions`构造器
   *
   * @remarks
   * 有些 action 只在本 Model 内部调用，应将其定义为 protected 或 private 权限，将无法通过 `this.actions` 获得其构造器，此时可以使用 `this.getPrivateActions(...)`
   *
   * @example
   * ```js
   * const privateAction = this.getPrivateActions({renameUser: this.renameUser});
   * this.dispatch(privateAction.renameUser('jimmy'))
   * ```
   */
  protected getPrivateActions<T extends Record<string, Function>>(
    actionsMap: T
  ): {[K in keyof T]: HandlerToAction<T[K]>} & {
    _initState(state: TModuleState): Action;
    _updateState(subject: string, state: Partial<TModuleState>): Action;
    _loadingState(loadingState: {[group: string]: LoadingState}): Action;
  } {
    return MetaData.moduleApiMap[this.moduleName].actions as any;
  }

  /**
   * 获取当前触发的action.type
   */
  protected getCurrentAction(): Action {
    const store: Store = this.store as any;
    return store.getCurrentAction();
  }

  protected dispatch(action: Action): void | Promise<void> {
    return this.store.dispatch(action);
  }

  @reducer
  protected _initState(state: TModuleState): TModuleState {
    return state;
  }

  @reducer
  protected _updateState(subject: string, state: Partial<TModuleState>): TModuleState {
    return mergeState(this.state, state);
  }

  @reducer
  protected _loadingState(loadingState: {[group: string]: LoadingState}): TModuleState {
    return mergeState(this.state, loadingState);
  }
}
