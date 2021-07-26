import {
  env,
  getRootModuleAPI,
  buildConfigSetter,
  initApp,
  renderApp,
  ssrApp,
  isPromise,
  defineModuleGetter,
  setCoreConfig,
  getModule,
  IStore,
  LoadComponent,
  ModuleGetter,
  IStoreMiddleware,
  StoreBuilder,
  BStoreOptions,
  BStore,
  RootModuleFacade,
  RootModuleAPI,
  RootModuleActions,
} from '@elux/core';

import {routeMiddleware, setRouteConfig, IBaseRouter, RouteModule, LocationTransform, routeMeta, RouteState} from '@elux/route';

export {
  ActionTypes,
  LoadingState,
  env,
  effect,
  errorAction,
  reducer,
  action,
  mutation,
  setLoading,
  logger,
  isServer,
  serverSide,
  clientSide,
  deepMerge,
  deepMergeState,
  exportModule,
  isProcessedError,
  setProcessedError,
  delayPromise,
  exportView,
  exportComponent,
  EmptyModuleHandlers,
} from '@elux/core';
export {ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule} from '@elux/route';

export type {RootModuleFacade as Facade, Dispatch, IStore, EluxComponent} from '@elux/core';
export type {RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from '@elux/route';

const appMeta: {
  SSRTPL: string;
  router: IBaseRouter<any, string>;
} = {
  router: null as any,
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
};

export const appConfig: {
  loadComponent: LoadComponent;
} = {
  loadComponent: null as any,
};
export const setAppConfig = buildConfigSetter(appConfig);
export interface UserConfig {
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  NSP?: string;
  MSP?: string;
  DepthTimeOnLoading?: number;
  disableNativeRoute?: boolean;
}
export function setUserConfig(conf: UserConfig): void {
  setCoreConfig(conf);
  setRouteConfig(conf);
}

export interface RenderOptions {
  viewName?: string;
  id?: string;
  ssrKey?: string;
}

export interface ContextWrap {}
export interface CreateMP<INS = {}> {
  (moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({
      storeOptions,
      storeCreator,
    }: StoreBuilder<O, B>): INS & {
      render(): {store: IStore<any> & B; context: ContextWrap};
    };
  };
}

export interface CreateApp<INS = {}> {
  (moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({
      storeOptions,
      storeCreator,
    }: StoreBuilder<O, B>): INS & {
      render({id, ssrKey, viewName}?: RenderOptions): Promise<IStore<any> & B>;
    };
  };
}

export interface CreateSSR<INS = {}> {
  (moduleGetter: ModuleGetter, url: string, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({
      storeOptions,
      storeCreator,
    }: StoreBuilder<O, B>): INS & {
      render({id, ssrKey, viewName}?: RenderOptions): Promise<string>;
    };
  };
}

export interface EluxContext {
  deps?: Record<string, boolean>;
  documentHead: string;
  store?: IStore;
  router?: IBaseRouter<any, string>;
}

export function createBaseMP<INS = {}>(
  ins: INS,
  createRouter: (locationTransform: LocationTransform) => IBaseRouter<any, string>,
  render: (store: IStore, eluxContext: EluxContext, ins: INS) => any,
  moduleGetter: ModuleGetter,
  middlewares: IStoreMiddleware[] = [],
  appModuleName?: string
): {
  useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({
    storeOptions,
    storeCreator,
  }: StoreBuilder<O, B>): INS & {
    render(): {store: IStore<any> & B; context: ContextWrap};
  };
} {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route') as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      return Object.assign(ins, {
        render() {
          const router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          const routeState = router.initRouteState as RouteState;
          const initState = {...storeOptions.initState, route: routeState};
          const baseStore = storeCreator({...storeOptions, initState});
          const store = initApp(baseStore, istoreMiddleware);
          routeModule.model(store);
          router.setStore(store);
          const context: ContextWrap = render(store, {deps: {}, store, router, documentHead: ''}, ins);
          return {store, context};
        },
      });
    },
  };
}

