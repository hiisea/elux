/* eslint-disable import/order */
import './env';
import React from 'react';
import {hydrate, render} from 'react-dom';
import {routeMiddleware, setRouteConfig, routeConfig} from '@elux/route';
import {env, getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule} from '@elux/core';
import {createRouter} from '@elux/route-browser';
import {loadView, setLoadViewOptions, DepsContext} from './loadView';
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
import type {LoadView} from './loadView';

export type {RootModuleFacade as Facade, Dispatch, CoreModuleState as BaseModuleState} from '@elux/core';

export type {RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from '@elux/route';
export type {LoadView} from './loadView';
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
  defineView,
} from '@elux/core';
export {ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule} from '@elux/route';
export {connectRedux, createRedux, Provider} from '@elux/react-web-redux';
export {DocumentHead} from './components/DocumentHead';
export {Else} from './components/Else';
export {Switch} from './components/Switch';
export {Link} from './components/Link';

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
  LoadViewOnError?: ComponentType<{message: string}>;
  LoadViewOnLoading?: ComponentType<{}>;
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
          const renderFun = env[ssrKey] ? hydrate : render;
          const {state, deps = []}: {state: any; deps: string[]} = env[ssrKey] || {};
          const panel = env.document.getElementById(id);
          return router.initedPromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState, ...state};
            const baseStore = storeCreator({...storeOptions, initState});
            return renderApp(baseStore, Object.keys(initState), deps, istoreMiddleware, viewName).then(({store, AppView}) => {
              router.setStore(store);
              renderFun(<AppView store={store} />, panel);
              return store;
            });
          });
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
              let html: string = require('react-dom/server').renderToString(
                <DepsContext.Provider value={deps}>
                  <AppView store={store} />
                </DepsContext.Provider>
              );
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
