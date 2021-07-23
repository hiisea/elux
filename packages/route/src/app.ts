/// <reference path="../runtime/runtime.d.ts" />
import {
  env,
  getRootModuleAPI,
  renderApp,
  ssrApp,
  defineModuleGetter,
  setConfig as setCoreConfig,
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

import {routeMiddleware, setRouteConfig, routeConfig, IBaseRouter, RouteModule, LocationTransform} from './index';

export {
  ActionTypes,
  LoadingState,
  env,
  effect,
  errorAction,
  reducer,
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
export {ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule} from './index';

export type {RootModuleFacade as Facade, Dispatch, IStore, EluxComponent} from '@elux/core';
export type {RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from './index';

const MetaData: {
  loadComponent?: LoadComponent;
  LoadComponentOnError?: EluxRuntime.Component;
  LoadComponentOnLoading?: EluxRuntime.Component;
  componentRender?: (id: string, component: EluxRuntime.Component, store: IStore, eluxContext: EluxContext) => void;
  componentSSR?: (id: string, component: EluxRuntime.Component, store: IStore, eluxContext: EluxContext) => string;
  router?: IBaseRouter<any, string>;
  SSRTPL: string;
} = {
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
};

export interface SetConfig<Comp, Ext> {
  (
    conf: {
      actionMaxHistory?: number;
      pagesMaxHistory?: number;
      pagenames?: Record<string, string>;
      NSP?: string;
      MSP?: string;
      MutableData?: boolean;
      DepthTimeOnLoading?: number;
      LoadComponentOnError?: Comp;
      LoadComponentOnLoading?: Comp;
      disableNativeRoute?: boolean;
    } & Ext
  ): void;
}
export function setMeta({
  loadComponent,
  componentRender,
  componentSSR,
  MutableData,
  router,
  SSRTPL,
}: {
  loadComponent?: LoadComponent;
  componentRender?: (id: string, component: EluxRuntime.Component, store: IStore) => void;
  componentSSR?: (id: string, component: EluxRuntime.Component, store: IStore) => string;
  MutableData?: boolean;
  router?: IBaseRouter<any, string>;
  SSRTPL?: string;
}): void {
  loadComponent !== undefined && (MetaData.loadComponent = loadComponent);
  componentRender !== undefined && (MetaData.componentRender = componentRender);
  componentSSR !== undefined && (MetaData.componentSSR = componentSSR);
  MutableData !== undefined && setCoreConfig({MutableData});
  router !== undefined && (MetaData.router = router);
  SSRTPL !== undefined && (MetaData.SSRTPL = SSRTPL);
}
export function setBaseConfig(conf: {
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  pagenames?: Record<string, string>;
  NSP?: string;
  MSP?: string;
  DepthTimeOnLoading?: number;
  LoadComponentOnError?: any;
  LoadComponentOnLoading?: any;
  disableNativeRoute?: boolean;
}): void {
  setCoreConfig(conf);
  setRouteConfig(conf);
  conf.LoadComponentOnError && (MetaData.LoadComponentOnError = conf.LoadComponentOnError);
  conf.LoadComponentOnLoading && (MetaData.LoadComponentOnLoading = conf.LoadComponentOnLoading);
}

export interface RenderOptions {
  viewName?: string;
  id?: string;
  ssrKey?: string;
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
}

export const EluxContextKey = '__EluxContext__';

export function createBaseApp<INS = {}>(
  ins: INS,
  createRouter: (locationTransform: LocationTransform) => IBaseRouter<any, string>,
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
          MetaData.router = router;
          const {state, components = []}: {state: any; components: string[]} = env[ssrKey] || {};
          return router.initedPromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState, ...state};
            const baseStore = storeCreator({...storeOptions, initState});
            return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(({store, AppView}) => {
              routeModule.model(store);
              router.setStore(store);
              MetaData.componentRender!(id, AppView, store, {store, documentHead: ''});
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
          MetaData.router = router;
          return router.initedPromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState};
            const baseStore = storeCreator({...storeOptions, initState});
            return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(({store, AppView}) => {
              const state = store.getState();
              const eluxContext = {deps: {}, store, documentHead: ''};
              const html = MetaData.componentSSR!(id, AppView, store, eluxContext);
              const match = MetaData.SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
              if (match) {
                return MetaData.SSRTPL.replace(
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

export type GetAPP<A extends RootModuleFacade, Component> = {
  State: {[M in keyof A]: A[M]['state']};
  RouteParams: {[M in keyof A]?: A[M]['params']};
  GetRouter: () => IBaseRouter<{[M in keyof A]: A[M]['params']}, Extract<keyof A['route']['components'], string>>;
  GetActions<N extends keyof A>(...args: N[]): {[K in N]: A[K]['actions']};
  LoadComponent: LoadComponent<A, {OnError?: Component; OnLoading?: Component}>;
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
    GetRouter: () => MetaData.router,
    LoadComponent: MetaData.loadComponent,
    Modules: modules,
    Pagenames: routeConfig.pagenames,
  };
}
