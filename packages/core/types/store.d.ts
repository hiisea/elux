import { Action, CommonModelClass, Dispatch, IRouter, IStore, ModuleState, StoreMiddleware, StoreState } from './basic';
import { Listener, TaskCounter, UNListener } from './utils';
export declare function getActionData(action: Action): any[];
export declare const preMiddleware: StoreMiddleware;
export declare class Store implements IStore {
    readonly sid: number;
    readonly uid: number;
    readonly router: IRouter;
    state: StoreState;
    private injectedModels;
    private mountedModules;
    private currentListeners;
    private nextListeners;
    private currentAction;
    private uncommittedState;
    active: boolean;
    dispatch: Dispatch;
    loadingGroups: {
        [moduleNameAndGroupName: string]: TaskCounter;
    };
    constructor(sid: number, uid: number, router: IRouter);
    clone(brand?: boolean): Store;
    hotReplaceModel(moduleName: string, ModelClass: CommonModelClass): void;
    getCurrentAction(): Action;
    mount(moduleName: string, env: 'init' | 'route' | 'update'): void | Promise<void>;
    setActive(): void;
    setInactive(): void;
    private ensureCanMutateNextListeners;
    destroy(): void;
    private update;
    getState(): StoreState;
    getState(moduleName: string): ModuleState;
    getUncommittedState(): ModuleState;
    subscribe(listener: Listener): UNListener;
    private respondHandler;
}
/**
 * model热更新
 *
 * @remarks
 * 修改了Model时热更新，通常由脚手架自动调用
 *
 * @param moduleName - Model所属模块名称
 * @param ModelClass - 新的Model
 *
 * @public
 */
export declare function modelHotReplacement(moduleName: string, ModelClass: CommonModelClass): void;
//# sourceMappingURL=store.d.ts.map