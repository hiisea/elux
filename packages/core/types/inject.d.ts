import { CommonModule, EluxComponent, ModuleGetter, UStore, EStore } from './basic';
/*** @public */
export declare function getModule(moduleName: string): Promise<CommonModule> | CommonModule;
export declare function getModuleList(moduleNames: string[]): CommonModule[] | Promise<CommonModule[]>;
/*** @public */
export declare function getComponent(moduleName: string, componentName: string): EluxComponent | Promise<EluxComponent>;
export declare function getComponentList(keys: string[]): Promise<EluxComponent[]>;
/*** @public */
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