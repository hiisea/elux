import {isPromise} from './sprite';
import {
  Action,
  EluxComponent,
  isEluxComponent,
  IModuleHandlers,
  injectActions,
  CommonModule,
  MetaData,
  ModuleGetter,
  FacadeMap,
  ICoreRouter,
  IStore,
  coreConfig,
  reducer,
  mergeState,
  moduleInitAction,
  moduleReInitAction,
} from './basic';
import env from './env';

type Handler<F> = F extends (...args: infer P) => any
  ? (
      ...args: P
    ) => {
      type: string;
    }
  : never;
type Actions<T> = Pick<
  {[K in keyof T]: Handler<T[K]>},
  {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T]
>;

type HandlerThis<T> = T extends (...args: infer P) => any
  ? (
      ...args: P
    ) => {
      type: string;
    }
  : undefined;

type ActionsThis<T> = {[K in keyof T]: HandlerThis<T[K]>};

export function getModuleGetter(): ModuleGetter {
  return MetaData.moduleGetter;
}
export function exportModule<
  N extends string,
  H extends IModuleHandlers,
  P extends Record<string, any>,
  CS extends Record<string, EluxComponent | (() => Promise<EluxComponent>)>
>(
  moduleName: N,
  ModuleHandles: {
    new (moduleName: string, context: ICoreRouter): H;
  },
  params: P,
  components: CS
): {
  moduleName: N;
  model: (store: IStore) => void | Promise<void>;
  state: H['initState'];
  params: P;
  actions: Actions<H>;
  components: CS;
} {
  Object.keys(components).forEach((key) => {
    const component = components[key];
    if (
      !isEluxComponent(component) &&
      (typeof component !== 'function' || component.length > 0 || !/(import|require)\s*\(/.test(component.toString()))
    ) {
      env.console.warn(`The exported component must implement interface EluxComponent: ${moduleName}.${key}`);
    }
  });
  const model = (store: IStore) => {
    const router = store.router;
    if (!router.injectedModules[moduleName]) {
      const moduleHandles = new ModuleHandles(moduleName, router);
      router.injectedModules[moduleName] = moduleHandles;
      injectActions(moduleName, moduleHandles as any);
      const initState = moduleHandles.initState;
      const preModuleState = store.getState(moduleName);
      if (preModuleState) {
        return store.dispatch(moduleReInitAction(moduleName, initState));
      }
      return store.dispatch(moduleInitAction(moduleName, initState));
    }
    return undefined;
  };
  return {
    moduleName,
    model,
    components,
    state: undefined as any,
    params,
    actions: undefined as any,
  };
}

export function getModule(moduleName: string): Promise<CommonModule> | CommonModule {
  if (MetaData.moduleCaches[moduleName]) {
    return MetaData.moduleCaches[moduleName]!;
  }
  const moduleOrPromise = MetaData.moduleGetter[moduleName]();
  if (isPromise(moduleOrPromise)) {
    const promiseModule = moduleOrPromise.then(
      ({default: module}) => {
        MetaData.moduleCaches[moduleName] = module;
        return module;
      },
      (reason) => {
        MetaData.moduleCaches[moduleName] = undefined;
        throw reason;
      }
    );
    MetaData.moduleCaches[moduleName] = promiseModule;
    return promiseModule;
  }
  MetaData.moduleCaches[moduleName] = moduleOrPromise;
  return moduleOrPromise;
}
export function getModuleList(moduleNames: string[]): CommonModule[] | Promise<CommonModule[]> {
  if (moduleNames.length < 1) {
    return [];
  }
  const list = moduleNames.map((moduleName) => {
    if (MetaData.moduleCaches[moduleName]) {
      return MetaData.moduleCaches[moduleName]!;
    }
    return getModule(moduleName);
  });
  if (list.some((item) => isPromise(item))) {
    return Promise.all(list);
  } else {
    return list as CommonModule[];
  }
}
export function loadModel<MG extends ModuleGetter>(moduleName: keyof MG, store: IStore): void | Promise<void> {
  const moduleOrPromise = getModule(moduleName as string);
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then((module) => module.model(store));
  }
  return moduleOrPromise.model(store);
}

