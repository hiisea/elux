import { EluxComponent, IModuleHandlers, CommonModule, ModuleGetter, IStore, ActionHandlerList } from './basic';
export declare type Handler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
declare type Actions<T> = Pick<{
    [K in keyof T]: Handler<T[K]>;
}, {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T]>;
export interface IModuleHandlersClass<H = IModuleHandlers> {
    new (moduleName: string, store: IStore, latestState: any): H;
}
export declare function exportModule<N extends string, H extends IModuleHandlers, P extends Record<string, any>, CS extends Record<string, EluxComponent | (() => Promise<EluxComponent>)>>(moduleName: N, ModuleHandlers: IModuleHandlersClass<H>, params: P, components: CS): {
    moduleName: N;
    model: (store: IStore) => void | Promise<void>;
    state: H['initState'];
    params: P;
    actions: Actions<H>;
    components: CS;
};
export declare function modelHotReplacement(moduleName: string, ModuleHandlers: IModuleHandlersClass): void;
export declare function getModule(moduleName: string): Promise<CommonModule> | CommonModule;
export declare function getModuleList(moduleNames: string[]): CommonModule[] | Promise<CommonModule[]>;
export declare function loadModel<MG extends ModuleGetter>(moduleName: keyof MG, store: IStore): void | Promise<void>;
export declare function getComponet(moduleName: string, componentName: string): EluxComponent | Promise<EluxComponent>;
export declare function getComponentList(keys: string[]): Promise<EluxComponent[]>;
export declare function loadComponet(moduleName: string, componentName: string, store: IStore, deps: Record<string, boolean>): EluxComponent | null | Promise<EluxComponent | null>;
export declare function getCachedModules(): Record<string, undefined | CommonModule | Promise<CommonModule>>;
declare type GetPromiseComponent<T> = T extends () => Promise<{
    default: infer R;
}> ? R : T;
declare type ReturnComponents<CS extends Record<string, EluxComponent | (() => Promise<{
    default: EluxComponent;
}>)>> = {
    [K in keyof CS]: GetPromiseComponent<CS[K]>;
};
declare type GetPromiseModule<T> = T extends Promise<{
    default: infer R;
}> ? R : T;
declare type ModuleFacade<M extends CommonModule> = {
    name: string;
    components: ReturnComponents<M['components']>;
    state: M['state'];
    params: M['params'];
    actions: M['actions'];
    actionNames: {
        [K in keyof M['actions']]: string;
    };
};
export declare type RootModuleFacade<G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<{
        default: CommonModule<N>;
    }>;
} = any> = {
    [K in Extract<keyof G, string>]: ModuleFacade<GetPromiseModule<ReturnType<G[K]>>>;
};
export declare type RootModuleActions<A extends RootModuleFacade> = {
    [K in keyof A]: keyof A[K]['actions'];
};
export declare type RootModuleAPI<A extends RootModuleFacade = RootModuleFacade> = {
    [K in keyof A]: Pick<A[K], 'name' | 'actions' | 'actionNames'>;
};
export declare type RootModuleParams<A extends RootModuleFacade = RootModuleFacade> = {
    [K in keyof A]: A[K]['params'];
};
export declare function getRootModuleAPI<T extends RootModuleFacade = any>(data?: Record<string, string[]>): RootModuleAPI<T>;
export declare function exportComponent<T>(component: T): T & EluxComponent;
export declare function exportView<T>(component: T): T & EluxComponent;
export declare type LoadComponent<A extends RootModuleFacade = {}, O = any> = <M extends keyof A, V extends keyof A[M]['components']>(moduleName: M, componentName: V, options?: O) => A[M]['components'][V];
export declare function injectActions(moduleName: string, handlers: ActionHandlerList, hmr?: boolean): void;
export declare function defineModuleGetter(moduleGetter: ModuleGetter): void;
export {};
