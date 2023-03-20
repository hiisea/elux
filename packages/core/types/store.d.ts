import { Listener, TaskCounter, UNListener } from './utils';
import { Action, AStore, Dispatch, GetState, IRouter, IStore, ModuleState, StoreState } from './basic';
import { StoreLogger } from './devTools';
/**
 * Store的中间件
 *
 * @remarks
 * 类似于 Redux 的 Middleware
 *
 * @public
 */
export declare type StoreMiddleware = (api: {
    getStore: () => IStore;
    dispatch: Dispatch;
}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
export declare const preMiddleware: StoreMiddleware;
/**
 * 申明reducer
 *
 * @public
 */
export declare function reducer(target: any, key: string, descriptor: PropertyDescriptor): any;
/**
 * 申明effect
 *
 * @example
 * - `@effect('this.searchTableLoading')` 将该 effect 执行状态注入本模块的 `searchTableLoading` 状态中
 *
 * - `@effect()` 等于 `@effect('stage.globalLoading')`
 *
 * - `@effect(null)` 不跟踪其执行状态
 *
 * @param loadingKey - 将该 effect 执行状态作为 {@link LoadingState | LoadingState} 注入指定的 ModuleState 中。
 *
 * @returns
 * 返回ES6装饰器
 *
 * @public
 */
export declare function effect(loadingKey?: string): Function;
export interface ActionHandler {
    __isReducer__?: boolean;
    __isEffect__?: boolean;
    __loadingKey__?: string;
    (...args: any[]): unknown;
}
export declare type ActionHandlersMap = {
    [actionName: string]: {
        [moduleName: string]: ActionHandler;
    };
};
export declare class Store extends AStore {
    protected state: StoreState;
    protected uncommittedState: StoreState;
    protected loadingGroups: {
        [loadingKey: string]: TaskCounter;
    };
    protected listenerId: number;
    protected listenerMap: {
        [id: string]: Listener;
    };
    protected currentAction: Action | undefined;
    protected listeners: Listener[];
    dispatch: Dispatch;
    getState: GetState<StoreState>;
    constructor(sid: number, uid: number, router: IRouter);
    getUncommittedState(): ModuleState;
    clone(brand?: boolean): Store;
    getCurrentAction(): Action;
    setActive(active: boolean): void;
    destroy(): void;
    setLoading<T extends Promise<any>>(item: T, groupName: string, moduleName?: string): T;
    subscribe(listener: Listener): UNListener;
    update(newState: StoreState): void;
    protected respondHandler(action: Action, isReducer: boolean): void | Promise<void>;
}
export declare const storeConfig: {
    StoreInitState: () => {};
    StoreMiddlewares: StoreMiddleware[];
    StoreLogger: StoreLogger;
    ReducersMap: ActionHandlersMap;
    EffectsMap: ActionHandlersMap;
};
//# sourceMappingURL=store.d.ts.map