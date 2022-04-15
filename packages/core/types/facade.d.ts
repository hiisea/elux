import { Action, AsyncEluxComponent, CommonModel, CommonModelClass, CommonModule, EluxComponent, IRouter, IStore, ModuleState, StoreState } from './basic';
import { LoadingState } from './utils';
/*** @public */
export declare type GetPromiseModule<T> = T extends Promise<{
    default: infer R;
}> ? R : T;
/*** @public */
export declare type ModuleFacade<TModule extends CommonModule> = {
    name: string;
    components: TModule['components'];
    state: TModule['state'];
    actions: TModule['actions'];
    actionNames: {
        [K in keyof TModule['actions']]: string;
    };
    data: TModule['data'];
};
/*** @public */
export declare type Facade<G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<{
        default: CommonModule<N>;
    }>;
} = any> = {
    [K in Extract<keyof G, string>]: ModuleFacade<GetPromiseModule<ReturnType<G[K]>>>;
};
/*** @public */
export declare type HandlerToAction<T> = T extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : undefined;
/*** @public */
export declare type PickModelActions<T> = {
    [K in Exclude<keyof T, 'moduleName' | 'state' | 'onActive' | 'onInactive' | 'onMount'>]: HandlerToAction<T[K]>;
};
/*** @public */
export declare type GetPromiseComponent<T> = T extends () => Promise<{
    default: infer R;
}> ? R : T;
/*** @public */
export declare type ReturnComponents<CS extends Record<string, EluxComponent | AsyncEluxComponent>> = {
    [K in keyof CS]: GetPromiseComponent<CS[K]>;
};
export declare type GetPromiseReturn<T> = T extends Promise<infer R> ? R : T;
/**
 * 向外封装并导出Module
 *
 * @param moduleName - 模块名称，不能重复
 * @param ModelClass - Model构造类
 * @param components - 导出的组件或视图，参见 {@link exportView}，当组件代码量大时可以使用`import(...)`异步组件
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
export declare function exportModule<TModuleName extends string, TModel extends CommonModel, TComponents extends {
    [componentName: string]: EluxComponent | AsyncEluxComponent;
}, D>(moduleName: TModuleName, ModelClass: CommonModelClass<TModel>, components: TComponents, data?: D): {
    moduleName: TModuleName;
    ModelClass: CommonModelClass;
    state: TModel['state'];
    actions: PickModelActions<TModel>;
    components: ReturnComponents<TComponents>;
    data: D;
};
/**
 * UI组件加载器
 *
 * @remarks
 * 该方法可通过{@link getApi}获得，用于加载其它模块导出的{@link exportView | UI组件}，相比直接 `import`，使用此方法加载组件不仅可以`按需加载`，
 * 还可以自动初始化其所属 Model（仅当加载组件为view时），例如：
 * ```js
 *   const Article = LoadComponent('article', 'main')
 * ```
 *
 * @param moduleName - 组件所属模块名
 * @param componentName - 组件导出名，参见{@link exportModule}
 * @param options - 加载中和加载错误时显示的组件，默认使用全局的设置，参见 {@link UserConfig} 中的设置
 *
 * @public
 */
export declare type ILoadComponent<TFacade extends Facade = {}> = <M extends keyof TFacade, V extends keyof TFacade[M]['components']>(moduleName: M, componentName: V, options?: {
    onError?: Elux.Component<{
        message: string;
    }>;
    onLoading?: Elux.Component<{}>;
}) => TFacade[M]['components'][V];
/*** @public */
export declare type API<TFacade extends Facade> = {
    State: {
        [N in keyof TFacade]?: TFacade[N]['state'];
    };
    GetActions<N extends keyof TFacade>(...args: N[]): {
        [K in N]: TFacade[K]['actions'];
    };
    LoadComponent: ILoadComponent<TFacade>;
    Modules: {
        [N in keyof TFacade]: Pick<TFacade[N], 'name' | 'actions' | 'actionNames' | 'data'>;
    };
    Actions: {
        [N in keyof TFacade]: keyof TFacade[N]['actions'];
    };
};
/**
 * 获取应用全局方法
 *
 * @remarks
 * 通常不需要参数，仅在兼容不支持Proxy的环境中需要传参
 *
 * @param demoteForProductionOnly - 用于不支持Proxy的运行环境，参见：`兼容IE浏览器`
 * @param injectActions -  用于不支持Proxy的运行环境，参见：`兼容IE浏览器`
 *
 * @returns
 * 返回包含多个全局方法的结构体：
 *
 * - `LoadComponent`：用于加载其它模块导出的{@link exportView | UI组件}，参见 {@link ILoadComponent}。
 *
 * - `Modules`：用于获取所有模块的对外接口，参见 {@link ModuleFacade}，例如：
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
 * - `GetClientRouter`：在CSR（`客户端渲染`）环境中用于获取全局Router。
 *
 * - `useRouter`：用于在 UI Render 中获取当前 Router，在CSR（`客户端渲染`）中其值等于`GetClientRouter()`，例如：
 * ```js
 *   const globalRouter = GetClientRouter()
 *   const currentRouter = useRouter()
 *   console.log(blobalRouter===currentRouter)
 * ```
 *
 * - `useStore`：用于在 UI Render 中获取当前 Store，例如：
 * ```js
 *   const store = useStore()
 *   store.dispatch(Modules.article.actions.refresh())
 * ```
 *
 * @example
 * ```js
 * const {Modules, LoadComponent, GetActions, GetClientRouter, useStore, useRouter} = getApi<API>();
 * ```
 *
 * @public
 */
