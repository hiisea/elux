import { Listener, UNListener, TaskCounter } from './utils';
import { Action, CommonModelClass, StoreMiddleware, StoreState, ModuleState, IRouter, IStore, RouteRuntime, Dispatch, IRouteRecord, Location, RouteAction, RouteTarget } from './basic';
export declare function getActionData(action: Action): any[];
export declare const preMiddleware: StoreMiddleware;
interface RouterEvent {
    location: Location;
    action: RouteAction;
    prevStore: Store;
    newStore: Store;
    windowChanged: boolean;
}
export declare abstract class CoreRouter implements IRouter {
    location: Location;
    action: RouteAction;
    readonly nativeData: unknown;
    runtime: RouteRuntime;
    protected listenerId: number;
    protected readonly listenerMap: {
        [id: string]: (data: RouterEvent) => void | Promise<void>;
    };
    constructor(location: Location, action: RouteAction, nativeData: unknown);
    addListener(callback: (data: RouterEvent) => void | Promise<void>): UNListener;
    dispatch(data: RouterEvent): void | Promise<void>;
    abstract init(prevState: StoreState): Promise<void>;
    abstract getCurrentPage(): {
        url: string;
        store: IStore;
    };
    abstract getWindowPages(): {
        url: string;
        store: IStore;
    }[];
    abstract getHistoryLength(target?: RouteTarget): number;
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
    readonly router: CoreRouter;
    private state;
    private mountedModels;
    private currentListeners;
    private nextListeners;
    private active;
    private currentAction;
    private uncommittedState;
    dispatch: Dispatch;
    loadingGroups: {
        [moduleNameAndGroupName: string]: TaskCounter;
    };
    constructor(sid: number, router: CoreRouter);
    clone(): Store;
    hotReplaceModel(moduleName: string, ModelClass: CommonModelClass): void;
    getCurrentAction(): Action;
    private mountModule;
    mount(moduleName: string, routeChanged: boolean): void | Promise<void>;
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
 * 修改了Model时热更新runtime，通常由脚手架自动调用
 *
 * @param moduleName - Model所属模块名称
 * @param ModelClass - 新的Model
 *
 * @public
 */
export declare function modelHotReplacement(moduleName: string, ModelClass: CommonModelClass): void;
export {};
//# sourceMappingURL=store.d.ts.map