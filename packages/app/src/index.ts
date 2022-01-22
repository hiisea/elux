import {
  env,
  getRootModuleAPI,
  buildConfigSetter,
  initApp,
  setCoreConfig,
  IStore,
  LoadComponent,
  ModuleGetter,
  IStoreMiddleware,
  IStoreLogger,
  RootModuleFacade,
  RootModuleAPI,
  RootModuleActions,
  ICoreRouter,
  State,
} from '@elux/core';

import {setRouteConfig, IEluxRouter, routeConfig, routeMeta, RouteState} from '@elux/route';

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
  deepClone,
  deepMerge,
  deepMergeState,
  exportModule,
  isProcessedError,
  setProcessedError,
  exportView,
  exportComponent,
  modelHotReplacement,
  EmptyModuleHandlers,
  TaskCounter,
  SingleDispatcher,
  CoreModuleHandlers as BaseModuleHandlers,
  errorProcessed,
} from '@elux/core';
export {RouteActionTypes, location, createRouteModule, safeJsonParse} from '@elux/route';
export type {
  RootModuleFacade as Facade,
  Dispatch,
  IStore,
  EluxComponent,
  LoadComponent,
  ICoreRouter,
  ModuleGetter,
  IStoreMiddleware,
  IStoreLogger,
  IFlux,
  RootModuleAPI,
  RootModuleActions,
  GetState,
  State,
  ICoreRouteState,
  IModuleHandlersClass,
  PickActions,
  ModuleFacade,
  GetPromiseModule,
  ReturnComponents,
  CommonModule,
  IModuleHandlers,
  GetPromiseComponent,
  ActionsThis,
  Action,
  HandlerThis,
  PickHandler,
} from '@elux/core';
export type {
  LocationState,
  PagenameMap,
  NativeLocationMap,
  HistoryAction,
  EluxLocation,
  NativeLocation,
  StateLocation,
  RouteState,
  DeepPartial,
  IEluxRouter,
  RootParams,
  ILocationTransform,
  IHistoryRecord,
} from '@elux/route';

/**
 * @internal
 */
export type ComputedStore<T> = {[K in keyof T]-?: () => T[K]};

const appMeta: {
  SSRTPL: string;
  router: IEluxRouter;
} = {
  router: null as any,
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
};

/**
 * @internal
 */
export const appConfig: {
  loadComponent: LoadComponent;
  useRouter: () => ICoreRouter;
  useStore: () => IStore;
} = {
  loadComponent: null as any,
  useRouter: null as any,
  useStore: null as any,
};

/**
 * @internal
 */
export const setAppConfig = buildConfigSetter(appConfig);

/**
 * @public
 */
export interface UserConfig {
  maxHistory?: number;
  maxLocationCache?: number;
  NSP?: string;
  MSP?: string;
  DepthTimeOnLoading?: number;
  indexUrl?: string;
  notfoundPagename: string;
  paramsKey: string;
  AppModuleName?: string;
  RouteModuleName?: string;
  disableNativeRouter?: boolean;
}

/**
 * @internal
 */
export function setUserConfig(conf: UserConfig): void {
  setCoreConfig(conf);
  setRouteConfig(conf);
  if (conf.disableNativeRouter) {
    setRouteConfig({notifyNativeRouter: {root: false, internal: false}});
  }
}

/**
 * @internal
 */
export interface RenderOptions {
  viewName?: string;
  id?: string;
  ssrKey?: string;
}

/**
 * @internal
 */
export interface ContextWrap {}

/**
 * @internal
 */
export type AttachMP<App> = (
  app: App,
  moduleGetter: ModuleGetter,
  storeMiddlewares?: IStoreMiddleware[],
  storeLogger?: IStoreLogger
) => App & {
  render(): {store: IStore; context: ContextWrap};
};

/**
 * @internal
 */
export type CreateMP = (
  moduleGetter: ModuleGetter,
  storeMiddlewares?: IStoreMiddleware[],
  storeLogger?: IStoreLogger
) => {
  render(): {store: IStore; context: ContextWrap};
};

/**
 * @internal
 */
export type CreateApp<INS = {}> = (
  moduleGetter: ModuleGetter,
  storeMiddlewares?: IStoreMiddleware[],
  storeLogger?: IStoreLogger
) => INS & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<void>;
};

/**
 * @internal
 */
export type CreateSSR<INS = {}> = (
  moduleGetter: ModuleGetter,
  url: string,
  nativeData: any,
  storeMiddlewares?: IStoreMiddleware[],
  storeLogger?: IStoreLogger
) => INS & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<string>;
};

/**
 * @internal
 */
export interface EluxContext {
  deps?: Record<string, boolean>;
  documentHead: string;
  router?: IEluxRouter<any, string>;
}

/**
 * @internal
 */