export declare function getApi<TAPI extends {
    State: any;
    GetActions: any;
    LoadComponent: any;
    Modules: any;
}>(demoteForProductionOnly?: boolean, injectActions?: Record<string, string[]>): Pick<TAPI, 'GetActions' | 'LoadComponent' | 'Modules'> & {
    GetClientRouter: () => IRouter;
    useRouter: () => IRouter;
    useStore: () => IStore<TAPI['State']>;
};
/**
 * 实现了CommonModel的Model基类
 *
 * @remarks
 * Model基类实现了{@link CommonModel}，并提供了一些常用的方法
 *
 * @public
 */
export declare abstract class BaseModel<TModuleState extends ModuleState = {}, TStoreState extends StoreState = {}> implements CommonModel {
    readonly moduleName: string;
    /**
     * 被关联的 store
     */
    protected readonly store: IStore<TStoreState>;
    /**
     * 当前模块的状态
     */
    get state(): TModuleState;
    constructor(moduleName: string, store: IStore);
    /**
     * 该 model 被挂载到 store 时触发，在一个 store 中 一个 model 只会被挂载一次
     */
    abstract onMount(env: 'init' | 'route' | 'update'): void | Promise<void>;
    /**
     * 当某 store 被路由置于最顶层时，所有该 store 中被挂载的 model 会触发
     */
    onActive(): void;
    /**
     * 当某 store 被路由置于非顶层时，所有该 store 中被挂载的 model 会触发
     */
    onInactive(): void;
    /**
     * 获取关联的 Router
     */
    protected getRouter(): IRouter<TStoreState>;
    /**
     * 获取本模块路由跳转之前的状态
     */
    protected getPrevState(): TModuleState | undefined;
    /**
     * 获取 Store 的全部状态
     *
     * @param type - 不传表示当前状态，previous表示路由跳转之前的状态，uncommitted表示未提交的状态
     *
     */
    protected getRootState(type?: 'previous' | 'uncommitted'): TStoreState;
    /**
     * 获取本模块的`公开actions`构造器
     */
    protected get actions(): PickModelActions<this>;
    /**
     * 获取本模块的`私有actions`构造器
     *
     * @remarks
     * 有些 action 只在本 Model 内部调用，应将其定义为 protected 或 private 权限，此时将无法通过 `this.actions` 调用，可以使用 `this.getPrivateActions(...)`
     *
     * @example
     * ```js
     * const privateAction = this.getPrivateActions({renameUser: this.renameUser});
     * this.dispatch(privateAction.renameUser('jimmy'))
     * ```
     */
    protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {
        [K in keyof T]: HandlerToAction<T[K]>;
    } & {
        _initState(state: TModuleState): Action;
        _updateState(subject: string, state: Partial<TModuleState>): Action;
        _loadingState(loadingState: {
            [group: string]: LoadingState;
        }): Action;
    };
    /**
     * 获取当前触发的action.type
     *
     * @remarks
     * 当一个 ActionHandler 监听了多个 Action 时，可以使用此方法区别当前 Action
     */
    protected getCurrentAction(): Action;
    /**
     * 等同于this.store.dispatch(action)
     */
    protected dispatch(action: Action): void | Promise<void>;
    /**
     * reducer 监听 `moduleName._initState` Action，注入初始状态
     *
     * @remarks
     * model 被挂载到 store 时会派发 `moduleName._initState` Action
     */
    protected _initState(state: TModuleState): TModuleState;
    /**
     * reducer 监听 `moduleName._updateState Action`，合并至当前状态
     */
    protected _updateState(subject: string, state: Partial<TModuleState>): TModuleState;
    /**
     * reducer 监听 `moduleName._loadingState` Action，合并至当前状态
     *
     * @remarks
     * 执行 effect 时会派发 `moduleName._loadingState` Action
     */
    protected _loadingState(loadingState: {
        [group: string]: LoadingState;
    }): TModuleState;
}
//# sourceMappingURL=facade.d.ts.map