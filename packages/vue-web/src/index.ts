/* eslint-disable import/order */
import './env';
import {routeMiddleware, setRouteConfig, routeConfig} from '@elux/route';
import {
  env,
  getRootModuleAPI,
  renderApp,
  ssrApp,
  defineModuleGetter,
  setConfig as setCoreConfig,
  getModule,
  defineView as baseDefineView,
} from '@elux/core';
import {createRouter} from '@elux/route-browser';
import {createApp as createVue, defineComponent} from 'vue';
import {loadView, setLoadViewOptions} from './loadView';
import {MetaData} from './sington';
import type {Component} from 'vue';
import type {
  ModuleGetter,
  IStoreMiddleware,
  StoreBuilder,
  BStoreOptions,
  BStore,
  RootModuleFacade,
  RootModuleAPI,
  RootModuleActions,
} from '@elux/core';
import type {RouteModule} from '@elux/route';
import type {IRouter} from '@elux/route-browser';
import type {LoadView} from './loadView';

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
} from '@elux/core';
export {ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule} from '@elux/route';
export {defineComponent} from 'vue';

export type {RootModuleFacade as Facade, Dispatch, CoreModuleState as BaseModuleState} from '@elux/core';
export type {RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from '@elux/route';
export type {VuexStore, VuexOptions} from '@elux/core-vuex';
export type {LoadView} from './loadView';

export const defineView: typeof defineComponent = function (...args: [any]) {
  const view = defineComponent(...args);
  return baseDefineView(view);
};

let SSRTPL: string;

export function setSsrHtmlTpl(tpl: string) {
  SSRTPL = tpl;
}

export function setConfig(conf: {
  actionMaxHistory?: number;
  pagesMaxHistory?: number;
  pagenames?: Record<string, string>;
  NSP?: string;
  MSP?: string;
  DepthTimeOnLoading?: number;
  LoadViewOnError?: Component;
  LoadViewOnLoading?: Component;
  disableNativeRoute?: boolean;
}) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadViewOptions(conf);
}

export interface RenderOptions {
  viewName?: string;
  id?: string;
  ssrKey?: string;
}
export interface SSROptions {
  viewName?: string;
  id?: string;
  ssrKey?: string;
  url: string;
}

declare const process: any;

setCoreConfig({MutableData: true});

export function createApp(moduleGetter: ModuleGetter, middlewares: IStoreMiddleware[] = [], appModuleName?: string) {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const {locationTransform} = getModule('route') as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      return {
        render({id = 'root', ssrKey = 'eluxInitStore', viewName}: RenderOptions = {}) {
          const router = createRouter('Browser', locationTransform);
          MetaData.router = router;
          // const renderFun = env[ssrKey] ? hydrate : render;
          const {state, deps = []}: {state: any; deps: string[]} = env[ssrKey] || {};
          return router.initedPromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState, ...state};
            const baseStore = storeCreator({...storeOptions, initState});
            return renderApp(baseStore, Object.keys(initState), deps, istoreMiddleware, viewName).then(({store, AppView}) => {
              router.setStore(store);
              const app = createVue(AppView)
                .use(store as any)
                .mount(`#${id}`);
              if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
                env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
              }
              return store;
            });
          });

          // const router = createRouter('Browser', locationTransform);
          // const routeState = router.getRouteState();
          // const ssrData = env[ssrKey];
          // // const renderFun = ssrData ? hydrate : render;
          // // const panel = env.document.getElementById(id);
          // const initState = {...storeOptions.initState, route: routeState, ...ssrData};
          // const baseStore = storeCreator({...storeOptions, initState});
          // const {store, beforeRender} = renderApp(baseStore, Object.keys(initState), moduleGetter, controllerMiddleware, appModuleName, appViewName);
          // router.setStore(store);
          // MetaData.router = router;
          // return {
          //   store,
          //   run() {
          //     return beforeRender().then((AppView: Component) => {
          //       const app = createVue(AppView)
          //         .use(store as any)
          //         .mount(`#${id}`);
          //       if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
          //         env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
          //       }
          //     });
          //   },
          // };
        },
        ssr({id = 'root', ssrKey = 'eluxInitStore', url, viewName}: SSROptions) {
          if (!SSRTPL) {
            SSRTPL = env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
          }
          const router = createRouter(url, locationTransform);
          MetaData.router = router;
          return router.initedPromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState};
            const baseStore = storeCreator({...storeOptions, initState});
            return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(({store, AppView}) => {
              const state = store.getState();
              const deps = {};
              let html: string = '';
              const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
              if (match) {
                const pageHead = html.split(/<head>|<\/head>/, 3);
                html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
                return SSRTPL.replace(
                  '</head>',
                  `${pageHead[1] || ''}\r\n<script>window.${ssrKey} = ${JSON.stringify({state, deps: Object.keys(deps)})};</script>\r\n</head>`
                ).replace(match[0], match[0] + html);
              }
              return html;
            });
          });
          // const routeState = router.getRouteState();
          // const initState = {...storeOptions.initState, route: routeState};
          // const baseStore = storeCreator({...storeOptions, initState});
          // const {store, beforeRender} = ssrApp(
          //   baseStore,
          //   Object.keys(routeState.params),
          //   moduleGetter,
          //   controllerMiddleware,
          //   appModuleName,
          //   appViewName
          // );
          // router.setStore(store);
          // MetaData.router = router;
          // return {
          //   store,
          //   run() {
          //     return beforeRender().then((AppView: Component) => {
          //       const data = store.getState();
          //       let html: string = '';

          //       const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
          //       if (match) {
          //         const pageHead = html.split(/<head>|<\/head>/, 3);
          //         html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
          //         return SSRTPL.replace(
          //           '</head>',
          //           `${pageHead[1] || ''}\r\n<script>window.${ssrKey} = ${JSON.stringify(data)};</script>\r\n</head>`
          //         ).replace(match[0], match[0] + html);
          //       }
          //       return html;
          //     });
          //   },
          // };
        },
      };
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
  LoadView: LoadView<A>;
  Modules: RootModuleAPI<A>;
  Actions: RootModuleActions<A>;
  Pagenames: {[K in keyof A['route']['components']]: K};
};

export function getApp<T extends {GetActions: any; GetRouter: any; LoadView: any; Modules: any; Pagenames: any}>(): Pick<
  T,
  'GetActions' | 'GetRouter' | 'LoadView' | 'Modules' | 'Pagenames'
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
    LoadView: loadView,
    Modules: modules,
    Pagenames: routeConfig.pagenames,
  };
}