export function createBaseMP<INS = {}, S extends State = any>(
  ins: INS,
  router: IEluxRouter,
  render: (eluxContext: EluxContext, ins: INS) => any,
  storeInitState: (data: S) => S,
  storeMiddlewares: IStoreMiddleware[] = [],
  storeLogger?: IStoreLogger
): INS & {
  render(): {store: IStore; context: ContextWrap};
} {
  appMeta.router = router;
  return Object.assign(ins, {
    render() {
      const storeData = {} as S;
      const {store} = initApp<S>(router, storeData, storeInitState, storeMiddlewares, storeLogger);
      const context: ContextWrap = render({deps: {}, router, documentHead: ''}, ins);
      return {store, context};
    },
  });
}

/**
 * @internal
 */
export function createBaseApp<INS = {}, S extends State = any>(
  ins: INS,
  router: IEluxRouter,
  render: (id: string, component: any, eluxContext: EluxContext, fromSSR: boolean, ins: INS, store: IStore) => void,
  storeInitState: (data: S) => S,
  storeMiddlewares: IStoreMiddleware[] = [],
  storeLogger?: IStoreLogger
): INS & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<void>;
} {
  appMeta.router = router;
  return Object.assign(ins, {
    render({id = 'root', ssrKey = 'eluxInitStore', viewName = 'main'}: RenderOptions = {}) {
      const {state, components = []}: {state?: Record<string, any>; components: string[]} = env[ssrKey] || {};
      return router.initialize.then((routeState) => {
        const storeData = {[routeConfig.RouteModuleName]: routeState, ...state} as S;
        const {store, AppView, setup} = initApp<S>(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName, components);
        return setup.then(() => {
          render(id, AppView, {deps: {}, router, documentHead: ''}, !!env[ssrKey], ins, store);
          //return store;
        });
      });
    },
  });
}

/**
 * @internal
 */
export function createBaseSSR<INS = {}, S extends State = any>(
  ins: INS,
  router: IEluxRouter,
  render: (id: string, component: any, eluxContext: EluxContext, ins: INS, store: IStore) => Promise<string>,
  storeInitState: (data: S) => S,
  storeMiddlewares: IStoreMiddleware[] = [],
  storeLogger?: IStoreLogger
): INS & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<string>;
} {
  appMeta.router = router;
  return Object.assign(ins, {
    render({id = 'root', ssrKey = 'eluxInitStore', viewName = 'main'}: RenderOptions = {}) {
      return router.initialize.then((routeState) => {
        const storeData: S = {[routeConfig.RouteModuleName]: routeState} as any;
        const {store, AppView, setup} = initApp<S>(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName);
        return setup.then(() => {
          const state = store.getState();
          const eluxContext: EluxContext = {deps: {}, router, documentHead: ''};
          return render(id, AppView, eluxContext, ins, store).then((html) => {
            const match = appMeta.SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
            if (match) {
              return appMeta.SSRTPL.replace(
                '</head>',
                `\r\n${eluxContext.documentHead}\r\n<script>window.${ssrKey} = ${JSON.stringify({
                  state,
                  components: Object.keys(eluxContext.deps!),
                })};</script>\r\n</head>`
              ).replace(match[0], match[0] + html);
            }
            return html;
          });
        });
      });
    },
  });
}

/**
 * @internal
 */
export function patchActions(typeName: string, json?: string): void {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}

/**
 * @public
 */
export type GetBaseAPP<A extends RootModuleFacade, LoadComponentOptions, R extends string = 'route', NT = unknown> = {
  State: {[M in keyof A]: A[M]['state']};
  RouteParams: {[M in keyof A]?: A[M]['params']};
  RouteState: RouteState<{[M in keyof A]?: A[M]['params']}>;
  Router: IEluxRouter<{[M in keyof A]: A[M]['params']}, Extract<keyof A[R]['components'], string>, NT>;
  GetActions<N extends keyof A>(...args: N[]): {[K in N]: A[K]['actions']};
  LoadComponent: LoadComponent<A, LoadComponentOptions>;
  Modules: RootModuleAPI<A>;
  Actions: RootModuleActions<A>;
  Pagename: keyof A[R]['components'];
  Pagenames: {[K in keyof A[R]['components']]: K};
};

/**
 * @internal
 */
export function getApp<T extends {State: any; GetActions: any; LoadComponent: any; Modules: any; Pagenames: any; Router: any}>(
  demoteForProductionOnly?: boolean,
  injectActions?: Record<string, string[]>
): Pick<T, 'GetActions' | 'LoadComponent' | 'Modules' | 'Pagenames'> & {
  GetRouter: () => T['Router'];
  useRouter: () => T['Router'];
  useStore: () => IStore<T['State']>;
} {
  const modules = getRootModuleAPI(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: (...args: string[]) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    useRouter: appConfig.useRouter,
    useStore: appConfig.useStore,
    GetRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use getRouter() instead';
      }
      return appMeta.router;
    },
    LoadComponent: appConfig.loadComponent,
    Modules: modules,
    Pagenames: routeMeta.pagenames,
  };
}
