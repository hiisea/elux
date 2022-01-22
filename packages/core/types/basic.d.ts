import { TaskCounter } from './sprite';
export declare const coreConfig: {
    NSP: string;
    MSP: string;
    MutableData: boolean;
    DepthTimeOnLoading: number;
    AppModuleName: string;
    RouteModuleName: string;
};
export declare function buildConfigSetter<T extends Record<string, any>>(data: T): (config: Partial<T>) => void;
export declare const setCoreConfig: (config: Partial<{
    NSP: string;
    MSP: string;
    MutableData: boolean;
    DepthTimeOnLoading: number;
    AppModuleName: string;
    RouteModuleName: string;
}>) => void;
/**
 * @public
 */
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
export declare type ActionHandlerList = Record<string, ActionHandler>;
export declare type ActionHandlerMap = Record<string, ActionHandlerList>;
export declare type ActionCreator = (...args: any[]) => Action;
export declare type ActionCreatorList = Record<string, ActionCreator>;
export declare type ActionCreatorMap = Record<string, ActionCreatorList>;
/**
 * @public
 */
export interface IModuleHandlers<S = any> {
    readonly moduleName: string;
    readonly initState: S;
    readonly store: IStore;
    destroy(): void;
}
/**
 * @public
 */
export declare type Dispatch = (action: Action) => void | Promise<void>;
/**
 * @public
 */
export declare type State = Record<string, Record<string, any>>;
/**
 * @public
 */
export interface GetState<S extends State = {}> {
    (): S;
    (moduleName: string): Record<string, any> | undefined;
}
/**
 * @public
 */
export declare type IStoreLogger = ({ id, isActive }: {
    id: number;
    isActive: boolean;
}, actionName: string, payload: any[], priority: string[], handers: string[], state: object, effect: boolean) => void;
/**
 * @public
 */
export interface IFlux<S extends State = any> {
    getState: GetState<S>;
    update: (actionName: string, state: Partial<S>) => void;
    subscribe(listener: () => void): () => void;
}
/**
 * @public
 */
export interface IStore<S extends State = any> extends IFlux<S> {
    sid: number;
    dispatch: Dispatch;
    router: ICoreRouter;
    getCurrentActionName: () => string;
    getCurrentState: GetState<S>;
    injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    loadingGroups: Record<string, TaskCounter>;
    isActive(): boolean;
    setActive(status: boolean): void;
    destroy(): void;
    options: {
        initState: (data: S) => S;
        middlewares?: IStoreMiddleware[];
        logger?: IStoreLogger;
    };
}
/**
 * @public
 */
export declare type IStoreMiddleware = (api: {
    getState: GetState;
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
/**
 * @public
 */
export interface ICoreRouteState {
    action: string;
    params: any;
}
/**
 * @public
 */
export interface ICoreRouter<ST extends ICoreRouteState = ICoreRouteState> {
    routeState: ST;
    startup(store: IStore): void;
    getCurrentStore(): IStore;
    getStoreList(): IStore[];
    readonly name: string;
    latestState: Record<string, any>;
}
/**
 * @public
 */
export interface CommonModule<ModuleName extends string = string> {
    moduleName: ModuleName;
    model: (store: IStore) => void | Promise<void>;
    state: Record<string, any>;
    params: Record<string, any>;
    actions: Record<string, (...args: any[]) => Action>;
    components: Record<string, EluxComponent | (() => Promise<{
        default: EluxComponent;
    }>)>;
}
/**
 * @internal
 */
export declare type ModuleGetter = Record<string, () => CommonModule | Promise<{
    default: CommonModule;
}>>;
export declare type FacadeMap = Record<string, {
    name: string;
    actions: ActionCreatorList;
    actionNames: Record<string, string>;
}>;
/**
 * @public
 */
export interface EluxComponent {
    __elux_component__: 'view' | 'component';
}
export declare function isEluxComponent(data: any): data is EluxComponent;
export declare const MetaData: {
    facadeMap: FacadeMap;
    moduleGetter: ModuleGetter;
    moduleExists: Record<string, boolean>;
    injectedModules: Record<string, boolean>;
    reducersMap: ActionHandlerMap;
    effectsMap: ActionHandlerMap;
    moduleCaches: Record<string, undefined | CommonModule | Promise<CommonModule>>;
    componentCaches: Record<string, undefined | EluxComponent | Promise<EluxComponent>>;
    currentRouter: ICoreRouter;
};
export declare function moduleExists(): Record<string, boolean>;
/**
 * @internal
 */
export declare function deepMergeState(target?: any, ...args: any[]): any;
export declare function mergeState(target?: any, ...args: any[]): any;
//# sourceMappingURL=basic.d.ts.map