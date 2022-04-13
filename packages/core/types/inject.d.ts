import { CommonModel, CommonModule, EluxComponent, IStore, ModuleApiMap } from './basic';
/**
 * 获取Module
 *
 * @remarks
 * 获取通过 {@link exportModule} 导出的 Module
 *
 * @public
 */
export declare function getModule(moduleName: string): Promise<CommonModule> | CommonModule;
/**
 * 获取导出的UI组件
 *
 * @remarks
 * 获取通过 {@link exportModule} 导出的 Component。与 {@link ILoadComponent} 不同的是本方法只获取 Component 构造器，并不会render
 *
 * @public
 */
export declare function getComponent(moduleName: string, componentName: string): EluxComponent | Promise<EluxComponent>;
export declare function getEntryComponent(): EluxComponent;
export declare function getModuleApiMap(data?: Record<string, string[]>): ModuleApiMap;
export declare function injectComponent(moduleName: string, componentName: string, store: IStore): EluxComponent | Promise<EluxComponent>;
export declare function injectActions(model: CommonModel, hmr?: boolean): void;
//# sourceMappingURL=inject.d.ts.map