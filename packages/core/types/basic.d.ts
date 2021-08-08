import { LoadingState, TaskCounter } from './sprite';
export declare const coreConfig: {
    NSP: string;
    MSP: string;
    MutableData: boolean;
    DepthTimeOnLoading: number;
};
export declare function buildConfigSetter<T extends Record<string, any>>(data: T): (config: Partial<T>) => void;
export declare const setCoreConfig: (config: Partial<{
    NSP: string;
    MSP: string;
    MutableData: boolean;
    DepthTimeOnLoading: number;
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
export interface IModuleHandlers {
    readonly moduleName: string;
    readonly initState: any;
    readonly store: IStore;
    destroy(): void;
}
export declare type Dispatch = (action: Action) => void | Promise<void>;
export declare type State = Record<string, Record<string, any>>;
export interface GetState<S extends State = {}> {
    (): S;
    (moduleName: string): Record<string, any> | undefined;
}
export interface BStoreOptions {
    initState?: any;
}
export interface BStore<S extends State = any> {
    readonly id: number;
    readonly router: ICoreRouter;
    baseFork: {
        creator: (options: BStoreOptions, router: ICoreRouter, id?: number) => BStore;
        options: BStoreOptions;
    };
    dispatch: Dispatch;
    getState: GetState<S>;
    update: (actionName: string, state: Partial<S>, actionData: any[]) => void;
    replaceState(state: S): void;
    destroy(): void;
}
export declare type IStoreMiddleware = (api: {
    getState: GetState;
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
export interface IStore<S extends State = any> extends BStore<S> {
    getCurrentActionName: () => string;
    getCurrentState: GetState<S>;
    injectedModules: {
        [moduleName: string]: IModuleHandlers;
    };
    loadingGroups: Record<string, TaskCounter>;
    fork: {
        middlewares?: IStoreMiddleware[];
    };
}
export interface ICoreRouter {
    init(store: IStore): void;
    getCurrentStore(): IStore;
    getStoreList(): IStore[];
    getParams(): any;
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
export declare type ModuleSetup = 'afterSSR' | 'afterFork' | '';
export declare const ActionTypes: {
    MLoading: string;
    MInit: string;
    MReInit: string;
    Error: string;
    Replace: string;
};
export declare function errorAction(error: Object): Action;
export declare function moduleInitAction(moduleName: string, initState: any, setup: ModuleSetup): Action;
export declare function moduleLoadingAction(moduleName: string, loadingState: {
    [group: string]: LoadingState;
}): Action;
export interface EluxComponent {
    __elux_component__: 'view' | 'component';
}
export declare function isEluxComponent(data: any): data is EluxComponent;
export declare const MetaData: {
    facadeMap: FacadeMap;
    appModuleName: string;
    routeModuleName: string;
    moduleGetter: ModuleGetter;
    injectedModules: Record<string, boolean>;
    reducersMap: ActionHandlerMap;
    effectsMap: ActionHandlerMap;
    moduleCaches: Record<string, undefined | CommonModule | Promise<CommonModule>>;
    componentCaches: Record<string, undefined | EluxComponent | Promise<EluxComponent>>;
    currentRouter: ICoreRouter;
};
export declare function injectActions(moduleName: string, handlers: ActionHandlerList): void;
export declare function setLoading<T extends Promise<any>>(store: IStore, item: T, moduleName: string, groupName: string): T;
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
export declare function effect(loadingKey?: string | null): Function;
export declare const mutation: typeof reducer;
export declare const action: typeof effect;
export declare function logger(before: (action: Action, promiseResult: Promise<any>) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: any, effectResult: any) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
export declare function deepMergeState(target?: any, ...args: any[]): any;
export declare function mergeState(target?: any, ...args: any[]): any;
