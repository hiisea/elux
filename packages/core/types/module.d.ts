import { Action, AsyncEluxComponent, CommonModel, CommonModelClass, CommonModule, EluxComponent, IStore, ModuleState } from './basic';
/**
 * 向外导出UI组件
 *
 * @remarks
 * 不同于普通UI组件，EluxUI组件可通过 {@link ILoadComponent} 按需加载
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
 * 实现了CommonModel的空Model
 *
 * @remarks
 * 常用于 mock 假数据
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
 *
 * @returns
 * 返回跟踪的异步任务
 *
 * @public
 */
export declare function setLoading<T extends Promise<any>>(item: T, store: IStore, _moduleName?: string, _groupName?: string): T;
/**
 * Model类的装饰器函数:跟踪effect执行钩子
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
 * Model类的装饰器函数:申明reducer
 *
 * @public
 */
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
/**
 * Model类的装饰器函数:申明effect
 *
 * @example
 * - `@effect('this.searchTableLoading')` 将该 effect 执行状态注入本模块的 `searchTableLoading` 状态中
 *
 * - `@effect()` 等于 `@effect('stage.globalLoading')`
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