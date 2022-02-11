import {
  env,
  getModuleMap,
  buildConfigSetter,
  initApp,
  setCoreConfig,
  UStore,
  LoadComponent,
  ModuleGetter,
  StoreMiddleware,
  StoreLogger,
  RootState,
  coreConfig,
  Facade,
  FacadeStates,
  FacadeModules,
  FacadeActions,
} from '@elux/core';

import {setRouteConfig, URouter, BaseEluxRouter, toURouter} from '@elux/route';

/*** @public */
export type ComputedStore<T> = {[K in keyof T]-?: () => T[K]};

const appMeta: {
  SSRTPL: string;
  router: URouter;
} = {
  router: null as any,
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : '',
};

export const appConfig: {
  loadComponent: LoadComponent;
  useRouter: () => URouter;
  useStore: () => UStore;
} = {
  loadComponent: null as any,
  useRouter: null as any,
  useStore: null as any,
};

export const setAppConfig = buildConfigSetter(appConfig);

/*** @public */
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
  disableNativeRouter?: boolean;
}

/*** @public */
export function setUserConfig(conf: UserConfig): void {
  setCoreConfig(conf);
  setRouteConfig(conf);
  if (conf.disableNativeRouter) {
    setRouteConfig({notifyNativeRouter: {root: false, internal: false}});
  }
}

/*** @public */
export interface RenderOptions {
  viewName?: string;
  id?: string;
  ssrKey?: string;
}

export interface ContextWrap {}

export type AttachMP<App> = (
  app: App,
  moduleGetter: ModuleGetter,
  storeMiddlewares?: StoreMiddleware[],
  storeLogger?: StoreLogger
) => App & {
  render(): {store: UStore; context: ContextWrap};
};

export type CreateMP = (
  moduleGetter: ModuleGetter,
  storeMiddlewares?: StoreMiddleware[],
  storeLogger?: StoreLogger
) => {
  render(): {store: UStore; context: ContextWrap};
};

/*** @public */
export type CreateApp<INS = {}> = (
  moduleGetter: ModuleGetter,
  storeMiddlewares?: StoreMiddleware[],
  storeLogger?: StoreLogger
) => INS & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<void>;
};

/*** @public */
export type CreateSSR<INS = {}> = (
  moduleGetter: ModuleGetter,
  url: string,
  nativeData: any,
  storeMiddlewares?: StoreMiddleware[],
  storeLogger?: StoreLogger
) => INS & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<string>;
};

export interface EluxContext {
  deps?: Record<string, boolean>;
  documentHead: string;
  router?: URouter;
}

export function createBaseMP<INS = {}>(
  ins: INS,
  router: BaseEluxRouter,
  render: (eluxContext: EluxContext, ins: INS) => any,
  storeInitState: (data: RootState) => RootState,
  storeMiddlewares: StoreMiddleware[] = [],
  storeLogger?: StoreLogger
): INS & {
  render(): {store: UStore; context: ContextWrap};
} {
  const urouter = toURouter(router);
  appMeta.router = urouter;
  return Object.assign(ins, {
    render() {
      const storeData: RootState = {};
      const {store} = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger);
      const context: ContextWrap = render({deps: {}, router: urouter, documentHead: ''}, ins);
      return {store, context};
    },
  });
}

export function createBaseApp<INS = {}>(
  ins: INS,
  router: BaseEluxRouter,
  render: (id: string, component: any, eluxContext: EluxContext, fromSSR: boolean, ins: INS, store: UStore) => void,
  storeInitState: (data: RootState) => RootState,
  storeMiddlewares: StoreMiddleware[] = [],
  storeLogger?: StoreLogger
): INS & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<void>;
} {
  const urouter = toURouter(router);
  appMeta.router = urouter;
  return Object.assign(ins, {
    render({id = 'root', ssrKey = 'eluxInitStore', viewName = 'main'}: RenderOptions = {}) {
      const {state, components = []}: {state?: Record<string, any>; components: string[]} = env[ssrKey] || {};
      return router.initialize.then((routeState) => {
        const storeData: RootState = {[coreConfig.RouteModuleName]: routeState, ...state};
        const {store, AppView, setup} = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName, components);
        return setup.then(() => {
          render(id, AppView, {deps: {}, router: urouter, documentHead: ''}, !!env[ssrKey], ins, store);
          //return store;
        });
      });
    },
  });
}

export function createBaseSSR<INS = {}>(
  ins: INS,
  router: BaseEluxRouter,
  render: (id: string, component: any, eluxContext: EluxContext, ins: INS, store: UStore) => Promise<string>,
  storeInitState: (data: RootState) => RootState,
  storeMiddlewares: StoreMiddleware[] = [],
  storeLogger?: StoreLogger
): INS & {
  render({id, ssrKey, viewName}?: RenderOptions): Promise<string>;
} {
  const urouter = toURouter(router);
  appMeta.router = urouter;
  return Object.assign(ins, {
    render({id = 'root', ssrKey = 'eluxInitStore', viewName = 'main'}: RenderOptions = {}) {
      return router.initialize.then((routeState) => {
        const storeData: RootState = {[coreConfig.RouteModuleName]: routeState};
        const {store, AppView, setup} = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName);
        return setup.then(() => {
          const state = store.getState();
          const eluxContext: EluxContext = {deps: {}, router: urouter, documentHead: ''};
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

/*** @public */
export function patchActions(typeName: string, json?: string): void {
  if (json) {
    getModuleMap(JSON.parse(json));
  }
}

/*** @public */
export type GetBaseFacade<F extends Facade, LoadComponentOptions, R extends string> = {
  State: FacadeStates<F, R>;
  GetActions<N extends Exclude<keyof F, R>>(...args: N[]): {[K in N]: F[K]['actions']};
  LoadComponent: LoadComponent<F, LoadComponentOptions>;
  Modules: FacadeModules<F, R>;
  Actions: FacadeActions<F, R>;
};

/*** @public */
export function getApi<T extends {State: any; GetActions: any; LoadComponent: any; Modules: any}, R extends URouter>(
  demoteForProductionOnly?: boolean,
  injectActions?: Record<string, string[]>
): Pick<T, 'GetActions' | 'LoadComponent' | 'Modules'> & {
  GetRouter: () => R;
  useRouter: () => R;
  useStore: () => UStore<T['State'], R['routeState']['params']>;
} {
  const modules = getModuleMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: (...args: string[]) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    useRouter: appConfig.useRouter as any,
    useStore: appConfig.useStore,
    GetRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use getRouter() instead';
      }
      return appMeta.router as any;
    },
    LoadComponent: appConfig.loadComponent,
    Modules: modules,
  };
}
