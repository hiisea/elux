import { CommonModelClass, EluxComponent, AsyncEluxComponent, UStore, RouteState, RootState, ModuleMap, ModuleState, CommonModule, CommonModel } from './basic';
export declare function baseExportModule(moduleName: string, ModelClass: CommonModelClass, components: {
    [componentName: string]: EluxComponent | AsyncEluxComponent;
}, data?: any): CommonModule;
export declare function injectActions(moduleName: string, model: CommonModel, hmr?: boolean): void;
/**
 * model热更新
 *
 * @remarks
 * 修改了Model时热更新runtime，通常由脚手架自动调用
 *
 * @param moduleName - Model所属模块名称
 * @param ModelClass - 新的Model
 *
 * @public
 */
export declare function modelHotReplacement(moduleName: string, ModelClass: CommonModelClass): void;
export declare function getModuleMap(data?: Record<string, string[]>): ModuleMap;
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
    readonly store: UStore;
    initState: any;
    defaultRouteParams: any;
    constructor(moduleName: string, store: UStore);
    init(): ModuleState;
    destroy(): void;
}
export declare class RouteModel implements CommonModel {
    readonly moduleName: string;
    readonly store: UStore;
    defaultRouteParams: ModuleState;
    constructor(moduleName: string, store: UStore);
    init(latestState: RootState, preState: RootState): RouteState;
    destroy(): void;
}
//# sourceMappingURL=modules.d.ts.map