import { Action, AsyncEluxComponent, Dispatch, EluxComponent, IModel, IModelClass, IModule, IRouter, IStore, ModuleState, StoreState } from './basic';
import { LoadingState } from './utils';
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
/*** @public */
export declare type GetPromiseModule<T> = T extends Promise<{
    default: infer R;
}> ? R : T;
/*** @public */
export declare type ModuleFacade<TModule extends IModule> = {
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
    [N in Extract<keyof G, string>]: () => IModule<N> | Promise<{
        default: IModule<N>;
    }>;
} = any> = {
    [K in Extract<keyof G, string>]: ModuleFacade<GetPromiseModule<ReturnType<G[K]>>>;
};
/*** @public */
export declare type HandlerToAction<T> = T extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
/*** @public */
export declare type PickPublicActions<T> = {
    [K in Exclude<keyof T, `_${string}` | keyof IModel>]: HandlerToAction<T[K]>;
};
/*** @public */
export declare type PickThisActions<T> = {
    [K in Exclude<keyof T, keyof IModel>]: HandlerToAction<T[K]>;
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
 * @param components - 导出的组件或视图，参见 {@link exportView}
 * @param data - 导出其它任何数据
 *
 * @returns
 * 返回实现 {@link CommonModule} 接口的微模块
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
export declare function exportModule<TModuleName extends string, TModel extends IModel<S>, TComponents extends {
    [componentName: string]: EluxComponent | AsyncEluxComponent;
}, S, D>(moduleName: TModuleName, ModelClass: IModelClass<TModel>, components: TComponents, data?: D): {
    moduleName: TModuleName;
    ModelClass: IModelClass;
    state: S;
    actions: PickPublicActions<TModel>;
    components: ReturnComponents<TComponents>;
    data: D;
};
/**
 * 加载指定模块的UI组件
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
/**
 * 获取指定模块的UI组件
 *
 * @remarks
 * 该方法可通过{@link getApi}获得，用于获取其它模块导出的{@link exportView | UI组件}，例如：
 *
 * ```js
 *   const Article = GetComponent('article', 'main')
 * ```
 *
 * 不同于{@link ILoadComponent}，该方法仅获取组建，并不Render它
 *
 * @param moduleName - 组件所属模块名
 * @param componentName - 组件导出名，参见{@link exportModule}
 *
 * @public
 */
export declare type IGetComponent<TFacade extends Facade = {}> = <M extends keyof TFacade, V extends keyof TFacade[M]['components']>(moduleName: M, componentName: V) => Promise<TFacade[M]['components'][V]>;
/**
 * 获取指定模块导出的Data
 *
 * @remarks
 * 该方法可通过{@link getApi}获得，用于获取其它模块导出的{@link exportModule | Data}，例如：
 *
 * ```js
 *   const ArticleData = GetData('article')
 * ```
 *
 * @param moduleName - 组件所属模块名
 *
 * @public
 */
export declare type IGetData<TFacade extends Facade = {}> = <M extends keyof TFacade>(moduleName: M) => Promise<TFacade[M]['data']>;
/*** @public */
export declare type API<TFacade extends Facade> = {
    State: {
        [N in keyof TFacade]?: TFacade[N]['state'];
    };
    GetActions<N extends keyof TFacade>(...args: N[]): {
        [K in N]: TFacade[K]['actions'];
    };
    LoadComponent: ILoadComponent<TFacade>;
    GetComponent: IGetComponent<TFacade>;
    GetData: IGetData<TFacade>;
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
 * @param demoteForProductionOnly - 用于不支持Proxy的运行环境
 * @param injectActions -  用于不支持Proxy的运行环境
 *
 * @returns
 * 返回包含多个全局方法的结构体：
 *
 * - `LoadComponent`：用于加载其它模块导出的{@link exportView | UI组件}，参见 {@link ILoadComponent}。
 *
 * - `GetComponent`：用于获取其它模块导出的{@link exportView | UI组件}，参见 {@link IGetComponent}。
 *
 * - `GetData`：用于获取其它模块导出的{@link exportModule | Data}，参见 {@link IGetData}。
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
 * const {Modules, LoadComponent, GetComponent, GetData, GetActions, GetClientRouter, useStore, useRouter} = getApi<API>();
 * ```
 *
 * @public
 */
export declare function getApi<TAPI extends {
    State: any;
    GetActions: any;
    LoadComponent: any;
    GetComponent: any;
    GetData: any;
    Modules: any;
}>(): Pick<TAPI, 'GetActions' | 'LoadComponent' | 'GetComponent' | 'GetData' | 'Modules'> & {
    GetClientRouter: () => IRouter;
    useRouter: () => IRouter;
    useStore: () => VStore<TAPI['State']>;
};
/**
 * Model基类
 *
 * @remarks
 * Model基类实现了{@link CommonModel}，并提供了一些常用的方法
 *
 * @public
 */
export declare abstract class BaseModel<TModuleState extends ModuleState = {}, TStoreState extends StoreState = {}> implements IModel {
    readonly moduleName: string;
    /**
     * 所属store，model挂载在store下
     */
    protected readonly store: IStore<TStoreState>;
    /**
     * 获取模块的状态
     */
    protected get state(): TModuleState;
    /**
     * 获取路由
     */
    protected get router(): IRouter<TStoreState>;
    /**
     * 获取本模块的公开actions
     */
    protected get actions(): PickThisActions<this>;
    constructor(moduleName: string, store: IStore);
    abstract onInit(): TModuleState | Promise<TModuleState>;
    onBuild(): void;
    /**
     * 当前page被激活时触发
     */
    onActive(): void;
    /**
     * 当前page被变为历史快照时触发
     */
    onInactive(): void;
    /**
     * 获取本模块路由跳转之前的状态
     */
    protected getPrevState(): TModuleState | undefined;
    /**
     * 获取Store的全局状态，参见{@link IStore}
     *
     * @param type - 不传表示当前状态，previous表示路由跳转之前的状态，uncommitted表示未提交的状态
     *
     */
    protected getStoreState(type?: 'previous' | 'uncommitted'): TStoreState;
    /**
     * 等同于this.store.dispatch(action)
     */
    protected dispatch(action: Action): void | Promise<void>;
    /**
     * 定义reducer监听`moduleName._initState`，用来注入初始状态
     */
    protected _initState(state: TModuleState): TModuleState;
    /**
     * 定义reducer监听`moduleName._updateState`，用来合并当前状态
     */
    protected _updateState(subject: string, state: Partial<TModuleState>): TModuleState;
    /**
     * 定义reducer监听`moduleName._loadingState`，用来注入Loading状态
     */
    protected _loadingState(loadingState: {
        [group: string]: LoadingState;
    }): TModuleState;
}
export declare const facadeConfig: {
    LoadComponent?: (moduleName: string, componentName: string, options: {
        onError: Elux.Component<{
            message: string;
        }>;
        onLoading: Elux.Component<{}>;
    }) => EluxComponent | Promise<EluxComponent>;
    UseRouter?: () => IRouter;
    UseStore?: () => VStore;
};
//# sourceMappingURL=facade.d.ts.map