export function createBaseApp<INS = {}>(
  ins: INS,
  createRouter: (locationTransform: LocationTransform) => IBaseRouter<any, string>,
  render: (id: string, component: any, store: IStore, eluxContext: EluxContext, fromSSR: boolean, ins: INS) => void,
  moduleGetter: ModuleGetter,
  middlewares: IStoreMiddleware[] = [],
  appModuleName?: string
): {
  useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({
    storeOptions,
    storeCreator,
  }: StoreBuilder<O, B>): INS & {
    render({id, ssrKey, viewName}?: RenderOptions): Promise<IStore<any> & B>;
  };
} {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route') as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      return Object.assign(ins, {
        render({id = 'root', ssrKey = 'eluxInitStore', viewName}: RenderOptions = {}) {
          const router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          const {state, components = []}: {state: any; components: string[]} = env[ssrKey] || {};
          const roterStatePromise: Promise<RouteState> = isPromise(router.initRouteState)
            ? router.initRouteState
            : Promise.resolve(router.initRouteState);
          return roterStatePromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState, ...state};
            const baseStore = storeCreator({...storeOptions, initState});
            return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(({store, AppView}) => {
              routeModule.model(store);
              router.setStore(store);
              render(id, AppView, store, {deps: {}, store, router, documentHead: ''}, !!env[ssrKey], ins);
              return store;
            });
          });
        },
      });
    },
  };
}

export function createBaseSSR<INS = {}>(
  ins: INS,
  createRouter: (locationTransform: LocationTransform) => IBaseRouter<any, string>,
  render: (id: string, component: any, store: IStore, eluxContext: EluxContext, ins: INS) => Promise<string>,
  moduleGetter: ModuleGetter,
  middlewares: IStoreMiddleware[] = [],
  appModuleName?: string
): {
  useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({
    storeOptions,
    storeCreator,
  }: StoreBuilder<O, B>): INS & {
    render({id, ssrKey, viewName}?: RenderOptions): Promise<string>;
  };
} {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route') as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      return Object.assign(ins, {
        render({id = 'root', ssrKey = 'eluxInitStore', viewName}: RenderOptions = {}) {
          const router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          const roterStatePromise: Promise<RouteState> = isPromise(router.initRouteState)
            ? router.initRouteState
            : Promise.resolve(router.initRouteState);
          return roterStatePromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState};
            const baseStore = storeCreator({...storeOptions, initState});
            return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(({store, AppView}) => {
              const state = store.getState();
              const eluxContext = {deps: {}, store, router, documentHead: ''};
              return render(id, AppView, store, eluxContext, ins).then((html) => {
                const match = appMeta.SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
                if (match) {
                  return appMeta.SSRTPL.replace(
                    '</head>',
                    `\r\n${eluxContext.documentHead}\r\n<script>window.${ssrKey} = ${JSON.stringify({
                      state,
                      components: Object.keys(eluxContext.deps),
                    })};</script>\r\n</head>`
                  ).replace(match[0], match[0] + html);
                }
                return html;
              });
            });
          });
        },
      });
    },
  };
}
export function patchActions(typeName: string, json?: string): void {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}

export type GetBaseAPP<A extends RootModuleFacade, LoadComponentOptions> = {
  State: {[M in keyof A]: A[M]['state']};
  RouteParams: {[M in keyof A]?: A[M]['params']};
  GetRouter: () => IBaseRouter<{[M in keyof A]: A[M]['params']}, Extract<keyof A['route']['components'], string>>;
  GetActions<N extends keyof A>(...args: N[]): {[K in N]: A[K]['actions']};
  LoadComponent: LoadComponent<A, LoadComponentOptions>;
  Modules: RootModuleAPI<A>;
  Actions: RootModuleActions<A>;
  Pagenames: {[K in keyof A['route']['components']]: K};
};

export function getApp<T extends {GetActions: any; GetRouter: any; LoadComponent: any; Modules: any; Pagenames: any}>(): Pick<
  T,
  'GetActions' | 'GetRouter' | 'LoadComponent' | 'Modules' | 'Pagenames'
> {
  const modules = getRootModuleAPI();
  return {
    GetActions: (...args: string[]) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetRouter: () => appMeta.router,
    LoadComponent: appConfig.loadComponent,
    Modules: modules,
    Pagenames: routeMeta.pagenames,
  };
}
