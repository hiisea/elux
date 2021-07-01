/* eslint-disable import/order */
import './env';
import React from 'react';
import {hydrate, render} from 'react-dom';
import {routeMiddleware, setRouteConfig, routeConfig} from '@elux/route';
import {env, getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule} from '@elux/core';
import {createRouter} from '@elux/route-browser';
import {loadComponent, setLoadComponentOptions, DepsContext} from './loadComponent';
import {MetaData} from './sington';
import type {ComponentType} from 'react';
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
import type {LoadComponent} from './loadComponent';

export type {RootModuleFacade as Facade, Dispatch, EluxComponent} from '@elux/core';

export type {RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from '@elux/route';
export type {LoadComponent} from './loadComponent';
export type {ConnectRedux} from '@elux/react-web-redux';
export type {ReduxStore, ReduxOptions} from '@elux/core-redux';

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
} from '@elux/core';
export {ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule} from '@elux/route';
export {connectRedux, createRedux, Provider} from '@elux/react-web-redux';
export {default as DocumentHead} from './components/DocumentHead';
export {default as Else} from './components/Else';
export {default as Switch} from './components/Switch';
export {default as Link} from './components/Link';

declare const require: any;

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
  MutableData?: boolean;
  DepthTimeOnLoading?: number;
  LoadComponentOnError?: ComponentType<{message: string}>;
  LoadComponentOnLoading?: ComponentType<{}>;
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
}
export interface SSROptions {
  viewName?: string;
  id?: string;
  ssrKey?: string;
  url: string;
}

export function createApp(moduleGetter: ModuleGetter, middlewares: IStoreMiddleware[] = [], appModuleName?: string) {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route') as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      return {
        render({id = 'root', ssrKey = 'eluxInitStore', viewName}: RenderOptions = {}) {
          const router = createRouter('Browser', routeModule.locationTransform);
          MetaData.router = router;
          const renderFun = env[ssrKey] ? hydrate : render;
          const {state, components = []}: {state: any; components: string[]} = env[ssrKey] || {};
          const panel = env.document.getElementById(id);
          return router.initedPromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState, ...state};
            const baseStore = storeCreator({...storeOptions, initState});
            return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(({store, AppView}) => {
              const RootView: ComponentType<any> = AppView as any;
              routeModule.model(store);
              router.setStore(store);
              renderFun(
                <DepsContext.Provider value={{deps: {}, store}}>
                  <RootView store={store} />
                </DepsContext.Provider>,
                panel
              );
              return store;
            });
          });
        },
        ssr({id = 'root', ssrKey = 'eluxInitStore', url, viewName}: SSROptions) {
          if (!SSRTPL) {
            SSRTPL = env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
          }
          const router = createRouter(url, routeModule.locationTransform);
          MetaData.router = router;
          return router.initedPromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState};
            const baseStore = storeCreator({...storeOptions, initState});
            return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(({store, AppView}) => {
              const RootView: ComponentType<any> = AppView as any;
              const state = store.getState();
              const deps = {};
              let html: string = require('react-dom/server').renderToString(
                <DepsContext.Provider value={{deps, store}}>
                  <RootView store={store} />
                </DepsContext.Provider>
              );
              const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));
              if (match) {
                const pageHead = html.split(/<head>|<\/head>/, 3);
                html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
                return SSRTPL.replace(
                  '</head>',
                  `${pageHead[1] || ''}\r\n<script>window.${ssrKey} = ${JSON.stringify({state, components: Object.keys(deps)})};</script>\r\n</head>`
                ).replace(match[0], match[0] + html);
              }
              return html;
            });
          });
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
