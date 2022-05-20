import { Action, CommonModelClass, Dispatch, IRouter, IRouteRecord, IStore, Location, ModuleState, RouteAction, RouteEvent, RouterInitOptions, RouteRuntime, RouteTarget, StoreMiddleware, StoreState } from './basic';
import { Listener, TaskCounter, UNListener } from './utils';
export declare function getActionData(action: Action): any[];
export declare const preMiddleware: StoreMiddleware;
export declare abstract class CoreRouter implements IRouter {
    runtime: RouteRuntime;
    location: Location;
    initOptions: RouterInitOptions;
    protected listenerId: number;
    protected readonly listenerMap: {
        [id: string]: (data: RouteEvent) => void | Promise<void>;
    };
    action: RouteAction;
    routeKey: string;
    constructor();
    getHistoryUrls(target?: RouteTarget): string[];
    addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
    dispatch(data: RouteEvent): void | Promise<void>;
    abstract init(initOptions: RouterInitOptions, prevState: StoreState): Promise<void>;
    abstract getActivePage(): {
        store: IStore;
        location: Location;
    };
    abstract getCurrentPages(): {
        store: IStore;
        location: Location;
    }[];
    abstract getHistoryLength(target?: RouteTarget): number;
    abstract getHistory(target?: RouteTarget): IRouteRecord[];
    abstract findRecordByKey(key: string): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    abstract findRecordByStep(delta: number, rootOnly: boolean): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
    abstract relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
    abstract push(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
    abstract replace(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
    abstract back(stepOrKey?: string | number, target?: RouteTarget, payload?: any, overflowRedirect?: string): void | Promise<void>;
}
export declare class Store implements IStore {
    readonly sid: number;
    readonly router: IRouter;
    private state;
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
    constructor(sid: number, router: IRouter);
    clone(): Store;
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