import { SingleDispatcher, UNListener } from './utils';
export declare const coreConfig: {
    NSP: string;
    MSP: string;
    MutableData: boolean;
    DepthTimeOnLoading: number;
    AppModuleName: string;
    RouteModuleName: string;
};
export declare const setCoreConfig: (config: Partial<{
    NSP: string;
    MSP: string;
    MutableData: boolean;
    DepthTimeOnLoading: number;
    AppModuleName: string;
    RouteModuleName: string;
}>) => void;
/**
 * 描述异步状态
 *
 * @public
 */
export declare enum LoadingState {
    /**
     * 开始加载.
     */
    Start = "Start",
    /**
     * 加载完成.
     */
    Stop = "Stop",
    /**
     * 进入深度加载，加载时间超过 {@link UserConfig.DepthTimeOnLoading} 时将视为深度加载
     */
    Depth = "Depth"
}
/**
 * 路由切换方式
 *
 * @public
 */
export declare enum RouteHistoryAction {
    /**
     * 新增
     */
    PUSH = "PUSH",
    /**
     * 回退
     */
    BACK = "BACK",
    /**
     * 替换当前
     */
    REPLACE = "REPLACE",
    /**
     * 清空并新增
     */
    RELAUNCH = "RELAUNCH"
}
/**
 * 定义Action
 *
 * @remarks
 * 类似于 `Redux` 或 `VUEX` 的 Action，增加了 `priority` 设置，用来指明同时有多个 handelr 时的处理顺序
 *
 * @public
 */
export interface Action {
    /**
     * action名称，不能重复，通常由：ModuleName.ActionName 组成
     */
    type: string;
    /**
     * 通常无需设置，同时有多个 handelr 时，可以特别指明处理顺序，其值为 moduleName 数组
     */
    priority?: string[];
    /**
     * action数据
     */
    payload?: any[];
}
export interface ActionHandler {
    __isReducer__?: boolean;
    __isEffect__?: boolean;
    __decorators__?: [
        (action: Action, effectResult: Promise<any>) => any,
        null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)
    ][];
    __decoratorResults__?: any[];
    (...args: any[]): any;
}
/*** @public */
export declare type ActionCreator = (...args: any[]) => Action;
export declare type ModelAsHandlers = {
    [actionName: string]: ActionHandler;
};
export declare type ModelAsCreators = {
    [actionName: string]: ActionCreator;
};
export declare type ActionHandlersMap = {
    [actionName: string]: {
        [moduleName: string]: ActionHandler;
    };
};
/**
 * 派发Action
 *
 * @remarks
 * 类似于 `Redux` 或 `VUEX` 的 Dispatch
 *
 * @public
 */
export declare type Dispatch = (action: Action) => void | Promise<void>;
/**
 * 模块状态描述
 *
 * @remarks
 * 通常为简单的 `plainObject` 对象
 *
 * @public
 */
export declare type ModuleState = {
    [key: string]: any;
};
/**
 * 全局状态描述
 *
 * @remarks
 * 由多个 {@link ModuleState} 按 moduleName 组合起来的 Store 状态
 *
 * @public
 */
export declare type RootState = {
    [moduleName: string]: ModuleState | undefined;
};
/**
 * 获取Store状态
 *
 * @param moduleName - 如果指明 moduleName 则返回 该模块的 ModuleState，否则返回全局 RootState
 *
 * @public
 */
export interface GetState<TRootState extends RootState = RootState> {
    (): TRootState;
    <N extends string>(moduleName: N): TRootState[N];
}
export interface Flux {
    getState: GetState;
    update: (actionName: string, state: RootState) => void;
    subscribe(listener: () => void): UNListener;
}
/**
 * Store实例
 *
 * @remarks
 * 类似于 `Redux` 或 `VUEX` 的 Store，多页模式下，每个`EWindow窗口`都会生成一个独立的 Store 实例
 *
 * @public
 */
export interface UStore<TRootState extends RootState = RootState, TRouteParams extends RootState = RootState> {
    sid: number;
    dispatch: Dispatch;
    isActive(): boolean;
    getState: GetState<TRootState>;
    getRouteParams: GetState<TRouteParams>;
    subscribe(listener: () => void): UNListener;
}
/**
 * 路由状态描述
 *
 * @public
 */
