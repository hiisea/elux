import { Action, CommonModel, CommonModelClass, CommonModule, EluxComponent, AsyncEluxComponent, ModuleState, IStore } from './basic';
/**
 * 向外导出一个EluxUI组件
 *
 * @remarks
 * 不同于普通UI组件，EluxUI组件可通过 {@link LoadComponent} 来加载，参见 {@link exportModule}
 *
 * {@link exportComponent} VS {@link exportView} 参见：`Elux中组件与视图的区别`
 *
 * @param component - 普通UI组件（如React组件、Vue组件）
 *
 * @returns
 * 返回实现 EluxComponent 接口的UI组件
 *
 * @public
 */
export declare function exportComponent<T>(component: T): T & EluxComponent;
/**
 *
 * {@inheritDoc exportComponent}
 *
 * @public
 */
export declare function exportView<T>(component: T): T & EluxComponent;
/**
 * 一个空的Model
 *
 * @remarks
 * 常用于Mock一个空Module
 *
 * @public
 */
export declare class EmptyModel implements CommonModel {
    readonly moduleName: string;
    protected readonly store: IStore;
    get state(): ModuleState;
    constructor(moduleName: string, store: IStore);
    onMount(): void;
    onActive(): void;
    onInactive(): void;
    protected _initState(state: ModuleState): ModuleState;
}
export declare function exportModuleFacade(moduleName: string, ModelClass: CommonModelClass, components: {
    [componentName: string]: EluxComponent | AsyncEluxComponent;
}, data?: any): CommonModule;
/**
 * 将{@link LoadingState | LoadingState}注入指定ModuleState
 *
 * @param item - 要跟踪的异步任务，必须是一个Promise
 * @param store - 指明注入哪一个Store中
 * @param moduleName - 指明注入哪一个Modulde状态中
 * @param groupName - 指明注入Modulde状态的loading[`groupName`]中
 *
 * @returns
 * 返回第一个入参
 *
 * @public
 */
export declare function setLoading<T extends Promise<any>>(item: T, store: IStore, _moduleName?: string, _groupName?: string): T;
/**
 * Model Decorator函数-申明effect执行钩子
 *
 * @remarks
 * 用于在以下 effect 中注入 before 和 after 的钩子，常用来跟踪effect执行情况
 *
 * @param before - 该 effect 执行前自动调用
 * @param after - 该 effect 执行后自动调用（无论成功与否）
 *
 * @returns
 * 返回ES6装饰器
 *
 * @public
 */
export declare function effectLogger(before: (store: IStore, action: Action, effectResult: unknown) => void, after: null | ((status: 'Rejected' | 'Resolved', beforeResult: unknown, effectResult: unknown) => void)): (target: any, key: string, descriptor: PropertyDescriptor) => void;
/**
 * Model Decorator函数-申明reducer
 *
 * @remarks
 * 申明以下方法为一个 action reducer
 *
 * @public
 */
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
/**
 * Model Decorator函数-申明effect
 *
 * @remarks
 * 申明以下方法为一个 action effect，
 * 参数 `loadingKey` 不传时默认为 stage.loading.global，
 * 如果不需要跟踪其执行状态，请使用 null 参数，如：`@effect(null)`
 *
 * @example
 * - `@effect('this.loading.searchTable')` 将该 effect 执行状态注入本模块的 `loading.searchTable` 状态中
 *
 * - `@effect()` 等于 `@effect('stage.loading.global')`
 *
 * - `@effect(null)` 不跟踪其执行状态
 *
 * @param loadingKey - 将该 effect 执行状态作为 {@link LoadingState | LoadingState} 注入指定的 ModuleState 中。
 *
 * @returns
 * 返回ES6装饰器
 *
 * @public
 */
export declare function effect(loadingKey?: string | null): Function;
//# sourceMappingURL=module.d.ts.map