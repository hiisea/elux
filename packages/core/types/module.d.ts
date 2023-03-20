import { AsyncEluxComponent, EluxComponent, IModel, IModelClass, IModule, IStore, ModelAsCreators } from './basic';
export declare function exportModuleFacade(moduleName: string, ModelClass: IModelClass, components: {
    [componentName: string]: EluxComponent | AsyncEluxComponent;
}, data?: any): IModule;
export declare type ModuleApiMap = {
    [moduleName: string]: {
        name: string;
        actions: ModelAsCreators;
        actionNames: {
            [key: string]: string;
        };
    };
};
/**
 * 模块是否存在
 *
 * @remarks
 * 即ModuleGetter中是否有配置该模块的获取方式
 *
 * @public
 */
export declare function moduleExists(moduleName: string): boolean;
export declare function getModule(moduleName: string): Promise<IModule> | IModule | undefined;
export declare function getComponent(moduleName: string, componentName: string): Promise<EluxComponent> | EluxComponent | undefined;
export declare function getEntryComponent(): EluxComponent;
export declare function getModuleApiMap(data?: {
    [moduleName: string]: string[];
}): ModuleApiMap;
/**
 * 动态注册Module
 *
 * @remarks
 * 常于小程序分包加载
 *
 * @public
 */
export declare function injectModule(module: IModule): void;
/**
 * 动态注册module
 *
 * @remarks
 * 常于小程序分包加载
 *
 * @public
 */
export declare function injectModule(moduleName: string, moduleGetter: () => IModule | Promise<{
    default: IModule;
}>): void;
export declare function loadComponent(moduleName: string, componentName: string, store: IStore): Promise<EluxComponent> | EluxComponent | undefined;
export declare function injectActions(model: IModel, hmr?: boolean): void;
export declare const moduleConfig: {
    ModuleCaches: {
        [moduleName: string]: undefined | IModule | Promise<IModule>;
    };
    ComponentCaches: {
        [moduleNameAndComponentName: string]: undefined | EluxComponent | Promise<EluxComponent>;
    };
    ModuleApiMap: ModuleApiMap;
};
//# sourceMappingURL=module.d.ts.map