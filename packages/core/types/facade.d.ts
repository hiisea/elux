import { Action, AppModuleState, EluxComponent, AsyncEluxComponent, CommonModule, CommonModel, CommonModelClass, ModuleState, StoreState, IRouter, IStore } from './basic';
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
export declare type PickHandler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
/*** @public */
export declare type PickActions<T> = Pick<{
    [K in keyof T]: PickHandler<T[K]>;
}, {
    [K in keyof T]: T[K] extends Function ? Exclude<K, 'onActive' | 'onInactive' | 'onStartup' | 'onInit'> : never;
}[keyof T]>;
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
export declare function exportModule<TModuleName extends string, TModel extends CommonModel, TComponents extends {
    [componentName: string]: EluxComponent | AsyncEluxComponent;
}, D>(moduleName: TModuleName, ModelClass: CommonModelClass<TModel>, components: TComponents, data?: D): {
    moduleName: TModuleName;
    ModelClass: CommonModelClass;
    state: GetPromiseReturn<ReturnType<TModel['onInit']>>;
    actions: PickActions<TModel>;
    components: ReturnComponents<TComponents>;
    data: D;
};
export declare type ILoadComponent<TFacade extends Facade = {}> = <M extends keyof TFacade, V extends keyof TFacade[M]['components']>(moduleName: M, componentName: V, options?: {
    onError?: Elux.Component<{
        message: string;
    }>;
    onLoading?: Elux.Component<{}>;
}) => TFacade[M]['components'][V];
/*** @public */
export declare type API<TFacade extends Facade> = {
    State: {
        app: AppModuleState;
    } & {
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
/*** @public */
export declare type HandlerThis<T> = T extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : undefined;
/*** @public */
export declare type ActionsThis<T> = {
    [K in keyof T]: HandlerThis<T[K]>;
};
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
export declare abstract class BaseModel<TModuleState extends ModuleState = {}, TStoreState extends StoreState = {}> implements CommonModel {
    readonly moduleName: string;
    protected readonly store: IStore<TStoreState>;
    constructor(moduleName: string, store: IStore);
    abstract onInit(routeChanged: boolean): TModuleState | Promise<TModuleState>;
    onStartup(routeChanged: boolean): void | Promise<void>;
    onActive(): void;
    onInactive(): void;
    protected getRouter(): IRouter<TStoreState>;
    protected getState(): TModuleState;
    protected getState(type: 'previous'): TModuleState | undefined;
    protected getStoreState(type?: 'previous' | 'uncommitted'): TStoreState;
    /**
     * 获取本模块的`公开actions`构造器
     */
    protected get actions(): ActionsThis<this>;
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
    protected getPrivateActions<T extends Record<string, Function>>(actionsMap?: T): {
        [K in keyof T]: PickHandler<T[K]>;
    } & {
        updateState: (subject: string, state: Partial<TModuleState>) => Action;
    };
    /**
     * 获取当前触发的action.type
     */
    protected getCurrentAction(): Action;
    protected dispatch(action: Action): void | Promise<void>;
    protected initState(state: TModuleState): ModuleState;
    protected updateState(subject: string, state: Partial<TModuleState>): ModuleState;
    protected loadingState(loadingState: {
        [group: string]: LoadingState;
    }): ModuleState;
}
//# sourceMappingURL=facade.d.ts.map