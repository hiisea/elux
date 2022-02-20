import { CommonModule, EluxComponent, ModuleGetter, UStore, EStore } from './basic';
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
export declare function getModuleList(moduleNames: string[]): CommonModule[] | Promise<CommonModule[]>;
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
export declare function getComponentList(keys: string[]): Promise<EluxComponent[]>;
/**
 * 手动加载并初始化一个Model
 *
 * @remarks
 * 通常情况下无需手动加载，因为以下2种情况都将自动加载：
 *
 * - {@link Dispatch} 一个 ModuleA.xxxAction 时，如果 ModuleA 未被注册，将自动加载 ModuleA 并初始化其 Model
 *
 * - UI Render一个通过 {@link LoadComponent} 加载的ModuleA-UI组件，如果 ModuleA 未被注册，将自动加载 ModuleA 并初始化其 Model
 *
 * @param moduleName - 要加载的 module 名称
 * @param store - 要注册该 Model 的 Store
 *
 * @public
 */
export declare function loadModel<MG extends ModuleGetter>(moduleName: keyof MG, store: UStore): void | Promise<void>;
export declare function loadComponent(moduleName: string, componentName: string, store: EStore, deps: Record<string, boolean>): EluxComponent | null | Promise<EluxComponent | null>;
export declare function moduleExists(): {
    [moduleName: string]: boolean;
};
export declare function getCachedModules(): {
    [moduleName: string]: undefined | CommonModule | Promise<CommonModule>;
};
export declare function defineModuleGetter(moduleGetter: ModuleGetter): void;
//# sourceMappingURL=inject.d.ts.map