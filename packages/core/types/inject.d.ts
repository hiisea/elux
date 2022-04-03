import { CommonModel, CommonModule, IStore, EluxComponent, ModuleApiMap } from './basic';
/**
 * 获取导出的Module
 *
 * @remarks
 * {@link exportModule | exportModule(...)} 导出的 Module，可以通过此方法获得，返回结果有可能是一个Promise
 *
 * @param moduleName - 要获取的模块名
 *
 * @public
 */
export declare function getModule(moduleName: string): Promise<CommonModule> | CommonModule;
/**
 * 获取Module导出的EluxUI组件
 *
 * @remarks
 * {@link exportModule | exportModule(...)} 导出的 Component，可以通过此方法获得。
 *
 * - 与 {@link LoadComponent} 不同的是本方法只获取 Component 构造器，并不会实例化和Install
 *
 * - 返回结果有可能是一个Promise
 *
 * @param moduleName - 组件所属模块名
 * @param componentName - 组件被导出的名称
 *
 * @public
 */
export declare function getComponent(moduleName: string, componentName: string): EluxComponent | Promise<EluxComponent>;
export declare function getEntryComponent(): EluxComponent;
export declare function getModuleApiMap(data?: Record<string, string[]>): ModuleApiMap;
export declare function injectComponent(moduleName: string, componentName: string, store: IStore): EluxComponent | Promise<EluxComponent>;
export declare function injectActions(model: CommonModel, hmr?: boolean): void;
//# sourceMappingURL=inject.d.ts.map