export function getComponet(moduleName: string, componentName: string): EluxComponent | Promise<EluxComponent> {
  const key = [moduleName, componentName].join(coreConfig.NSP);
  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key]!;
  }
  const moduleCallback = (module: CommonModule) => {
    const componentOrFun = module.components[componentName];
    if (isEluxComponent(componentOrFun)) {
      const component = componentOrFun;
      MetaData.componentCaches[key] = component;
      return component;
    }
    const promiseComponent = componentOrFun().then(
      ({default: component}) => {
        MetaData.componentCaches[key] = component;
        return component;
      },
      (reason) => {
        MetaData.componentCaches[key] = undefined;
        throw reason;
      }
    );
    MetaData.componentCaches[key] = promiseComponent;
    return promiseComponent;
  };
  const moduleOrPromise = getModule(moduleName);
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(moduleCallback);
  }
  return moduleCallback(moduleOrPromise);
}

export function getComponentList(keys: string[]): Promise<EluxComponent[]> {
  if (keys.length < 1) {
    return Promise.resolve([]);
  }
  return Promise.all(
    keys.map((key) => {
      if (MetaData.componentCaches[key]) {
        return MetaData.componentCaches[key]!;
      }
      const [moduleName, componentName] = key.split(coreConfig.NSP);
      return getComponet(moduleName, componentName);
    })
  );
}
export function loadComponet(
  moduleName: string,
  componentName: string,
  store: IStore,
  deps: Record<string, boolean>
): EluxComponent | null | Promise<EluxComponent | null> {
  const promiseOrComponent = getComponet(moduleName, componentName);
  const callback = (component: EluxComponent) => {
    const router = store.router;
    if (component.__elux_component__ === 'view' && !router.injectedModules[moduleName]) {
      if (env.isServer) {
        return null;
      }
      const module = getModule(moduleName) as CommonModule;
      module.model(store);
    }
    deps[moduleName + coreConfig.NSP + componentName] = true;
    return component;
  };
  if (isPromise(promiseOrComponent)) {
    if (env.isServer) {
      return null;
    }
    return promiseOrComponent.then(callback);
  }
  return callback(promiseOrComponent);
}

export function getCachedModules(): Record<string, undefined | CommonModule | Promise<CommonModule>> {
  return MetaData.moduleCaches;
}

export class EmptyModuleHandlers implements IModuleHandlers {
  router!: ICoreRouter;

  initState: any;

  constructor(public readonly moduleName: string) {
    this.initState = {};
  }
}

/**
 * ModuleHandlers基类
 * 所有ModuleHandlers必须继承此基类
 */
export class CoreModuleHandlers<S extends Record<string, any> = {}, R extends Record<string, any> = {}> implements IModuleHandlers {
  constructor(public readonly moduleName: string, public readonly router: ICoreRouter, public readonly initState: S) {}

  protected getCurrentStore(): IStore<R> {
    return this.router.getCurrentStore() as any;
  }
  protected get actions(): ActionsThis<this> {
    return MetaData.facadeMap[this.moduleName].actions as any;
  }

  protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {[K in keyof T]: Handler<T[K]>} {
    return MetaData.facadeMap[this.moduleName].actions as any;
  }

  protected get state(): S {
    return this.getCurrentStore().getState(this.moduleName) as S;
  }

  protected get rootState(): R {
    return this.getCurrentStore().getState();
  }

  protected getCurrentActionName(): string {
    return this.getCurrentStore().getCurrentActionName();
  }

  protected get currentRootState(): R {
    return this.getCurrentStore().getCurrentState();
  }

  protected get currentState(): S {
    return this.getCurrentStore().getCurrentState(this.moduleName) as S;
  }

  protected dispatch(action: Action): void | Promise<void> {
    return this.getCurrentStore().dispatch(action);
  }

