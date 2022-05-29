import { CommonModel, CommonModule, EluxComponent, IStore, ModuleApiMap } from './basic';
/**
 * 模块是否存在
 *
 * @remarks
 * 即ModuleGetter中是否有配置该模块的获取方式
 *
 * @public
 */
export declare function moduleExists(moduleName: string): boolean;
export declare function getModule(moduleName: string): Promise<CommonModule> | CommonModule;
export declare function getComponent(moduleName: string, componentName: string): EluxComponent | Promise<EluxComponent>;
export declare function getEntryComponent(): EluxComponent;
export declare function getModuleApiMap(data?: Record<string, string[]>): ModuleApiMap;
/**
 * 动态注册Module
 *
 * @remarks
 * 常于小程序分包加载
 *
 * @public
 */
export declare function injectModule(module: CommonModule): void;
/**
 * 动态注册module
 *
 * @remarks
 * 常于小程序分包加载
 *
 * @public
 */
export declare function injectModule(moduleName: string, moduleGetter: () => CommonModule | Promise<{
    default: CommonModule;
}>): void;
export declare function injectComponent(moduleName: string, componentName: string, store: IStore): EluxComponent | Promise<EluxComponent>;
export declare function injectActions(model: CommonModel, hmr?: boolean): void;
//# sourceMappingURL=inject.d.ts.map