import {
  CommonModel,
  CommonModule,
  CommonModelClass,
  EluxComponent,
  AsyncEluxComponent,
  UStore,
  MetaData,
  EStore,
  Action,
  mergeState,
  ModuleState,
  RootState,
  RouteState,
} from './basic';
import {reducer, ActionTypes} from './actions';
import {exportModule as _exportModule} from './modules';
import {loadModel} from './inject';

/*** @public */
export type PickHandler<F> = F extends (...args: infer P) => any
  ? (...args: P) => {
      type: string;
    }
  : never;

/*** @public */
export type PickActions<T> = Pick<
  {[K in keyof T]: PickHandler<T[K]>},
  {
    [K in keyof T]: T[K] extends Function ? Exclude<K, 'destroy' | 'init'> : never;
  }[keyof T]
>;

/*** @public */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function exportModule<N extends string, H extends CommonModel, C extends {[componentName: string]: EluxComponent | AsyncEluxComponent}, D>(
  moduleName: N,
  ModelClass: CommonModelClass<H>,
  components: C,
  data?: D
) {
  return _exportModule(moduleName, ModelClass, components, data) as {
    moduleName: N;
    initModel: (store: UStore) => void | Promise<void>;
    state: ReturnType<H['init']>;
    routeParams: H['defaultRouteParams'];
    actions: PickActions<H>;
    components: C;
    data: D;
  };
}

/*** @public */
export type GetPromiseComponent<T> = T extends () => Promise<{default: infer R}> ? R : T;

/*** @public */
export type ReturnComponents<CS extends Record<string, EluxComponent | (() => Promise<{default: EluxComponent}>)>> = {
  [K in keyof CS]: GetPromiseComponent<CS[K]>;
};

/*** @public */
export type ModuleAPI<M extends CommonModule> = {
  name: string;
  components: ReturnComponents<M['components']>;
  state: M['state'];
  actions: M['actions'];
  actionNames: {[K in keyof M['actions']]: string};
  routeParams: M['routeParams'];
  data: M['data'];
};

/*** @public */
export type GetPromiseModule<T> = T extends Promise<{default: infer R}> ? R : T;

/*** @public */
export type Facade<
  G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<{default: CommonModule<N>}>;
  } = any
> = {[K in Extract<keyof G, string>]: ModuleAPI<GetPromiseModule<ReturnType<G[K]>>>};

/*** @public */
export type LoadComponent<F extends Facade = {}, O = any> = <M extends keyof F, V extends keyof F[M]['components']>(
  moduleName: M,
  componentName: V,
  options?: O
) => F[M]['components'][V];

/*** @public */
export type FacadeActions<F extends Facade, R extends string> = {[K in Exclude<keyof F, R>]: keyof F[K]['actions']};

/*** @public */
export type FacadeRoutes<F extends Facade, R extends string> = {[K in Exclude<keyof F, R>]?: F[K]['routeParams']};

/*** @public */
export type FacadeModules<F extends Facade, R extends string> = {[K in Exclude<keyof F, R>]: Pick<F[K], 'name' | 'actions' | 'actionNames'>};

/*** @public */
export type FacadeStates<F extends Facade, R extends string> = {
  [K in keyof F]: K extends R ? RouteState<FacadeRoutes<F, R>, F[R]['data']> : F[K]['state'];
};

/*** @public */
export type HandlerThis<T> = T extends (...args: infer P) => any
  ? (...args: P) => {
      type: string;
    }
  : undefined;

/*** @public */
export type ActionsThis<T> = {[K in keyof T]: HandlerThis<T[K]>};

/*** @public */
export abstract class BaseModel<MS extends ModuleState = {}, MP extends ModuleState = {}, RS extends RootState = {}> implements CommonModel {
  abstract defaultRouteParams: MP;
  abstract init(latestState: RootState, preState: RootState): MS;

  constructor(public readonly moduleName: string, public store: UStore) {}

  protected get actions(): ActionsThis<this> {
    return MetaData.moduleMap[this.moduleName].actions as any;
  }

  protected get router(): {routeState: RouteState} {
    return (this.store as EStore).router as any;
  }

  protected getRouteParams(): MP {
    return this.store.getRouteParams(this.moduleName) as MP;
  }

  protected getLatestState(): RS {
    return (this.store as EStore).router.latestState as RS;
  }
  protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {[K in keyof T]: PickHandler<T[K]>} {
    return MetaData.moduleMap[this.moduleName].actions as any;
  }

  protected getState(): MS {
    return this.store.getState(this.moduleName) as MS;
  }

  protected getRootState(): RS {
    return this.store.getState() as RS;
  }

  protected getCurrentActionName(): string {
    return (this.store as EStore).getCurrentActionName();
  }

  protected getCurrentState(): MS {
    return (this.store as EStore).getCurrentState(this.moduleName) as MS;
  }

  protected getCurrentRootState(): RS {
    return (this.store as EStore).getCurrentState();
  }

  protected dispatch(action: Action): void | Promise<void> {
    return this.store.dispatch(action);
  }

  // protected dispatch(action: Action): void | Promise<void> {
  //   return this.router.getCurrentStore().dispatch(action);
  // }

  protected loadModel(moduleName: string): void | Promise<void> {
    return loadModel(moduleName, this.store);
  }

  // protected getRouteParams(): ModuleState | undefined {
  //   return this.store.getRouteParams(this.moduleName);
  //   // const route = this.store.getRouteParams(this.moduleName);
  //   // return route.params[this.moduleName];
  // }

  @reducer
  public [ActionTypes.MInit](initState: MS): MS {
    return initState;
  }

  @reducer
  public [ActionTypes.MLoading](payload: {[groupKey: string]: string}): MS {
    const state = this.getState();
    const loading = mergeState(state.loading, payload);
    return mergeState(state, {loading});
  }

  public destroy(): void {
    return;
  }
}