export interface RouteState<TRootState extends RootState = RootState, TPagename extends string = string> {
    /**
     * 切换动作
     */
    action: RouteHistoryAction;
    /**
     * 唯一ID，通过该ID可以找到此记录
     */
    key: string;
    /**
     * {@link PagenameMap} 中定义的key名，参见 {@link createRouteModule | createRouteModule(...)}
     */
    pagename: TPagename;
    /**
     * 路由参数，Elux中的路由参数也是一种Store，参见：`路由状态化`
     */
    params: TRootState;
}
export interface CoreRouter {
    routeState: RouteState;
    startup(store: EStore): void;
    getCurrentStore(): EStore;
    getStoreList(): EStore[];
    latestState: RootState;
}
/**
 * 表示该UI组件是一个EluxUI
 *
 * @remarks
 * EluxUI组件通常通过 {@link exportComponent} 导出，可使用 {@link LoadComponent} 加载
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
 * EluxUI组件通常通过 {@link exportComponent} 导出，可使用 {@link LoadComponent} 加载
 *
 * @public
 */
export declare type AsyncEluxComponent = () => Promise<{
    default: EluxComponent;
}>;
export declare function isEluxComponent(data: any): data is EluxComponent;
/**
 * Model的一般形态
 *
 * 通常通过继承 {@link BaseModel} 类生成
 *
 * @public
 */
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
/**
 * Module的一般形态
 *
 * @remarks
 * 通常通过 {@link exportModule | exportModule(...)} 生成
 *
 * @public
 */
export interface CommonModule<ModuleName extends string = string, Store extends UStore = UStore> {
    moduleName: ModuleName;
    initModel: (store: Store) => void | Promise<void>;
    state: ModuleState;
    routeParams: ModuleState;
    actions: {
        [actionName: string]: ActionCreator;
    };
    components: {
        [componentName: string]: EluxComponent | AsyncEluxComponent;
    };
    data?: any;
}
export interface EStore extends UStore, Flux {
    router: CoreRouter;
    getCurrentActionName: () => string;
    getUncommittedState: (moduleName?: string) => any;
    injectedModules: {
        [moduleName: string]: CommonModel;
    };
    loadingGroups: {
        [moduleNameAndGroupName: string]: TaskCounter;
    };
    setActive(status: boolean): void;
    destroy(): void;
    options: {
        initState: (data: RootState) => RootState;
        middlewares?: StoreMiddleware[];
        logger?: StoreLogger;
    };
}
/**
 * Store的中间件
 *
 * @remarks
 * 类似于 Redux 的 Middleware
 *
 * @public
 */
export declare type StoreMiddleware = (api: {
    getStore: () => UStore;
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
/**
 * Store的日志记录器
 *
 * @remarks
 * Store的所有变化都将调用该记录器
 *
 * @public
 */
export declare type StoreLogger = ({ id, isActive }: {
    id: number;
    isActive: boolean;
}, actionName: string, payload: any[], priority: string[], handers: string[], state: {
    [moduleName: string]: any;
}, effect: boolean) => void;
export declare class TaskCounter extends SingleDispatcher<LoadingState> {
    deferSecond: number;
    readonly list: {
        promise: Promise<any>;
        note: string;
    }[];
    private ctimer;
    constructor(deferSecond: number);
    addItem(promise: Promise<any>, note?: string): Promise<any>;
    private completeItem;
}
export declare type ModuleMap = Record<string, {
    name: string;
    actions: ModelAsCreators;
    actionNames: Record<string, string>;
}>;
/**
 * 配置模块的获取方式
 *
 * @remarks
 * - 模块获取可以使用同步或异步，定义成异步方式可以做到`按需加载`
 *
 * - 根模块（stage）和路由模块（route）通常定义为同步获取
 *
 * @example
 * ```js
 * import stage from '@/modules/stage';
 *
 * export const moduleGetter = {
 *   route: () => routeModule,
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
export declare const MetaData: {
    moduleMap: ModuleMap;
    moduleGetter: ModuleGetter;
    moduleExists: {
        [moduleName: string]: boolean;
    };
    injectedModules: {
        [moduleName: string]: boolean;
    };
    reducersMap: ActionHandlersMap;
    effectsMap: ActionHandlersMap;
    moduleCaches: {
        [moduleName: string]: undefined | CommonModule | Promise<CommonModule>;
    };
    componentCaches: {
        [moduleNameAndComponentName: string]: undefined | EluxComponent | Promise<EluxComponent>;
    };
    currentRouter: CoreRouter;
};
export declare function deepMergeState(target?: any, ...args: any[]): any;
export declare function mergeState(target?: any, ...args: any[]): any;
/**
 * 当前环境是否是服务器环境
 *
 * @public
 */
export declare function isServer(): boolean;
//# sourceMappingURL=basic.d.ts.map