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
export interface Action {
    type: string;
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
export interface IModuleHandlers<S = any> {
    readonly moduleName: string;
    readonly initState: S;
    readonly store: IStore;
    destroy(): void;
}
export declare type Dispatch = (action: Action) => void | Promise<void>;
export declare type State = Record<string, Record<string, any>>;
export interface GetState<S extends State = {}> {
    (): S;
    (moduleName: string): Record<string, any> | undefined;
}
export interface StoreOptions {
    initState?: Record<string, any>;
}
export interface StoreBuilder<O extends StoreOptions = StoreOptions, B extends BStore = BStore> {
    storeOptions: O;
    storeCreator: (options: O, id?: number) => B;
}
export interface BStore<S extends State = any> {
    id: number;
    builder: StoreBuilder;
    dispatch: Dispatch;
    getState: GetState<S>;
    update: (actionName: string, state: Partial<S>, actionData: any[]) => void;
    destroy(): void;
}
export declare type IStoreMiddleware = (api: {
    store: IStore;
    getState: GetState;
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
export interface IStore<S extends State = any> extends BStore<S> {
    router: ICoreRouter;
    getCurrentActionName: () => string;
    getCurrentState: GetState<S>;
    injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    loadingGroups: Record<string, TaskCounter>;
    options: {
        middlewares?: IStoreMiddleware[];
    };
}
export interface ICoreRouteState {
    action: string;
    params: any;
}
export interface ICoreRouter {
    routeState: ICoreRouteState;
    startup(store: IStore, request?: unknown, response?: unknown): void;
    getCurrentStore(): IStore;
    getStoreList(): IStore[];
    readonly name: string;
    latestState: Record<string, any>;
}
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
export declare type ModuleGetter = Record<string, () => CommonModule | Promise<{
    default: CommonModule;
}>>;
export declare type FacadeMap = Record<string, {
    name: string;
    actions: ActionCreatorList;
    actionNames: Record<string, string>;
}>;
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
export declare function deepMergeState(target?: any, ...args: any[]): any;
export declare function mergeState(target?: any, ...args: any[]): any;
