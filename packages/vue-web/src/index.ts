/* eslint-disable import/order */
import env from './env';
import {routeMiddleware, setRouteConfig, routeConfig} from '@elux/route';
import {
  getRootModuleAPI,
  renderApp,
  ssrApp,
  defineModuleGetter,
  setConfig as setCoreConfig,
  getModule,
  exportView,
  exportComponent,
} from '@elux/core';
import {createRouter} from '@elux/route-browser';
import {createApp as createVue, createSSRApp, defineComponent as defineVueComponent, h} from 'vue';
import {loadComponent, setLoadComponentOptions} from './loadComponent';
import {MetaData, EluxContextKey, EluxContextType} from './sington';
import type {
  Component,
  SetupContext,
  RenderFunction,
  DefineComponent,
  ComputedOptions,
  MethodOptions,
  ComponentOptionsMixin,
  EmitsOptions,
  ComponentOptionsWithoutProps,
  ComponentOptionsWithArrayProps,
  ComponentPropsOptions,
  ComponentOptionsWithObjectProps,
} from 'vue';
import type {
  ModuleGetter,
  IStoreMiddleware,
  StoreBuilder,
  BStoreOptions,
  BStore,
  IStore,
  RootModuleFacade,
  RootModuleAPI,
  RootModuleActions,
  EluxComponent,
} from '@elux/core';
import type {RouteModule} from '@elux/route';
import type {IRouter} from '@elux/route-browser';
import type {LoadComponent} from './loadComponent';

export {createVuex} from '@elux/core-vuex';
export {
  ActionTypes,
  LoadingState,
  env,
  effect,
  mutation,
  errorAction,
  reducer,
  action,
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
export {default as DocumentHead} from './components/DocumentHead';
export {default as Link} from './components/Link';

export type {RootModuleFacade as Facade, Dispatch, EluxComponent} from '@elux/core';
export type {RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from '@elux/route';
export type {VuexStore, VuexOptions} from '@elux/core-vuex';
export type {LoadComponent} from './loadComponent';

declare module '@vue/runtime-core' {
  interface App {
    render: (options?: RenderOptions) => Promise<IStore | string>;
  }
}

interface ExportDefineComponent {
  <Props, RawBindings = object>(setup: (props: Readonly<Props>, ctx: SetupContext) => RawBindings | RenderFunction): DefineComponent<
    Props,
    RawBindings
  > &
    EluxComponent;
  <
    Props = {},
    RawBindings = {},
    D = {},
    C extends ComputedOptions = {},
    M extends MethodOptions = {},
    Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
    Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
    E extends EmitsOptions = EmitsOptions,
    EE extends string = string
  >(
    options: ComponentOptionsWithoutProps<Props, RawBindings, D, C, M, Mixin, Extends, E, EE>
  ): DefineComponent<Props, RawBindings, D, C, M, Mixin, Extends, E, EE> & EluxComponent;
  <
    PropNames extends string,
    RawBindings,
    D,
    C extends ComputedOptions = {},
    M extends MethodOptions = {},
    Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
    Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
    E extends EmitsOptions = Record<string, any>,
    EE extends string = string
  >(
    options: ComponentOptionsWithArrayProps<PropNames, RawBindings, D, C, M, Mixin, Extends, E, EE>
  ): DefineComponent<
    Readonly<
      {
        [key in PropNames]?: any;
      }
    >,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  > &
    EluxComponent;
  <
    PropsOptions extends Readonly<ComponentPropsOptions>,
    RawBindings,
    D,
    C extends ComputedOptions = {},
    M extends MethodOptions = {},
    Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
    Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
    E extends EmitsOptions = Record<string, any>,
    EE extends string = string
  >(
    options: ComponentOptionsWithObjectProps<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE>
  ): DefineComponent<PropsOptions, RawBindings, D, C, M, Mixin, Extends, E, EE> & EluxComponent;
}

export const defineView: ExportDefineComponent = function (...args: [any]) {
  const view = defineVueComponent(...args);
  return exportView(view);
};

export const defineComponent: ExportDefineComponent = function (...args: [any]) {
  const view = defineVueComponent(...args);
  return exportComponent(view);
};

let SSRTPL: string;

export function setSsrHtmlTpl(tpl: string) {
  if (tpl) {
    SSRTPL = tpl;
  }
}

export function setConfig(conf: {
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  pagenames?: Record<string, string>;
  NSP?: string;
  MSP?: string;
  MutableData?: boolean;
  DepthTimeOnLoading?: number;
  LoadComponentOnError?: Component;
  LoadComponentOnLoading?: Component;
  disableNativeRoute?: boolean;
}) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadComponentOptions(conf);
}

export interface RenderOptions {
  viewName?: string;
  id?: string;
  ssrKey?: string;
  url?: string;
}

declare const process: any;
declare const require: any;
setCoreConfig({MutableData: true});

let StageView: any;
const RootComponent: Component = (props, context) => {
  return h(StageView, props, context.slots);
};

export function createApp(moduleGetter: ModuleGetter, middlewares: IStoreMiddleware[] = [], appModuleName?: string) {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route') as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      const app = createVue(RootComponent);
      app.render = function ({id = 'root', ssrKey = 'eluxInitStore', viewName}: RenderOptions = {}) {
        const router = createRouter('Browser', routeModule.locationTransform);
        MetaData.router = router;
        const {state, components = []}: {state: any; components: string[]} = env[ssrKey] || {};
        return router.initedPromise.then((routeState) => {
          const initState = {...storeOptions.initState, route: routeState, ...state};
          const baseStore = storeCreator({...storeOptions, initState});
          return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(({store, AppView}) => {
            StageView = AppView;
            routeModule.model(store);
            router.setStore(store);
            app.use(store as any);
            app.provide<EluxContextType>(EluxContextKey, {store, documentHead: ''});
            if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
              env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
            }
            app.mount(`#${id}`);
            return store;
          });
        });
      };
      return app;
    },
  };
}

