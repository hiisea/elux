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
/*** @public */
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
     * 开始深度加载，对于加载时间超过setLoadingDepthTime设置值时将转为深度加载状态
     */
    Depth = "Depth"
}
/*** @public */
export interface Action {
    type: string;
    /**
     * priority属性用来设置handlers的优先处理顺序，值为moduleName[]
     */
    priority?: string[];
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
/*** @public */
export declare type Dispatch = (action: Action) => void | Promise<void>;
/*** @public */
export declare type ModuleState = {
    [key: string]: any;
};
/*** @public */
export declare type RootState = {
    [moduleName: string]: ModuleState | undefined;
};
/*** @public */
export interface GetState<RS extends RootState = RootState> {
    (): RS;
    <N extends string>(moduleName: N): RS[N];
}
export interface Flux {
    getState: GetState;
    update: (actionName: string, state: RootState) => void;
    subscribe(listener: () => void): UNListener;
}
/*** @public */
export interface UStore<RS extends RootState = RootState, PS extends RootState = RootState> {
    sid: number;
    dispatch: Dispatch;
    isActive(): boolean;
    getState: GetState<RS>;
    getRouteParams: GetState<PS>;
    subscribe(listener: () => void): UNListener;
}
/*** @public */
export declare type HistoryAction = 'PUSH' | 'BACK' | 'REPLACE' | 'RELAUNCH';
/*** @public */
export interface RouteState<P extends RootState = RootState, N extends string = string> {
    action: HistoryAction;
    key: string;
    pagename: N;
    params: P;
}
export interface CoreRouter {
    routeState: RouteState;
    startup(store: EStore): void;
    getCurrentStore(): EStore;
    getStoreList(): EStore[];
    latestState: RootState;
}
/*** @public */
export interface EluxComponent {
    __elux_component__: 'view' | 'component';
}
/*** @public */
export declare type AsyncEluxComponent = () => Promise<{
    default: EluxComponent;
}>;
export declare function isEluxComponent(data: any): data is EluxComponent;
/*** @public */
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
/*** @public */
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
/*** @public */
export declare type StoreMiddleware = (api: {
    getStore: () => UStore;
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
/*** @public */
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
/*** @public */
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
/*** @public */
export declare function isServer(): boolean;
//# sourceMappingURL=basic.d.ts.map