import { UNListener } from './utils';
/**
 * 定义Action
 *
 * @remarks
 * 类似于 `Redux` 或 `Vuex` 的 Action，增加了 `priority` 设置，用来指明同时有多个 handler 时的处理顺序
 *
 * @public
 */
export interface Action {
    /**
     * action名称不能重复，通常由：ModuleName.ActionName 组成
     */
    type: string;
    /**
     * 通常无需设置，同时有多个 handler 时，可以特别指明处理顺序，其值为 moduleName 数组
     */
    priority?: string[];
    /**
     * action数据
     */
    payload?: any[];
}
/**
 * 派发Action
 *
 * @public
 */
export declare type Dispatch = (action: Action) => void | Promise<void>;
/**
 * 模块状态
 *
 * @remarks
 * 通常为简单的 `PlainObject` 对象
 *
 * @public
 */
export declare type ModuleState = {
    [key: string]: any;
};
/**
 * 全局状态
 *
 * @remarks
 * 由多个 {@link ModuleState} 按 moduleName 组合起来的全部 Store 状态
 *
 * @public
 */
export declare type StoreState = {
    [moduleName: string]: ModuleState | undefined;
};
export interface ActionHandler {
    __isReducer__?: boolean;
    __isEffect__?: boolean;
    __decorators__?: [
        (store: IStore, action: Action, effectPromise: Promise<unknown>) => any,
        null | ((status: 'Rejected' | 'Resolved', beforeResult: unknown, effectResult: unknown) => void)
    ][];
    (...args: any[]): unknown;
}
/*** @public */
export declare type ActionCreator = (...args: any[]) => Action;
export declare type ModelAsHandlers = {
    [actionName: string]: ActionHandler;
};
export declare type ActionHandlersMap = {
    [actionName: string]: {
        [moduleName: string]: ActionHandler;
    };
};
/** @public */
export declare type ModelAsCreators = {
    [actionName: string]: ActionCreator;
};
/**
 * 获取Store状态
 *
 * @param moduleName - 如果指明 moduleName 则返回该模块的 ModuleState，否则返回全部 StoreState
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
 * @remarks
 * - 每个 Store 都挂载在 {@link IRouter} 下面，router 和 store 是一对多的关系
 *
 * - 每次路由发生变化都会生成一个新的 Store
 *
 * @public
 */
export interface IStore<TStoreState extends StoreState = StoreState> {
    /**
     * 每个 store 实例都有一个 ID 标识
     */
    sid: number;
    active: boolean;
    /**
     * 每个 store 实例都会挂载在 router 路由器下面
     *
     * @remarks
     * router 和 store 是一对多的关系
     */
    router: IRouter<TStoreState>;
    /**
     * 派发Action
     */
    dispatch: Dispatch;
    /**
     * 获取已提交的状态
     */
    getState: GetState<TStoreState>;
    /**
     * 获取未提交的状态
     *
     * @remarks
     * store 状态由多个 module 状态组成，更新的时候必须等所有 module 状态全部完成更新后才一次性 commit 到 store 中
     */
    getUncommittedState(): TStoreState;
    /**
     * 在该 store 中挂载指定的 module
     *
     * @remarks
     * 完成 moduleState 的初始化，并将 moduleState 注入 storeState 中
     */
    mount(moduleName: keyof TStoreState, env: 'init' | 'route' | 'update'): void | Promise<void>;
    /**
     * 销毁，框架会自动调用
     */
    destroy(): void;
}
/**
 * 路由动作
 *
 * @public
 */
export declare type RouteAction = 'init' | 'relaunch' | 'push' | 'replace' | 'back';
/**
 * 路由历史栈
 *
 * @remarks
 * 对于路由历史记录栈，不同于浏览器只有一维栈，框架中存在二维栈。操作路由跳转时，可以指明是操作哪个栈
 *
 * @public
 */
export declare type RouteTarget = 'window' | 'page';
/**
 * 路由描述
 *
 * @remarks
 *
 * @public
 */
export interface Location {
    url: string;
    pathname: string;
    search: string;
    hash: string;
    searchQuery: {
        [key: string]: any;
    };
    hashQuery: {
        [key: string]: any;
    };
}
/**
 * 内置的错误描述格式
 *
 * @remarks
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
     * 每条路由记录都有一个唯一的key
     */
    key: string;
    /**
     * 路由描述
     */
    location: Location;
}
/**
 * 路由的运行状态
 *
 * @remarks
 * 可以通过 {@link IRouter.runtime} 获得
 *
 * @public
 */
