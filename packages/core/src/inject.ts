import {isPromise, warn} from './sprite';
import {
  EluxComponent,
  isEluxComponent,
  IModuleHandlers,
  CommonModule,
  MetaData,
  ModuleGetter,
  FacadeMap,
  IStore,
  coreConfig,
  ActionHandlerMap,
  ActionHandler,
  ActionHandlerList,
} from './basic';
import {moduleInitAction} from './actions';

import env from './env';

export type Handler<F> = F extends (...args: infer P) => any
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

export interface IModuleHandlersClass<H = IModuleHandlers> {
  new (moduleName: string, store: IStore, latestState: any, preState: any): H;
}
export function exportModule<
  N extends string,
  H extends IModuleHandlers,
  P extends Record<string, any>,
  CS extends Record<string, EluxComponent | (() => Promise<EluxComponent>)>
>(
  moduleName: N,
  ModuleHandlers: IModuleHandlersClass<H>,
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
    if (!store.injectedModules[moduleName]) {
      const {latestState} = store.router;
      const preState = store.getState();
      const moduleHandles = new ModuleHandlers(moduleName, store, latestState, preState);
      store.injectedModules[moduleName] = moduleHandles;
      injectActions(moduleName, moduleHandles as any);
      return store.dispatch(moduleInitAction(moduleName, moduleHandles.initState));
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
export function modelHotReplacement(moduleName: string, ModuleHandlers: IModuleHandlersClass): void {
  const model = (store: IStore) => {
    if (!store.injectedModules[moduleName]) {
      const {latestState} = store.router;
      const preState = store.getState();
      const moduleHandles = new ModuleHandlers(moduleName, store, latestState, preState);
      store.injectedModules[moduleName] = moduleHandles;
      injectActions(moduleName, moduleHandles as any);
      return store.dispatch(moduleInitAction(moduleName, moduleHandles.initState));
    }
    return undefined;
  };
  const moduleCache = MetaData.moduleCaches[moduleName];
  if (moduleCache && moduleCache['model']) {
    (moduleCache as CommonModule).model = model;
  }
  const store = MetaData.currentRouter.getCurrentStore();
  if (MetaData.injectedModules[moduleName]) {
    MetaData.injectedModules[moduleName] = false;
    injectActions(moduleName, new ModuleHandlers(moduleName, store, {}, {}) as any, true);
  }
  const stores = MetaData.currentRouter.getStoreList();
  stores.forEach((store) => {
    if (store.injectedModules[moduleName]) {
      const ins = new ModuleHandlers(moduleName, store, {}, {}) as any;
      ins.initState = store.injectedModules[moduleName].initState;
      store.injectedModules[moduleName] = ins;
    }
  });
  env.console.log(`[HMR] @medux Updated model: ${moduleName}`);
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
    if (component.__elux_component__ === 'view' && !store.injectedModules[moduleName]) {
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

function transformAction(actionName: string, handler: ActionHandler, listenerModule: string, actionHandlerMap: ActionHandlerMap, hmr?: boolean) {
  if (!actionHandlerMap[actionName]) {
    actionHandlerMap[actionName] = {};
  }
  if (!hmr && actionHandlerMap[actionName][listenerModule]) {
    warn(`Action duplicate : ${actionName}.`);
  }
  actionHandlerMap[actionName][listenerModule] = handler;
}

export function injectActions(moduleName: string, handlers: ActionHandlerList, hmr?: boolean): void {
  const injectedModules = MetaData.injectedModules;
  if (injectedModules[moduleName]) {
    return;
  }
  injectedModules[moduleName] = true;
  // eslint-disable-next-line no-restricted-syntax
  for (const actionNames in handlers) {
    if (typeof handlers[actionNames] === 'function') {
      const handler = handlers[actionNames];
      if (handler.__isReducer__ || handler.__isEffect__) {
        actionNames.split(coreConfig.MSP).forEach((actionName) => {
          actionName = actionName.trim().replace(new RegExp(`^this[${coreConfig.NSP}]`), `${moduleName}${coreConfig.NSP}`);
          const arr = actionName.split(coreConfig.NSP);
          if (arr[1]) {
            // handler.__isHandler__ = true;
            transformAction(actionName, handler, moduleName, handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap, hmr);
          } else {
            // handler.__isHandler__ = false;
            transformAction(
              moduleName + coreConfig.NSP + actionName,
              handler,
              moduleName,
              handler.__isEffect__ ? MetaData.effectsMap : MetaData.reducersMap,
              hmr
            );
            // addModuleActionCreatorList(moduleName, actionName);
          }
        });
      }
    }
  }
  // return MetaData.facadeMap[moduleName].actions;
}

export function defineModuleGetter(moduleGetter: ModuleGetter): void {
  MetaData.moduleGetter = moduleGetter;
  MetaData.moduleExists = Object.keys(moduleGetter).reduce((data, moduleName) => {
    data[moduleName] = true;
    return data;
  }, {});
}
