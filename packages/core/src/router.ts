import {IStore, IModuleHandlers, mergeState, Action, MetaData, IStoreMiddleware, ICoreRouteState, coreConfig} from './basic';
import {reducer, ActionTypes, moduleRouteChangeAction} from './actions';
import {loadModel, Handler, IModuleHandlersClass} from './inject';

export const routeMiddleware: IStoreMiddleware = ({store, dispatch, getState}) => (next) => (action) => {
  if (action.type === `${coreConfig.RouteModuleName}${coreConfig.NSP}${ActionTypes.MRouteChange}`) {
    const result = next(action);
    const [routeState] = action.payload as [ICoreRouteState];
    const rootState = getState();
    Object.keys(routeState.params).forEach((moduleName) => {
      const moduleState = routeState.params[moduleName];
      if (moduleState && Object.keys(moduleState).length > 0) {
        if (rootState[moduleName]) {
          dispatch(moduleRouteChangeAction(moduleName, moduleState, routeState.action));
        }
      }
    });
    return result;
  } else {
    return next(action);
  }
};

export class EmptyModuleHandlers implements IModuleHandlers {
  initState: any = {};

  constructor(public readonly moduleName: string, public readonly store: IStore) {}
  destroy(): void {
    return;
  }
}

export class RouteModuleHandlers<S extends ICoreRouteState> implements IModuleHandlers<S> {
  initState: S;
  constructor(public readonly moduleName: string, public store: IStore, latestState: Record<string, any>) {
    this.initState = latestState[moduleName];
  }
  @reducer
  public [ActionTypes.MInit](initState: S): S {
    return initState;
  }
  @reducer
  public [ActionTypes.MRouteChange](routeState: S): S {
    return mergeState(this.store.getState(this.moduleName), routeState);
  }
  public destroy(): void {
    return;
  }
}

export type IRouteModuleHandlersClass<S extends ICoreRouteState> = IModuleHandlersClass<IModuleHandlers<S>>;

type HandlerThis<T> = T extends (...args: infer P) => any
  ? (
      ...args: P
    ) => {
      type: string;
    }
  : undefined;

type ActionsThis<T> = {[K in keyof T]: HandlerThis<T[K]>};

/**
 * ModuleHandlers基类
 * 所有ModuleHandlers必须继承此基类
 */
export class CoreModuleHandlers<S extends Record<string, any> = {}, R extends Record<string, any> = {}> implements IModuleHandlers {
  constructor(public readonly moduleName: string, public store: IStore, public readonly initState: S) {}

  protected get actions(): ActionsThis<this> {
    return MetaData.facadeMap[this.moduleName].actions as any;
  }

  protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {[K in keyof T]: Handler<T[K]>} {
    return MetaData.facadeMap[this.moduleName].actions as any;
  }

  protected getState(): S {
    return this.store.getState(this.moduleName) as S;
  }

  protected getRootState(): R {
    return this.store.getState();
  }

  protected getCurrentActionName(): string {
    return this.store.getCurrentActionName();
  }

  protected getCurrentState(): S {
    return this.store.getCurrentState(this.moduleName) as S;
  }

  protected getCurrentRootState(): R {
    return this.store.getCurrentState();
  }

  protected dispatch(action: Action): void | Promise<void> {
    return this.store.dispatch(action);
  }

  protected loadModel(moduleName: string): void | Promise<void> {
    return loadModel(moduleName, this.store);
  }

  protected getRouteParams(): Record<string, any> | undefined {
    const route = this.store.getState(this.store.router.name) as ICoreRouteState;
    return route.params[this.moduleName];
  }

  @reducer
  public [ActionTypes.MInit](initState: S): S {
    return initState;
  }

  @reducer
  public [ActionTypes.MLoading](payload: Record<string, string>): S {
    const state = this.getState();
    const loading = mergeState(state.loading, payload);
    return mergeState(state, {loading});
  }
  public destroy(): void {
    return;
  }
}
