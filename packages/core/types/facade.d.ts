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
/**
 * Model基类
 *
 * @remarks
 * - `TModuleState`: 本模块的状态结构
 *
 * - `TRouteParams`: 本模块的路由参数结构
 *
 * - `TRootState`: 全局状态结构
 *
 * @typeParam TModuleState - 本模块的状态结构
 * @typeParam TRouteParams - 本模块的路由参数结构
 * @typeParam TRootState - 全局状态结构
 *
 * @public
 */
export declare abstract class BaseModel<TModuleState extends ModuleState = {}, TRouteParams extends ModuleState = {}, TRootState extends RootState = {}> implements CommonModel {
    readonly moduleName: string;
    store: UStore;
    /**
     * 本模块的路由参数默认值
     *
     * @remarks
     * 实际路由参数由`URL传值`+`默认值`deepMerge所得
     *
     */
    abstract defaultRouteParams: TRouteParams;
    /**
     * 获取本模块的状态初始值
     *
     * @remarks
     * 模块初始化时将调用此方法获取状态初始值
     *
     * @param latestState - 当前最新的全局状态（多个PageStore合并后的状态）
     * @param preState - 提前预置的全局状态（通常用于SSR时传递脱水状态）
     *
     * @returns 返回本模块的状态初始值
     *
     */
    abstract init(latestState: RootState, preState: RootState): TModuleState;
    constructor(moduleName: string, store: UStore);
    /**
     * 获取本模块的公开actions构造器
     */
    protected get actions(): ActionsThis<this>;
    /**
     * 获取当前Router
     */
    protected get router(): unknown;
    /**
     * 获取本模块当前路由参数
     */
    protected getRouteParams(): TRouteParams;
    /**
     * 获取全局的当前状态
     *
     * @remarks
     * 注意一下三者的区别
     *
     * - getRootState(): TRootState
     * - getCurrentRootState(): TRootState
     * - getLatestState(): TRootState
     */
    protected getLatestState(): TRootState;
    /**
     * 获取本模块的私有actions构造器
     */
    protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {
        [K in keyof T]: PickHandler<T[K]>;
    };
    /**
     * 获取本模块的当前状态
     */
    protected getState(): TModuleState;
    /** {@inheritDoc BaseModel.getLatestState} */
    protected getRootState(): TRootState;
    /**
     * 获取当前执行的action.type
     */
    protected getCurrentActionName(): string;
    /**
     * 获取本模块的实时状态
     */
    protected getCurrentState(): TModuleState;
    /** {@inheritDoc BaseModel.getLatestState} */
    protected getCurrentRootState(): TRootState;
    protected dispatch(action: Action): void | Promise<void>;
    protected loadModel(moduleName: string): void | Promise<void>;
    destroy(): void;
}
//# sourceMappingURL=facade.d.ts.map