  /**
   * 动态加载并初始化其他模块的model
   */
  protected loadModel(moduleName: string): void | Promise<void> {
    return loadModel(moduleName, this.getCurrentStore());
  }

  @reducer
  public Init(initState: S): S {
    return initState;
  }

  @reducer
  public Update(payload: Partial<S>, key: string): S {
    return mergeState(this.state, payload);
  }

  @reducer
  public Loading(payload: Record<string, string>): S {
    const loading = mergeState(this.state.loading, payload);
    return mergeState(this.state, {loading});
  }
}

type GetPromiseComponent<T> = T extends () => Promise<{default: infer R}> ? R : T;

type ReturnComponents<CS extends Record<string, EluxComponent | (() => Promise<{default: EluxComponent}>)>> = {
  [K in keyof CS]: GetPromiseComponent<CS[K]>;
};

type GetPromiseModule<T> = T extends Promise<{default: infer R}> ? R : T;

type ModuleFacade<M extends CommonModule> = {
  name: string;
  components: ReturnComponents<M['components']>;
  state: M['state'];
  params: M['params'];
  actions: M['actions'];
  actionNames: {[K in keyof M['actions']]: string};
};

export type RootModuleFacade<
  G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<{default: CommonModule<N>}>;
  } = any
> = {[K in Extract<keyof G, string>]: ModuleFacade<GetPromiseModule<ReturnType<G[K]>>>};

export type RootModuleActions<A extends RootModuleFacade> = {[K in keyof A]: keyof A[K]['actions']};

export type RootModuleAPI<A extends RootModuleFacade = RootModuleFacade> = {[K in keyof A]: Pick<A[K], 'name' | 'actions' | 'actionNames'>};

export type RootModuleParams<A extends RootModuleFacade = RootModuleFacade> = {[K in keyof A]: A[K]['params']};

export function getRootModuleAPI<T extends RootModuleFacade = any>(data?: Record<string, string[]>): RootModuleAPI<T> {
  if (!MetaData.facadeMap) {
    if (data) {
      MetaData.facadeMap = Object.keys(data).reduce((prev, moduleName) => {
        const arr = data[moduleName];
        const actions: Record<string, any> = {};
        const actionNames: Record<string, string> = {};
        arr.forEach((actionName) => {
          actions[actionName] = (...payload: any[]) => ({type: moduleName + coreConfig.NSP + actionName, payload});
          actionNames[actionName] = moduleName + coreConfig.NSP + actionName;
        });
        const moduleFacade = {name: moduleName, actions, actionNames};
        prev[moduleName] = moduleFacade;
        return prev;
      }, {} as FacadeMap);
    } else {
      const cacheData = {};
      MetaData.facadeMap = new Proxy(
        {},
        {
          set(target, moduleName: string, val, receiver) {
            return Reflect.set(target, moduleName, val, receiver);
          },
          get(target, moduleName: string, receiver) {
            const val = Reflect.get(target, moduleName, receiver);
            if (val !== undefined) {
              return val;
            }
            if (!cacheData[moduleName]) {
              cacheData[moduleName] = {
                name: moduleName,
                actionNames: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return moduleName + coreConfig.NSP + actionName;
                    },
                  }
                ),
                actions: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return (...payload: any[]) => ({type: moduleName + coreConfig.NSP + actionName, payload});
                    },
                  }
                ),
              };
            }
            return cacheData[moduleName];
          },
        }
      );
    }
  }
  return MetaData.facadeMap as any;
}

export function exportComponent<T>(component: T): T & EluxComponent {
  const eluxComponent: EluxComponent & T = component as any;
  eluxComponent.__elux_component__ = 'component';
  return eluxComponent;
}
export function exportView<T>(component: T): T & EluxComponent {
  const eluxComponent: EluxComponent & T = component as any;
  eluxComponent.__elux_component__ = 'view';
  return eluxComponent;
}
export type LoadComponent<A extends RootModuleFacade = {}, O = any> = <M extends keyof A, V extends keyof A[M]['components']>(
  moduleName: M,
  componentName: V,
  options?: O
) => A[M]['components'][V];
