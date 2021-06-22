import {isPromise} from './sprite';
import {
  Action,
  IModuleHandlers,
  injectActions,
  CoreModuleState,
  CommonModule,
  MetaData,
  ModuleGetter,
  IStore,
  FacadeMap,
  config,
  reducer,
  mergeState,
  moduleInitAction,
  moduleReInitAction,
} from './basic';
import {env} from './env';

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

export function exportModule<N extends string, H extends IModuleHandlers, P extends Record<string, any>, CS extends Record<string, () => any>>(
  moduleName: N,
  ModuleHandles: {
    new (moduleName: string): H;
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
  const model = (store: IStore) => {
    if (!store.injectedModules[moduleName]) {
      const moduleHandles = new ModuleHandles(moduleName);
      store.injectedModules[moduleName] = moduleHandles;
      moduleHandles.store = store;
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
  MetaData.moduleCaches[moduleName] = moduleOrPromise;
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(
      (module) => {
        MetaData.moduleCaches[moduleName] = module;
        return module;
      },
      (reason) => {
        MetaData.moduleCaches[moduleName] = undefined;
        throw reason;
      }
    );
  }
  return moduleOrPromise;
}
export function getModuleList(moduleNames: string[]): Promise<CommonModule[]> {
  if (moduleNames.length < 1) {
    return Promise.resolve([]);
  }
  return Promise.all(
    moduleNames.map((moduleName) => {
      if (MetaData.moduleCaches[moduleName]) {
        return MetaData.moduleCaches[moduleName]!;
      }
      return getModule(moduleName);
    })
  );
}
export function loadModel<MG extends ModuleGetter>(moduleName: keyof MG, store: IStore = MetaData.clientStore): void | Promise<void> {
  const moduleOrPromise = getModule(moduleName as string);
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then((module) => module.default.model(store));
  }
  return moduleOrPromise.default.model(store);
}
export function getComponet<T = any>(moduleName: string, componentName: string, initView?: boolean): T | Promise<T> {
  const key = [moduleName, componentName].join(config.CSP);
  if (MetaData.componentCaches[key]) {
    return MetaData.componentCaches[key]! as T;
  }
  const moduleCallback = (module: CommonModule) => {
    const componentOrPromise = module.default.components[componentName]();
    MetaData.componentCaches[key] = componentOrPromise;
    if (isPromise(componentOrPromise)) {
      return componentOrPromise.then(
        (view) => {
          MetaData.componentCaches[key] = view;
          if (view[config.ViewFlag] && initView && !env.isServer) {
            module.default.model(MetaData.clientStore);
          }
          return view;
        },
        (reason) => {
          MetaData.componentCaches[key] = undefined;
          throw reason;
        }
      );
    }
    if (componentOrPromise[config.ViewFlag] && initView && !env.isServer) {
      module.default.model(MetaData.clientStore);
    }
    return componentOrPromise;
  };
  const moduleOrPromise = getModule(moduleName);
  if (isPromise(moduleOrPromise)) {
    return moduleOrPromise.then(moduleCallback);
  }
  return moduleCallback(moduleOrPromise);
}
export function getComponentList(keys: string[]): Promise<any[]> {
  if (keys.length < 1) {
    return Promise.resolve([]);
  }
  return Promise.all(
    keys.map((key) => {
      if (MetaData.componentCaches[key]) {
        return MetaData.componentCaches[key];
      }
      const [moduleName, componentName] = key.split(config.CSP);
      return getComponet(moduleName, componentName);
    })
  );
}
export function getCachedModules() {
  return MetaData.moduleCaches;
}
/**
 * ModuleHandlers基类
 * 所有ModuleHandlers必须继承此基类
 */
export abstract class CoreModuleHandlers<S extends CoreModuleState = CoreModuleState, R extends Record<string, any> = {}> implements IModuleHandlers {
  store!: IStore<R>;

  constructor(public readonly moduleName: string, public readonly initState: S) {}

  protected get actions(): ActionsThis<this> {
    return MetaData.facadeMap[this.moduleName].actions as any;
  }

  protected getPrivateActions<T extends Record<string, Function>>(actionsMap: T): {[K in keyof T]: Handler<T[K]>} {
    return MetaData.facadeMap[this.moduleName].actions as any;
  }

  protected get state(): S {
    return this.store.getState(this.moduleName) as S;
  }

  protected get rootState(): R {
    return this.store.getState() as R;
  }

  protected getCurrentActionName(): string {
    return this.store.getCurrentActionName();
  }

  protected get currentRootState(): R {
    return this.store.getCurrentState();
  }

  protected get currentState(): S {
    return this.store.getCurrentState(this.moduleName) as S;
  }

  protected dispatch(action: Action) {
    return this.store.dispatch(action);
  }

  /**
   * 动态加载并初始化其他模块的model
   */
  protected loadModel(moduleName: string) {
    return loadModel(moduleName, this.store);
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

export type ReturnData<T> = T extends Promise<infer R> ? R : T;

type ReturnComponents<CS extends Record<string, () => any>> = {
  [K in keyof CS]: CS[K] extends () => Promise<{default: infer P}> ? P : ReturnType<CS[K]>;
};

type ModuleFacade<M extends CommonModule> = {
  name: string;
  components: ReturnComponents<M['default']['components']>;
  state: M['default']['state'];
  params: M['default']['params'];
  actions: M['default']['actions'];
  actionNames: {[K in keyof M['default']['actions']]: string};
};

export type RootModuleFacade<
  G extends {
    [N in Extract<keyof G, string>]: () => CommonModule<N> | Promise<CommonModule<N>>;
  } = any
> = {[K in Extract<keyof G, string>]: ModuleFacade<ReturnData<ReturnType<G[K]>>>};

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
          actions[actionName] = (...payload: any[]) => ({type: moduleName + config.NSP + actionName, payload});
          actionNames[actionName] = moduleName + config.NSP + actionName;
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
                      return moduleName + config.NSP + actionName;
                    },
                  }
                ),
                actions: new Proxy(
                  {},
                  {
                    get(__, actionName: string) {
                      return (...payload: any[]) => ({type: moduleName + config.NSP + actionName, payload});
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

export function defineView<T>(component: T) {
  component[config.ViewFlag] = true;
  return component;
}

export type LoadComponent<A extends RootModuleFacade = {}, O = any> = <M extends keyof A, V extends keyof A[M]['components']>(
  moduleName: M,
  viewName: V,
  options?: O
) => A[M]['components'][V];