export interface RouteRuntime<TStoreState extends StoreState = StoreState> {
    /**
     * 路由跳转发生的时间戳
     */
    timestamp: number;
    /**
     * 路由跳转时附加的数据
     *
     * @remarks
     * 该数据可通过路由操作提交。如：`router.push({url}, 'window', {aaa:111})`
     */
    payload: unknown;
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
 * 可以通过 {@link IRouter.initOptions} 获得
 *
 * @public
 */
export interface RouterInitOptions {
    url: string;
    [key: string]: any;
}
/**
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
 * 路由实例
 *
 * @remarks
 * - 在 CSR 中全局只有一个 Router
 *
 * - 在 SSR 中每个请求都会生成一个路由实例
 *
 * - 每个 IRouter 下面可以存在多个 {@link IStore}
 *
 * @public
 */
export interface IRouter<TStoreState extends StoreState = StoreState> {
    /**
     * 监听路由事件
     */
    addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
    /**
     * 路由初始化时的参数，SSR时可用来引用用户请求
     */
    initOptions: RouterInitOptions;
    /**
     * 路由动作
     */
    action: RouteAction;
    /**
     * 路由信息
     */
    location: Location;
    /**
     * 每次路由变化都会产生唯一ID
     */
    routeKey: string;
    /**
     * 路由运行状态
     */
    runtime: RouteRuntime<TStoreState>;
    /**
     * 获取当前被激活显示的页面
     */
    getActivePage(): {
        url: string;
        store: IStore;
    };
    /**
     * 获取所有window中的当前页面
     */
    getCurrentPages(): {
        url: string;
        store: IStore;
    }[];
    /**
     * 获取指定路由栈的长度
     */
    getHistoryLength(target?: RouteTarget): number;
    /**
     * 获取指定路由栈中的记录
     */
    getHistory(target?: RouteTarget): IRouteRecord[];
    /**
     * 用`唯一key`来查找某条路由记录，如果没找到则返回 `{overflow: true}`
     */
    findRecordByKey(key: string): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    /**
     * 用`回退步数`来查找某条路由历史记录，如果步数溢出则返回 `{overflow: true}`
     */
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    /**
     * 跳转一条路由，并清空所有历史记录
     *
     * @param urlOrLocation - 路由描述
     * @param target - 指定要操作的路由栈，默认:`page`
     * @param payload - 提交给 {@link RouteRuntime} 的数据
     */
    relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
    /**
     * 新增一条路由
     *
     * @param urlOrLocation - 路由描述
     * @param target - 指定要操作的路由栈。默认:`page`
     * @param payload - 提交给 {@link RouteRuntime} 的数据
     */
    push(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
    /**
     * 替换当前路由
     *
     * @param urlOrLocation - 路由描述
     * @param target - 指定要操作的路由栈，默认:`page`
     * @param payload - 提交给 {@link RouteRuntime} 的数据
     */
    replace(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
    /**
     * 回退历史记录
     *
     * @param stepOrKey - 需要回退的步数或者历史记录的唯一id
     * @param target - 指定要操作的路由栈，默认:`page`
     * @param payload - 提交给 {@link RouteRuntime} 的数据
     * @param overflowRedirect - 如果回退溢出，跳往哪个路由。默认:{@link UserConfig.HomeUrl}
     */
    back(stepOrKey?: number | string, target?: RouteTarget, payload?: any, overflowRedirect?: string): void | Promise<void>;
}
/**
 * Model的一般形态
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
     * 该 model 被挂载到 store 时触发，在一个 store 中 一个 model 只会被挂载一次
     */
    onMount(env: 'init' | 'route' | 'update'): void | Promise<void>;
    /**
     * 当某 store 被路由置于最顶层时，所有该 store 中被挂载的 model 会触发
     */
    onActive(): void;
    /**
     * 当某 store 被路由置于非顶层时，所有该 store 中被挂载的 model 会触发
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
 * 表示该UI组件是一个导出的UI组件
 *
 * @remarks
 * EluxUI组件通常通过 {@link exportComponent} 导出，可使用 {@link ILoadComponent} 加载
 *
 * @public
 */
export interface EluxComponent {
    __elux_component__: 'view' | 'component';
}
/**
 * 表示该UI组件是一个异步EluxUI
 *
 * @remarks
 * EluxUI组件通常通过 {@link exportComponent} 导出，可使用 {@link ILoadComponent} 加载
 *
 * @public
 */
export declare type AsyncEluxComponent = () => Promise<{
    default: EluxComponent;
}>;
export declare function isEluxComponent(data: any): data is EluxComponent;
/**
 * Module的一般形态
 *
 * @public
 */
export interface CommonModule<TModuleName extends string = string> {
    moduleName: TModuleName;
    ModelClass: CommonModelClass;
    components: {
        [componentName: string]: EluxComponent;
    };
    state: ModuleState;
    actions: ModelAsCreators;
    data?: any;
}
/**
 * 配置模块的获取方式
 *
 * @remarks
 * - 模块获取可以使用同步或异步，定义成异步方式可以做到`按需加载`
 *
 * - 根模块`stage`通常定义为同步获取
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
export declare type ModuleGetter = {
    [moduleName: string]: () => CommonModule | Promise<{
        default: CommonModule;
    }>;
};
export declare type ModuleApiMap = Record<string, {
    name: string;
    actions: ModelAsCreators;
    actionNames: Record<string, string>;
}>;
export declare const MetaData: {
    moduleApiMap: ModuleApiMap;
    moduleCaches: {
        [moduleName: string]: undefined | CommonModule | Promise<CommonModule>;
    };
    componentCaches: {
        [moduleNameAndComponentName: string]: undefined | EluxComponent | Promise<EluxComponent>;
    };
    reducersMap: ActionHandlersMap;
    effectsMap: ActionHandlersMap;
    clientRouter?: IRouter;
};
/**
 * Store的中间件
 *
 * @remarks
 * 类似于 Redux 的 Middleware
 *
 * @public
 */
export declare type StoreMiddleware = (api: {
    getStore: () => IStore;
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
/**
 * @public
 */
export declare type storeLoggerInfo = {
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
 * Store的所有变化都将调用该记录器
 *
 * @public
 */
export declare type StoreLogger = (info: storeLoggerInfo) => void;
export interface EluxContext {
    documentHead: string;
    router: IRouter;
}
export interface EluxStoreContext {
    store: IStore;
}
export interface IAppRender {
    toDocument(id: string, eluxContext: EluxContext, fromSSR: boolean, app: any): void;
    toString(id: string, eluxContext: EluxContext, app: {}): Promise<string>;
    toProvider(eluxContext: EluxContext, app: any): Elux.Component<{
        children: any;
    }>;
}
export declare const coreConfig: {
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
    StoreProvider?: Elux.Component<{
        store: IStore;
        children: JSX.Element;
    }>;
    LoadComponent?: (moduleName: string, componentName: string, options: {
        onError: Elux.Component<{
            message: string;
        }>;
        onLoading: Elux.Component<{}>;
    }) => EluxComponent | Promise<EluxComponent>;
    LoadComponentOnError?: Elux.Component<{
        message: string;
    }>;
    LoadComponentOnLoading?: Elux.Component<{}>;
    UseRouter?: () => IRouter;
    UseStore?: () => IStore;
    AppRender?: IAppRender;
};
export declare const setCoreConfig: (config: Partial<{
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
    StoreProvider?: Elux.Component<{
        store: IStore;
        children: JSX.Element;
    }> | undefined;
    LoadComponent?: ((moduleName: string, componentName: string, options: {
        onError: Elux.Component<{
            message: string;
        }>;
        onLoading: Elux.Component<{}>;
    }) => EluxComponent | Promise<EluxComponent>) | undefined;
    LoadComponentOnError?: Elux.Component<{
        message: string;
    }> | undefined;
    LoadComponentOnLoading?: Elux.Component<{}> | undefined;
    UseRouter?: (() => IRouter) | undefined;
    UseStore?: (() => IStore) | undefined;
    AppRender?: IAppRender | undefined;
}>) => void;
export declare function deepMergeState(target?: any, ...args: any[]): any;
export declare function mergeState(target?: any, ...args: any[]): any;
export declare function getClientRouter(): IRouter;
//# sourceMappingURL=basic.d.ts.map