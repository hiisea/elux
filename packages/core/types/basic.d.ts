import { LoadingState } from './utils';
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
export declare type ModelAsCreators = {
    [actionName: string]: ActionCreator;
};
/**
 * 获取Store状态
 *
 * @param moduleName - 如果指明 moduleName 则返回 该模块的 ModuleState，否则返回全局 RootState
 *
 * @public
 */
export interface GetState<TStoreState extends StoreState = StoreState> {
    (): TStoreState;
    <N extends string>(moduleName: N): TStoreState[N];
}
export interface IStore<TStoreState extends StoreState = StoreState> {
    sid: number;
    router: IRouter<TStoreState>;
    dispatch: Dispatch;
    getState: GetState<TStoreState>;
    getUncommittedState: () => TStoreState;
    mount(moduleName: keyof TStoreState, routeChanged: boolean): void | Promise<void>;
}
/**
 * @public
 */
export declare type RouteAction = 'relaunch' | 'push' | 'replace' | 'back';
/**
 * @public
 */
export declare type RouteTarget = 'window' | 'page';
/**
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
export interface ActionError {
    code: string;
    message: string;
    detail?: any;
}
export declare const ErrorCodes: {
    INIT_ERROR: string;
    ROUTE_BACK_OVERFLOW: string;
};
export interface AppModuleState {
    routeAction: RouteAction;
    routeLocation: Location;
    globalLoading: LoadingState;
    initError: string;
}
/**
 * 路由历史记录
 *
 * @remarks
 * 可以通过 {@link URouter.findRecordByKey}、{@link URouter.findRecordByStep} 获得
 *
 * @public
 */
export interface IRouteRecord {
    /**
     * 每条路由记录都有一个唯一的key
     */
    key: string;
    /**
     * 路由转换器，参见 {@link ULocationTransform}
     */
    location: Location;
}
export interface RouteRuntime<TStoreState extends StoreState = StoreState> {
    timestamp: number;
    payload: unknown;
    prevState: TStoreState;
    completed: boolean;
}
export interface IRouter<TStoreState extends StoreState = StoreState> {
    nativeData: unknown;
    action: RouteAction;
    location: Location;
    runtime: RouteRuntime<TStoreState>;
    getCurrentPage(): {
        url: string;
        store: IStore;
    };
    getHistoryLength(target?: RouteTarget): number;
    findRecordByKey(key: string): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
    push(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
    replace(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
    back(stepOrKey?: number | string, target?: RouteTarget, payload?: any, overflowRedirect?: string): void | Promise<void>;
}
/**
 * Model的一般形态
 *
 * 通常通过继承 {@link BaseModel} 类生成
 *
 * @public
 */
export interface CommonModel {
    readonly moduleName: string;
    onInit(routeChanged: boolean): ModuleState | Promise<ModuleState>;
    onStartup(routeChanged: boolean): void | Promise<void>;
    onActive(): void;
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
 * 表示该UI组件是一个EluxUI
 *
 * @remarks
 * EluxUI组件通常通过 {@link exportComponent} 导出，可使用 {@link LoadComponent} 加载
 *
 * @public
 */
export interface EluxComponent extends Elux.Component<any> {
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
 * Module的一般形态
 *
 * @remarks
 * 通常通过 {@link exportModule | exportModule(...)} 生成
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
    toDocument(id: string, eluxContext: EluxContext, fromSSR: boolean, app: any, store: IStore): void;
    toString(id: string, eluxContext: EluxContext, app: {}, store: IStore): Promise<string>;
}
export declare const coreConfig: {
    NSP: string;
    MSP: string;
    MutableData: boolean;
    DepthTimeOnLoading: number;
    AppModuleName: string;
    StageModuleName: string;
    StageViewName: string;
    SSRDataKey: string;
    SSRTPL: string;
    ModuleGetter: ModuleGetter;
    StoreInitState: () => {};
    StoreMiddlewares: StoreMiddleware[];
    StoreLogger: StoreLogger;
    SetPageTitle: (title: string) => void;
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
    AppModuleName: string;
    StageModuleName: string;
    StageViewName: string;
    SSRDataKey: string;
    SSRTPL: string;
    ModuleGetter: ModuleGetter;
    StoreInitState: () => {};
    StoreMiddlewares: StoreMiddleware[];
    StoreLogger: StoreLogger;
    SetPageTitle: (title: string) => void;
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