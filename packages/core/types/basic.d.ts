import { Listener, LoadingState, UNListener } from './utils';
/**
 * 定义Action
 *
 * @public
 */
export interface Action {
    /**
     * type通常由ModuleName.ActionName组成
     */
    type: string;
    /**
     * 同时有多个handler时，可以特别指明处理顺序，通常无需设置
     */
    priority?: string[];
    /**
     * action载体
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
 * @public
 */
export declare type ModuleState = {
    _error?: string;
    _loading?: {
        [group: string]: LoadingState;
    };
    [key: string]: any;
};
/**
 * 全局状态
 *
 * @remarks
 * 由多个 {@link ModuleState} 按moduleName组合起来的全局状态
 *
 * @public
 */
export declare type StoreState = {
    [moduleName: string]: ModuleState | undefined;
};
/** @public */
export declare type ModelAsCreators = {
    [actionName: string]: ActionCreator;
};
/*** @public */
export declare type ActionCreator = (...args: any[]) => Action;
/**
 * 获取全局状态
 *
 * @param moduleName - 如果指明moduleName则返回该模块的ModuleState，否则返回全局StoreState
 *
 * @public
 */
export interface GetState<S extends StoreState = StoreState> {
    (): S;
    <N extends string>(moduleName: N): S[N];
}
/**
 * Model的基础定义
 *
 * @public
 */
export interface IModel<S extends ModuleState = ModuleState> {
    /**
     * 模块名称
     */
    readonly moduleName: string;
    /**
     * model被挂载到store时触发，在一个store中一个model只会被挂载一次
     */
    onInit(): S | Promise<S>;
    onBuild(): any;
    /**
     * 当前page被激活时触发
     */
    onActive(): void;
    /**
     * 当前page被变为历史快照时触发
     */
    onInactive(): void;
}
/**
 * Model的构造类
 *
 * @public
 */
export interface IModelClass<H = IModel> {
    new (moduleName: string, store: IStore): H;
}
/**
 * EluxComponent定义
 *
 * @remarks
 * EluxComponent通过 {@link exportComponent} 导出，可使用 {@link ILoadComponent} 加载
 *
 * @public
 */
export interface EluxComponent {
    __elux_component__: 'view' | 'component';
}
export declare function isEluxView(view: EluxComponent): boolean;
export declare function isEluxComponent(data: any): data is EluxComponent;
/**
 * 向外导出UI组件
 *
 * @returns
 * 返回实现 EluxComponent 接口的UI组件
 *
 * @public
 */
export declare function exportComponent<T>(component: T): T & EluxComponent;
/**
 * 向外导出业务视图
 *
 * @returns
 * 返回实现 EluxComponent 接口的业务视图
 *
 * @public
 */
export declare function exportView<T>(component: T): T & EluxComponent;
/**
 * 异步EluxComponent定义
 *
 * @remarks
 * EluxComponent通过 {@link exportComponent} 导出，可使用 {@link ILoadComponent} 加载
 *
 * @public
 */
export declare type AsyncEluxComponent = () => Promise<{
    default: EluxComponent;
}>;
/**
 * Module的基础定义
 *
 * @public
 */
export interface IModule<TModuleName extends string = string> {
    moduleName: TModuleName;
    ModelClass: IModelClass;
    components: {
        [componentName: string]: EluxComponent | AsyncEluxComponent;
    };
    state: ModuleState;
    actions: ModelAsCreators;
    data?: any;
}
export declare type ModuleGetter = {
    [moduleName: string]: () => IModule | Promise<{
        default: IModule;
    }>;
};
/**
 * 路由历史栈类别
 *
 * @public
 */
export declare type RouteTarget = 'window' | 'page';
/**
 * 路由动作类别
 *
 * @public
 */
export declare type RouteAction = 'init' | 'relaunch' | 'push' | 'replace' | 'back';
/**
 * 路由信息
 *
 * @public
 */
export interface Location {
    url: string;
    pathname: string;
    search: string;
    hash: string;
    classname: string;
    searchQuery: {
        [key: string]: any;
    };
    hashQuery: {
        [key: string]: any;
    };
    state: any;
}
export interface ANativeRouter {
    getInitData(): Promise<{
        url: string;
        state: StoreState;
        context: any;
    }>;
    testExecute(method: RouteAction, location: Location, backIndex?: number[]): string | void;
    execute(method: RouteAction, location: Location, key: string, backIndex?: number[]): void | Promise<void>;
    setPageTitle(title: string): void;
    exit(): void;
}
export interface IWindowStack {
    num: number;
    getCurrentItem(): IPageStack;
    getRecords(): IRouteRecord[];
    getLength(): number;
    findRecordByKey(key: string): {
        record: RouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    relaunch(record: IPageStack): void;
    push(record: IPageStack): void;
    backTest(stepOrKey: number | string, rootOnly: boolean): {
        record: RouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    back(delta: number): void;
}
export interface IPageStack {
    num: number;
    readonly key: string;
    readonly windowStack: IWindowStack;
    getCurrentItem(): IRouteRecord;
    getItems(): IRouteRecord[];
    getLength(): number;
    push(record: IRouteRecord): void;
    relaunch(record: IRouteRecord): void;
    replace(record: IRouteRecord): void;
    back(delta: number): void;
}
export interface IRecord {
    destroy: () => void;
    active: () => void;
    inactive: () => void;
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
     * 唯一的key
     */
    readonly key: string;
    /**
     * 路由描述
     */
    readonly location: Location;
    /**
     * 页面标题
     */
    readonly title: string;
    readonly store: AStore;
}
export declare class RouteRecord implements IRouteRecord, IRecord {
    readonly location: Location;
    readonly pageStack: IPageStack;
    readonly store: AStore;
    readonly key: string;
    protected _title: string;
    constructor(location: Location, pageStack: IPageStack, store: AStore);
    destroy(): void;
    active(): void;
    inactive(): void;
    get title(): string;
    saveTitle(val: string): void;
}
/**
 * 路由事件
 *
 * @remarks
 * 发生路由时，路由器本身会派发路由事件
 *
 * @public
 */
export interface RouteEvent {
    location: Location;
    action: RouteAction;
    prevStore: AStore;
    newStore: AStore;
    windowChanged: boolean;
}
/**
 * 内置的错误描述接口
 *
 * @public
 */
export interface ActionError {
    code: string;
    message: string;
    detail?: any;
}
/**
 * 内置ErrorCode
 *
 * @public
 */
export declare const ErrorCodes: {
    /**
     * 在路由被强制中断并返回时抛出该错误
     */
    ROUTE_RETURN: string;
    /**
     * 在SSR服务器渲染时，操作路由跳转会抛出该错误
     */
    ROUTE_REDIRECT: string;
    /**
     * 在路由后退时，如果步数溢出则抛出该错误
     */
    ROUTE_BACK_OVERFLOW: string;
};
declare type Execute = () => Promise<void>;
declare type Resolved = () => void;
declare type Rejected = (reason?: any) => void;
declare type RouteTask = [Execute, Resolved, Rejected];
/**
 * Store实例
 *
 * @public
 */
export interface IStore<S extends StoreState = StoreState> {
    /**
     * ForkID
     */
    readonly uid: number;
    /**
     * 实例ID
     */
    readonly sid: number;
    /**
     * 当前是否是激活状态
     *
     * @remarks
     * 同一时刻只会有一个store被激活
     */
    readonly active: boolean;
    /**
     * 所属router
     *
     * @remarks
     * router和store是一对多的关系
     */
    readonly router: IRouter<S>;
    /**
     * 派发action
     */
    dispatch: Dispatch;
    /**
     * 获取store的状态
     *
     * @remarks
     * storeState由多个moduleState组成，更新时必须等所有moduleState全部更新完成后，后会才一次性commit到store中
     */
    getState: GetState<S>;
    /**
     * 获取暂时未提交到store的状态
     *
     * @remarks
     * storeState由多个moduleState组成，更新时必须等所有moduleState全部更新完成后，后会才一次性commit到store中
     */
    getUncommittedState(): S;
    /**
     * 在该store中挂载指定的model
     *
     * @remarks
     * 该方法会触发model.onMount(env)钩子
     */
    mount(moduleName: keyof S, env: 'init' | 'route' | 'update'): void | Promise<void>;
    getCurrentAction(): Action;
    setLoading<T extends Promise<any>>(item: T, groupName: string, moduleName?: string): T;
    subscribe(listener: Listener): UNListener;
}
export declare abstract class AStore implements IStore {
    readonly sid: number;
    readonly uid: number;
    readonly router: IRouter;
    abstract dispatch: Dispatch;
    abstract getState: GetState;
    abstract getUncommittedState(): StoreState;
    abstract setActive(active: boolean): void;
    abstract destroy(): void;
    abstract clone(brand?: boolean): AStore;
    abstract subscribe(listener: Listener): UNListener;
    abstract getCurrentAction(): Action;
    abstract setLoading<T extends Promise<any>>(item: T, loadingKey: string): T;
    get active(): boolean;
    protected mountedModules: {
        [moduleName: string]: Promise<void> | true | undefined;
    };
    protected injectedModels: {
        [moduleName: string]: IModel;
    };
    protected _active: boolean;
    constructor(sid: number, uid: number, router: IRouter);
    mount(moduleName: string, env: 'init' | 'route' | 'update'): void | Promise<void>;
    protected execMount(moduleName: string): Promise<void>;
}
export interface IRouter<S extends StoreState = StoreState> {
    /**
     * 路由初始化时的参数，通常用于SSR时传递原生的Request和Response对象
     */
    readonly context: any;
    readonly prevState: S;
    /**
     * 当前路由动作
     */
    readonly action: RouteAction;
    initialize(): Promise<void>;
    /**
     * 监听路由事件
     */
    addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
    /**
     * 当前路由信息
     */
    getLocation(): Location;
    /**
     * 获取当前页面的DocumentHead
     */
    getDocumentHead(): string;
    /**
     * 设置当前页面的DocumentHead
     */
    setDocumentHead(html: string): void;
    /**
     * 获取当前被激活显示的页面
     */
    getCurrentPage(): IRouteRecord;
    /**
     * 获取当前所有虚拟Window中的Page
     */
    getWindowPages(): IRouteRecord[];
    /**
     * 获取指定历史栈的长度
     */
    getHistoryLength(target: RouteTarget): number;
    /**
     * 获取指定历史栈中的记录
     */
    getHistory(target: RouteTarget): IRouteRecord[];
    /**
     * 用`唯一key`来查找历史记录，如果没找到则返回 `{overflow: true}`
     */
    findRecordByKey(key: string): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    /**
     * 用`回退步数`来查找历史记录，如果步数溢出则返回 `{overflow: true}`
     */
    findRecordByStep(delta: number, rootOnly: boolean): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    /**
     * 根据部分信息计算完整Url
     */
    computeUrl(partialLocation: Partial<Location>, action: RouteAction, target: RouteTarget): string;
    /**
     * 清空指定栈中的历史记录，并跳转路由
     *
     * @param partialLocation - 路由信息 {@link Location}
     * @param target - 指定要操作的历史栈，默认:`page`
     * @param refresh - 是否强制刷新，默认: false
     */
    relaunch(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
    /**
     * 在指定栈中新增一条历史记录，并跳转路由
     *
     * @param partialLocation - 路由信息 {@link Location}
     * @param target - 指定要操作的历史栈，默认:`page`
     * @param refresh - 是否强制刷新，默认: false
     */
    push(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
    /**
     * 在指定栈中替换当前历史记录，并跳转路由
     *
     * @param partialLocation - 路由信息 {@link Location}
     * @param target - 指定要操作的历史栈，默认:`page`
     * @param refresh - 是否强制刷新，默认: false
     */
    replace(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
    /**
     * 回退指定栈中的历史记录，并跳转路由
     *
     * @param stepOrKeyOrCallback - 需要回退的步数/历史记录ID/回调函数
     * @param target - 指定要操作的历史栈，默认:`page`
     * @param refresh - 是否强制刷新，默认: false
     * @param overflowRedirect - 如果回退溢出，跳往哪个路由
     */
    back(stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean), target?: RouteTarget, overflowRedirect?: string): void | Promise<void>;
}
export declare abstract class ARouter implements IRouter {
    abstract addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
    protected abstract WindowStackClass: {
        new (location: Location, store: AStore): IWindowStack;
    };
    protected abstract PageStackClass: {
        new (windowStack: IWindowStack, location: Location, store: AStore): IPageStack;
    };
    protected abstract StoreClass: {
        new (sid: number, uid: number, router: ARouter): AStore;
    };
    protected abstract nativeUrlToUrl(nativeUrl: string): string;
    protected abstract urlToLocation(url: string, state?: any): Location;
    protected abstract locationToUrl(location: Partial<Location>, defClassname?: string): string;
    abstract relaunch(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
    abstract push(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
    abstract replace(partialLocation: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
    abstract back(stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean), target?: RouteTarget, overflowRedirect?: string): void | Promise<void>;
    action: RouteAction;
    prevState: StoreState;
    context: {};
    protected windowStack: IWindowStack;
    protected nativeRouter: ANativeRouter;
    protected taskList: RouteTask[];
    protected curTask?: RouteTask;
    protected curTaskError?: any;
    protected curLoopTaskCallback?: [Resolved, Rejected];
    protected documentHead: string;
    protected onTaskComplete: () => void;
    constructor(nativeRouter: ANativeRouter);
    protected addTask(exec: () => Promise<void>): Promise<void>;
    getHistoryLength(target: RouteTarget): number;
    findRecordByKey(recordKey: string): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    findRecordByStep(delta: number, rootOnly?: boolean): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    getWindowPages(): IRouteRecord[];
    getCurrentPage(): IRouteRecord;
    getHistory(target: RouteTarget): IRouteRecord[];
    getDocumentTitle(): string;
    getDocumentHead(): string;
    setDocumentHead(html: string): void;
    getLocation(): Location;
    computeUrl(partialLocation: Partial<Location>, action: RouteAction, target: RouteTarget): string;
    protected mountStore(prevStore: AStore, newStore: AStore): void | Promise<void>;
    initialize(): Promise<void>;
    protected _init(): Promise<void>;
    ssr(html: string): Promise<void>;
    protected _ssr(html: string): Promise<void>;
}
export interface RenderOptions {
    /**
     * 挂载应用Dom的id
     *
     * @defaultValue `root`
     *
     * @remarks
     * 默认: `root`
     */
    id?: string;
}
/**
 * @public
 */
export declare type EluxApp = {
    render(options?: RenderOptions): Promise<void>;
};
export declare abstract class WebApp<INS = {}> {
    protected cientSingleton?: INS & {
        render(options?: RenderOptions): Promise<void>;
    };
    protected abstract NativeRouterClass: {
        new (): ANativeRouter;
    };
    protected abstract RouterClass: {
        new (nativeRouter: ANativeRouter, prevState: StoreState): ARouter;
    };
    protected abstract createUI: () => any;
    protected abstract toDocument: (domId: string, router: ARouter, ssrData: any, ui: any) => void;
    boot(): INS & {
        render(options?: RenderOptions): Promise<void>;
    };
}
export declare abstract class SsrApp {
    protected abstract NativeRouterClass: {
        new (): ANativeRouter;
    };
    protected abstract RouterClass: {
        new (nativeRouter: ANativeRouter, prevState: StoreState): ARouter;
    };
    protected abstract createUI: () => any;
    protected abstract toString: (domId: string, router: ARouter, ui: any) => void;
    boot(): {
        render(options?: RenderOptions): Promise<void>;
    };
}
export declare function mergeState(target?: any, ...args: any[]): any;
export declare const baseConfig: {
    StageViewName: string;
    MutableData: boolean;
    SSRDataKey: string;
    ClientRouter: IRouter;
    GetModule: (moduleName: string) => IModule | Promise<IModule> | undefined;
    ModuleGetter?: ModuleGetter;
};
export {};
//# sourceMappingURL=basic.d.ts.map