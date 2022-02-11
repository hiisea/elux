import { CommonModelClass, EluxComponent, AsyncEluxComponent, UStore, RouteState, RootState, ModuleMap, ModuleState, CommonModule, CommonModel } from './basic';
export declare function exportModule(moduleName: string, ModelClass: CommonModelClass, components: {
    [componentName: string]: EluxComponent | AsyncEluxComponent;
}, data?: any): CommonModule;
export declare function injectActions(moduleName: string, model: CommonModel, hmr?: boolean): void;
/*** @public */
export declare function modelHotReplacement(moduleName: string, ModelClass: CommonModelClass): void;
export declare function getModuleMap(data?: Record<string, string[]>): ModuleMap;
/*** @public */
export declare function exportComponent<T>(component: T): T & EluxComponent;
/*** @public */
export declare function exportView<T>(component: T): T & EluxComponent;
/*** @public */
export declare class EmptyModel implements CommonModel {
    readonly moduleName: string;
    readonly store: UStore;
    initState: any;
    defaultRouteParams: any;
    constructor(moduleName: string, store: UStore);
    init(): ModuleState;
    destroy(): void;
}
/*** @public */
export declare class RouteModel implements CommonModel {
    readonly moduleName: string;
    readonly store: UStore;
    defaultRouteParams: ModuleState;
    constructor(moduleName: string, store: UStore);
    init(latestState: RootState, preState: RootState): RouteState;
    destroy(): void;
}
//# sourceMappingURL=modules.d.ts.map