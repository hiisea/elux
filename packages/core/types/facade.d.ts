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
 * Model基类中提供了一些常用的方法
 *
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
     * 模块初始化时将调用此方法获取状态初始值，同一个Store中，每个模块只会执行一次初始化。
     * 此方法除了返回状态初始值之外，还可以执行一些其它初始化动作，如果有某些副作用，请记得在{@link BaseModel.destroy | BaseModel.destroy()}中清除
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
     * 获取全局的状态
     *
     * @remarks
     * 以下三者都是获取全局的状态，请注意它们之间的区别：
     *
     * - {@link BaseModel.getRootState | getRootState(): TRootState}
     *
     * - {@link BaseModel.getUncommittedState | getUncommittedState(): TRootState}
     *
     * - {@link BaseModel.getLatestState | getLatestState(): TRootState}
     *
     * - `getRootState()` VS `getUncommittedState()`：RootState由多个MoudleState组成，每个Module独立维护自己的MoudleState。
     * 当一个Action触发多个不同Module的reducer时，这些reducer将顺序执行并返回新的ModuleState。
     * 当所有reducer执行完毕时，最后才一次性commit至store，所以在执行commit之前，通过getRootState()得到的依然是原数据，而通过getUncommittedState()得到的是实时数据。
     * 比如：ModuleA、ModuleB 都监听了Action `stage.putUser`，ModuleA先执行了reducer并分别返回了`NewModuleAState`，
     * 然后ModuleB执行reducer时，它想通过getRootState()获取`NewModuleAState`是无效的，因为此时`NewModuleAState`还未commit至store中，此时必须使用getUncommittedState()。
     * 因此通过getUncommittedState()获取的RootState比getRootState()要更实时。
     *
     * - `getUncommittedState()`在MutableData模式下（如VUE）无使用的意义，因为可变数据不存在commit的事务性，它是实时修改的。
     *
     * - `getRootState()` VS `getLatestState()`：使用虚拟多页时，应用可能同时存在多个`虚拟Page`（但有且只有一个最顶层的`虚拟Page`处于激活状态），
     * 每个`虚拟Page`将对应一个独立的Store，每个Store都由自己独立的RootState，它们里面存储的ModuleState并不完全一样。
     * getRootState()只能得到自己Store的RootState，而getLatestState()得到的是多个Store合并后的RootState。
     * 因此通过getLatestState()获取的RootState比getRootState()要更新，getLatestState()一般用于涉及跨`虚拟Page`之间的状态同步。
     *
     */
    protected getLatestState(): TRootState;
    /** {@inheritDoc BaseModel.getLatestState} */
    protected getRootState(): TRootState;
    /** {@inheritDoc BaseModel.getLatestState} */
    protected getUncommittedState(): TRootState;
    /**
     * 获取本模块的状态
     *
     * @remarks
     * 此方法类是 {@link BaseModel.getRootState | getRootState(this.moduleName)} 的快捷调用
     *
     */
    protected getState(): TModuleState;
    /**
     * 获取本模块的公开actions构造器
     */
    protected get actions(): ActionsThis<this>;
    /**
     * 获取本模块的私有actions构造器
     *
     * @remarks
     * 有些action并只在本Model内部调用，应当将其定义为`protected`或`private`权限，此时将无法通过`this.actions`获得其构造器
     *
     * @example
     * ```ts
     * const privateAction = this.getPrivateActions({renameUser: this.renameUser});
     * this.dispatch(privateAction.renameUser('jimmy'))
     * ```
     */
    protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {
        [K in keyof T]: PickHandler<T[K]>;
    };
    /**
     * 获取当前Router
     */
    protected get router(): unknown;
    /**
     * 获取本模块当前路由参数
     */
    protected getRouteParams(): TRouteParams;
    /**
     * 获取当前触发的action.type
     */
    protected getCurrentActionName(): string;
    /**
     * 等同于this.store.dispatch(action)
     */
    protected dispatch(action: Action): void | Promise<void>;
    /**
     * 手动加载Module并初始化其Model
     *
     * @remarks
     * 大部分情况下，框架将自动按需加载Module并初始化其Model，无需手动加载
     *
     */
    protected loadModel(moduleName: string): void | Promise<void>;
    /**
     * model被销毁时的hook钩子
     *
     * @remarks
     * 在虚拟多页模式下，`虚拟Page`被出栈时，Page对应的Store将被destroy()，Store对应的Model实例也将被destroy()
     *
     */
    destroy(): void;
}
//# sourceMappingURL=facade.d.ts.map