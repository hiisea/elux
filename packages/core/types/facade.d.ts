import { CommonModel, CommonModule, CommonModelClass, EluxComponent, AsyncEluxComponent, UStore, Action, ModuleState, RootState, RouteState } from './basic';
/*** @public */
export declare type PickHandler<F> = F extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : never;
/*** @public */
export declare type PickActions<T> = Pick<{
    [K in keyof T]: PickHandler<T[K]>;
}, {
    [K in keyof T]: T[K] extends Function ? Exclude<K, 'destroy' | 'init'> : never;
}[keyof T]>;
/*** @public */
export declare function exportModule<N extends string, H extends CommonModel, C extends {
    [componentName: string]: EluxComponent | AsyncEluxComponent;
}, D>(moduleName: N, ModelClass: CommonModelClass<H>, components: C, data?: D): {
    moduleName: N;
    initModel: (store: UStore) => void | Promise<void>;
    state: ReturnType<H['init']>;
    routeParams: H['defaultRouteParams'];
    actions: PickActions<H>;
    components: C;
    data: D;
};
/*** @public */
export declare type GetPromiseComponent<T> = T extends () => Promise<{
    default: infer R;
}> ? R : T;
/*** @public */
export declare type ReturnComponents<CS extends Record<string, EluxComponent | (() => Promise<{
    default: EluxComponent;
}>)>> = {
    [K in keyof CS]: GetPromiseComponent<CS[K]>;
};
/*** @public */
export declare type ModuleAPI<M extends CommonModule> = {
    name: string;
    components: ReturnComponents<M['components']>;
    state: M['state'];
    actions: M['actions'];
    actionNames: {
        [K in keyof M['actions']]: string;
    };
    routeParams: M['routeParams'];
    data: M['data'];
};
/*** @public */
export declare type GetPromiseModule<T> = T extends Promise<{
    default: infer R;
}> ? R : T;
/*** @public */
export declare type Facade<G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<{
        default: CommonModule<N>;
    }>;
} = any> = {
    [K in Extract<keyof G, string>]: ModuleAPI<GetPromiseModule<ReturnType<G[K]>>>;
};
/*** @public */
export declare type LoadComponent<F extends Facade = {}, O = any> = <M extends keyof F, V extends keyof F[M]['components']>(moduleName: M, componentName: V, options?: O) => F[M]['components'][V];
/*** @public */
export declare type FacadeActions<F extends Facade, R extends string> = {
    [K in Exclude<keyof F, R>]: keyof F[K]['actions'];
};
/*** @public */
export declare type FacadeRoutes<F extends Facade, R extends string> = {
    [K in Exclude<keyof F, R>]?: F[K]['routeParams'];
};
/*** @public */
export declare type FacadeModules<F extends Facade, R extends string> = {
    [K in Exclude<keyof F, R>]: Pick<F[K], 'name' | 'actions' | 'actionNames'>;
};
/*** @public */
export declare type FacadeStates<F extends Facade, R extends string> = {
    [K in keyof F]: K extends R ? RouteState<FacadeRoutes<F, R>, F[R]['data']> : F[K]['state'];
};
/*** @public */
export declare type HandlerThis<T> = T extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : undefined;
/*** @public */
export declare type ActionsThis<T> = {
    [K in keyof T]: HandlerThis<T[K]>;
};
/*** @public */
export declare abstract class BaseModel<MS extends ModuleState = {}, MP extends ModuleState = {}, RS extends RootState = {}> implements CommonModel {
    readonly moduleName: string;
    store: UStore;
    abstract defaultRouteParams: MP;
    abstract init(latestState: RootState, preState: RootState): MS;
    constructor(moduleName: string, store: UStore);
    protected get actions(): ActionsThis<this>;
    protected get router(): {
        routeState: RouteState;
    };
    protected getRouteParams(): MP;
    protected getLatestState(): RS;
    protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {
        [K in keyof T]: PickHandler<T[K]>;
    };
    protected getState(): MS;
    protected getRootState(): RS;
    protected getCurrentActionName(): string;
    protected getCurrentState(): MS;
    protected getCurrentRootState(): RS;
    protected dispatch(action: Action): void | Promise<void>;
    protected loadModel(moduleName: string): void | Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=facade.d.ts.map