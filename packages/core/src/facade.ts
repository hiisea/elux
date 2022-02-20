import {
  CommonModel,
  CommonModule,
  CommonModelClass,
  EluxComponent,
  AsyncEluxComponent,
  UStore,
  MetaData,
  EStore,
  Action,
  mergeState,
  ModuleState,
  RootState,
  RouteState,
} from './basic';
import {reducer, ActionTypes} from './actions';
import {baseExportModule} from './modules';
import {loadModel} from './inject';

/*** @public */
export type PickHandler<F> = F extends (...args: infer P) => any
  ? (...args: P) => {
      type: string;
    }
  : never;

/*** @public */
export type PickActions<T> = Pick<
  {[K in keyof T]: PickHandler<T[K]>},
  {
    [K in keyof T]: T[K] extends Function ? Exclude<K, 'destroy' | 'init'> : never;
  }[keyof T]
>;

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
  return baseExportModule(moduleName, ModelClass, components, data) as {
    moduleName: TModuleName;
    initModel: (store: UStore) => void | Promise<void>;
    state: ReturnType<TModel['init']>;
    routeParams: TModel['defaultRouteParams'];
    actions: PickActions<TModel>;
    components: TComponents;
    data: D;
  };
}

/*** @public */
export type GetPromiseComponent<T> = T extends () => Promise<{default: infer R}> ? R : T;

/*** @public */
export type ReturnComponents<CS extends Record<string, EluxComponent | (() => Promise<{default: EluxComponent}>)>> = {
  [K in keyof CS]: GetPromiseComponent<CS[K]>;
};

/*** @public */
export type ModuleAPI<M extends CommonModule> = {
  name: string;
  components: ReturnComponents<M['components']>;
  state: M['state'];
  actions: M['actions'];
  actionNames: {[K in keyof M['actions']]: string};
  routeParams: M['routeParams'];
  data: M['data'];
};

/*** @public */
export type GetPromiseModule<T> = T extends Promise<{default: infer R}> ? R : T;

/*** @public */
export type Facade<
  G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<{default: CommonModule<N>}>;
  } = any
> = {[K in Extract<keyof G, string>]: ModuleAPI<GetPromiseModule<ReturnType<G[K]>>>};

/**
 * EluxUI组件加载器
 *
 * @remarks
 * 用于加载其它模块导出的{@link exportView | EluxUI组件}，相比直接 `import`，使用此方法加载组件不仅可以`按需加载`，
 * 而且还可以自动初始化其所属 Model，参见 {@link getApi}，例如：
 * ```js
 *   const Article = LoadComponent('article', 'main')
 * ```
 *
 * @param moduleName - 组件所属模块名
 * @param componentName - 组件导出名，参见{@link exportModule}
 * @param options - 加载参数，参见{@link LoadComponentOptions}
 *
 * @public
 */
export type LoadComponent<F extends Facade = {}, TOptions = any> = <M extends keyof F, V extends keyof F[M]['components']>(
  moduleName: M,
  componentName: V,
  options?: TOptions
) => F[M]['components'][V];

/*** @public */
export type FacadeActions<F extends Facade, R extends string> = {[K in Exclude<keyof F, R>]: keyof F[K]['actions']};

/*** @public */
export type FacadeRoutes<F extends Facade, R extends string> = {[K in Exclude<keyof F, R>]?: F[K]['routeParams']};

/*** @public */
export type FacadeModules<F extends Facade, R extends string> = {[K in Exclude<keyof F, R>]: Pick<F[K], 'name' | 'actions' | 'actionNames' | 'data'>};

/*** @public */
export type FacadeStates<F extends Facade, R extends string> = {
  [K in keyof F]: K extends R ? RouteState<FacadeRoutes<F, R>, F[R]['data']> : F[K]['state'];
};

/*** @public */
export type HandlerThis<T> = T extends (...args: infer P) => any
  ? (...args: P) => {
      type: string;
    }
  : undefined;

/*** @public */
export type ActionsThis<T> = {[K in keyof T]: HandlerThis<T[K]>};

/**
 * Model基类
 *
 * @remarks
 * Model基类中提供了一些常用的方法，泛型参数：
 *
 * - `TModuleState`: 本模块的状态结构
 *
 * - `TRouteParams`: 本模块的路由参数结构
 *
 * - `TRootState`: 全局状态结构
 *
 * @typeParam TModuleState - 本模块的状态结构
 * @typeParam TRouteParams - 本模块的路由参数结构
 * @typeParam TRootState - 全局状态结构
 *
 * @public
 */
