import { IStore, IModuleHandlers, Action, IStoreMiddleware, ICoreRouteState, ICoreRouter } from './basic';
import { PickHandler, IModuleHandlersClass } from './inject';
export declare const routeMiddleware: IStoreMiddleware;
/**
 * @internal
 */
export declare class EmptyModuleHandlers implements IModuleHandlers {
    readonly moduleName: string;
    readonly store: IStore;
    initState: any;
    constructor(moduleName: string, store: IStore);
    destroy(): void;
}
export declare class RouteModuleHandlers<S extends ICoreRouteState> implements IModuleHandlers<S> {
    readonly moduleName: string;
    store: IStore;
    initState: S;
    constructor(moduleName: string, store: IStore, latestState: any, preState: any);
    destroy(): void;
}
export declare type IRouteModuleHandlersClass<S extends ICoreRouteState> = IModuleHandlersClass<IModuleHandlers<S>>;
/*** @internal */
export declare type HandlerThis<T> = T extends (...args: infer P) => any ? (...args: P) => {
    type: string;
} : undefined;
/*** @internal */
export declare type ActionsThis<T> = {
    [K in keyof T]: HandlerThis<T[K]>;
};
/**
 * ModuleHandlers基类
 * 所有ModuleHandlers必须继承此基类
 * @internal
 */
export declare class CoreModuleHandlers<S extends Record<string, any> = {}, R extends Record<string, any> = {}, U extends ICoreRouter = ICoreRouter> implements IModuleHandlers {
    readonly moduleName: string;
    store: IStore;
    readonly initState: S;
    constructor(moduleName: string, store: IStore, initState: S);
    protected get actions(): ActionsThis<this>;
    protected get router(): U;
    protected getLatestState(): R;
    protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {
        [K in keyof T]: PickHandler<T[K]>;
    };
    protected getState(): S;
    protected getRootState(): R;
    protected getCurrentActionName(): string;
    protected getCurrentState(): S;
    protected getCurrentRootState(): R;
    protected dispatch(action: Action): void | Promise<void>;
    protected loadModel(moduleName: string): void | Promise<void>;
    protected getRouteParams(): Record<string, any> | undefined;
    destroy(): void;
}
//# sourceMappingURL=router.d.ts.map