export function createSsrApp(moduleGetter: ModuleGetter, middlewares: IStoreMiddleware[] = [], appModuleName?: string) {
  setSsrHtmlTpl('');
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route') as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      const app = createSSRApp(RootComponent);
      app.render = function ({id = 'root', ssrKey = 'eluxInitStore', url = '/', viewName}: RenderOptions = {}) {
        if (!SSRTPL) {
          SSRTPL = env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
        }
        const router = createRouter(url, routeModule.locationTransform);
        MetaData.router = router;
        return router.initedPromise.then((routeState) => {
          const initState = {...storeOptions.initState, route: routeState};
          const baseStore = storeCreator({...storeOptions, initState});
          return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(({store, AppView}) => {
            StageView = AppView;
            const state = store.getState();
            const eluxContext = {deps: {}, store, documentHead: ''};
            app.use(store as any);
            app.provide<EluxContextType>(EluxContextKey, eluxContext);
            const htmlPromise: Promise<string> = require('@vue/server-renderer').renderToString(app);
            return htmlPromise.then((html) => {
              const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
              if (match) {
                return SSRTPL.replace(
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
      };
      return app;
    },
  };
}
export function patchActions(typeName: string, json?: string): void {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}

export type GetAPP<A extends RootModuleFacade> = {
  State: {[M in keyof A]: A[M]['state']};
  RouteParams: {[M in keyof A]?: A[M]['params']};
  GetRouter: () => IRouter<{[M in keyof A]: A[M]['params']}, Extract<keyof A['route']['components'], string>>;
  GetActions<N extends keyof A>(...args: N[]): {[K in N]: A[K]['actions']};
  LoadComponent: LoadComponent<A>;
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
    LoadComponent: loadComponent,
    Modules: modules,
    Pagenames: routeConfig.pagenames,
  };
}
