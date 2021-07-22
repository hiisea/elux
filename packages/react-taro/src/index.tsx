/// <reference path="../runtime/runtime.d.ts" />
import React from 'react';
import {routeMiddleware, setRouteConfig, routeConfig} from '@elux/route';
import {env, getRootModuleAPI, renderApp, defineModuleGetter, setConfig as setCoreConfig, getModule} from '@elux/core';
import {createRouter} from '@elux/route-mp';
import {loadComponent, setLoadComponentOptions} from './loadComponent';
import {MetaData, EluxContext} from './sington';
import {routeENV, tabPages} from './patch';
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
import type {IRouter} from '@elux/route-mp';
import type {LoadComponent} from './loadComponent';

export type {RootModuleFacade as Facade, Dispatch, EluxComponent} from '@elux/core';

export type {RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial} from '@elux/route';
export type {LoadComponent} from './loadComponent';

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
export {ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule} from '@elux/route';
export {eventBus} from './patch';
export {default as DocumentHead} from './components/DocumentHead';
export {default as Else} from './components/Else';
export {default as Switch} from './components/Switch';

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
}): void {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadComponentOptions(conf);
}

export interface RenderOptions {
  viewName?: string;
  ssrKey?: string;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createApp(moduleGetter: ModuleGetter, middlewares: IStoreMiddleware[] = [], appModuleName?: string) {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route') as RouteModule;
  return {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore = BStore>({storeOptions, storeCreator}: StoreBuilder<O, B>) {
      return {
        render({ssrKey = 'eluxInitStore', viewName}: RenderOptions = {}) {
          const router = createRouter(routeModule.locationTransform, routeENV, tabPages);
          MetaData.router = router;
          const {state, components = []}: {state: any; components: string[]} = env[ssrKey] || {};
          return router.initedPromise.then((routeState) => {
            const initState = {...storeOptions.initState, route: routeState, ...state};
            const baseStore = storeCreator({...storeOptions, initState});
            return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(({store, AppView}) => {
              const RootView: ComponentType<any> = AppView as any;
              routeModule.model(store);
              router.setStore(store);
              const eluxContext = {store, documentHead: ''};
              const view = (
                <EluxContext.Provider value={eluxContext}>
                  <RootView store={store} />
                </EluxContext.Provider>
              );
              return {store, view};
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