export abstract class BaseModel<TModuleState extends ModuleState = {}, TRouteParams extends ModuleState = {}, TRootState extends RootState = {}>
  implements CommonModel
{
  /**
   * 本模块路由参数默认值
   *
   * @remarks
   * 实际路由参数由 URL 传值 + 默认值 `deepMerge` 所得
   *
   */
  abstract defaultRouteParams: TRouteParams;
  /**
   * 计算并返回本模块状态初始值
   *
   * @remarks
   * 模块初始化时将调用此方法获取状态初始值（同一个 Store 中，每个模块只会执行一次初始化）
   *
   * 此方法除了返回状态初始值之外，还可以执行一些其它初始化动作（如果有某些副作用，请记得在{@link BaseModel.destroy | BaseModel.destroy()}中清除）
   *
   * @param latestState - 当前最新的全局状态（多个Store合并后的状态）
   * @param preState - 提前预置的全局状态（通常用于SSR时传递脱水状态）
   */
  abstract init(latestState: RootState, preState: RootState): TModuleState;

  constructor(public readonly moduleName: string, public store: UStore) {}

  /**
   * 获取全局状态
   *
   * @remarks
   * 以下三者都是获取全局状态，请注意它们之间的区别：
   *
   * - {@link BaseModel.getRootState | getRootState(): TRootState}
   *
   * - {@link BaseModel.getUncommittedState | getUncommittedState(): TRootState}
   *
   * - {@link BaseModel.getLatestState | getLatestState(): TRootState}
   *
   * - `getRootState()` VS `getUncommittedState()`：
   * 当一个 action 触发多个不同 Module 的 reducer 时，这些 reducer 将顺序执行并返回新的 ModuleState，
   * 当所有 reducer 执行完毕时，最后才一次性 commit 至 store 。所以在执行 commit 之前，通过 getRootState() 得到的依然是原数据，而通过 getUncommittedState() 得到的是实时数据。
   * 比如：ModuleA、ModuleB 都监听了 action(`stage.putUser`)，ModuleA 先执行了 reducer 并返回了 NewModuleAState，
   * 然后 ModuleB 执行 reducer 时，它想通过 getRootState() 获取 NewModuleAState 是无效的，因为此时 NewModuleAState 还未 commit，此时使用 getUncommittedState() 可以获得更实时的状态。
   *
   * - `getUncommittedState()`：在可变数据（MutableData）模式下（如VUE）无使用的意义，因为可变数据是实时修改的，不存在 commit 的边界。
   *
   * - `getRootState()` VS `getLatestState()`：使用虚拟多页时，每个 `EWindow` 对应一个独立的 store，每个 store 都有自己独立的 RootState。
   * `getRootState()` 只能得到自己 store 的 RootState，而 `getLatestState()` 得到的是所有 store 合并后的 RootState，一般用于涉及跨 `EWindow` 之间的场景。
   *
   */
  protected getLatestState(): TRootState {
    return (this.store as EStore).router.latestState as TRootState;
  }

  /** {@inheritDoc BaseModel.getLatestState} */
  protected getRootState(): TRootState {
    return this.store.getState() as TRootState;
  }

  /** {@inheritDoc BaseModel.getLatestState} */
  protected getUncommittedState(): TRootState {
    return (this.store as EStore).getUncommittedState();
  }

  /**
   * 获取本模块的状态
   *
   * @remarks
   * 此方法是 {@link BaseModel.getRootState | getRootState(this.moduleName)} 的快捷调用
   *
   */
  protected getState(): TModuleState {
    return this.store.getState(this.moduleName) as TModuleState;
  }

  /**
   * 获取本模块的`公开actions`构造器
   */
  protected get actions(): ActionsThis<this> {
    return MetaData.moduleMap[this.moduleName].actions as any;
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
  protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {[K in keyof T]: PickHandler<T[K]>} {
    return MetaData.moduleMap[this.moduleName].actions as any;
  }

  /**
   * 获取当前{@link URouter | Router}
   *
   * @returns
   * {@link URouter | Router}
   */
  protected get router(): unknown {
    return (this.store as EStore).router;
  }

  /**
   * 获取本模块当前路由参数
   */
  protected getRouteParams(): TRouteParams {
    return this.store.getRouteParams(this.moduleName) as TRouteParams;
  }

  /**
   * 获取当前触发的action.type
   */
  protected getCurrentActionName(): string {
    return (this.store as EStore).getCurrentActionName();
  }

  /**
   * 等同于this.store.dispatch(action)
   */
  protected dispatch(action: Action): void | Promise<void> {
    return this.store.dispatch(action);
  }

  // protected dispatch(action: Action): void | Promise<void> {
  //   return this.router.getCurrentStore().dispatch(action);
  // }

  /**
   * 手动加载并初始化一个Model
   *
   * @remarks
   * 参见 {@link loadModel}，通常情况下无需手动加载，因为以下2种情况都将自动加载：
   *
   * - {@link Dispatch} 一个 ModuleA.xxxAction 时，如果 ModuleA 未被注册，将自动加载 ModuleA 并初始化其 Model
   *
   * - UI Render一个通过 {@link LoadComponent} 加载的ModuleA-UI组件，如果 ModuleA 未被注册，将自动加载 ModuleA 并初始化其 Model
   *
   * @param moduleName - 要加载的 module 名称
   *
   */
  protected loadModel(moduleName: string): void | Promise<void> {
    return loadModel(moduleName, this.store);
  }

  // protected getRouteParams(): ModuleState | undefined {
  //   return this.store.getRouteParams(this.moduleName);
  //   // const route = this.store.getRouteParams(this.moduleName);
  //   // return route.params[this.moduleName];
  // }

  /**
   * reducer-监听模块的InitAction，注入初始状态
   *
   * @remarks
   * - 同一个 Store 中，每个模块只会执行初始化一次，触发一次 `xxx.Init` 的 action
   *
   * - 在虚拟多页下，新建一个 `EWindow` 将自动新建一个 Store
   */
  @reducer
  public [ActionTypes.MInit](initState: TModuleState): TModuleState {
    return initState;
  }

  /**
   * reducer-监听模块的LoadingAction，维护Loading状态
   *
   * @remarks
   * 同一个模块可以有多个{@link LoadingState}
   */
  @reducer
  public [ActionTypes.MLoading](payload: {[groupKey: string]: string}): TModuleState {
    const state = this.getState();
    const loading = mergeState(state.loading, payload);
    return mergeState(state, {loading});
  }

  /**
   * 本Model实例被销毁时自动执行的Hook钩子
   *
   * @remarks
   * 使用虚拟多页 `EWindow` 被出栈时，其对应的 Store 将被 destroy，该 Store 中被注入的 Model 也将被 destroy，
   * 通常用来清理 {@link BaseModel.init | BaseModel.init()} 中执行的副作用
   *
   */
  public destroy(): void {
    return;
  }
}
