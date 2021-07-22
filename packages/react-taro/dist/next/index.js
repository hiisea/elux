import React from 'react';
import { routeMiddleware, setRouteConfig, routeConfig } from '@elux/route';
import { env, getRootModuleAPI, renderApp, defineModuleGetter, setConfig as setCoreConfig, getModule } from '@elux/core';
import { createRouter } from '@elux/route-mp';
import { loadComponent, setLoadComponentOptions } from './loadComponent';
import { MetaData, EluxContext } from './sington';
import { routeENV, tabPages } from './patch';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export { eventBus } from './patch';
export { default as DocumentHead } from './components/DocumentHead';
export { default as Else } from './components/Else';
export { default as Switch } from './components/Switch';
export function setConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadComponentOptions(conf);
}
export function createApp(moduleGetter, middlewares = [], appModuleName) {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route');
  return {
    useStore({
      storeOptions,
      storeCreator
    }) {
      return {
        render({
          ssrKey = 'eluxInitStore',
          viewName
        } = {}) {
          const router = createRouter(routeModule.locationTransform, routeENV, tabPages);
          MetaData.router = router;
          const {
            state,
            components = []
          } = env[ssrKey] || {};
          return router.initedPromise.then(routeState => {
            const initState = { ...storeOptions.initState,
              route: routeState,
              ...state
            };
            const baseStore = storeCreator({ ...storeOptions,
              initState
            });
            return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(({
              store,
              AppView
            }) => {
              const RootView = AppView;
              routeModule.model(store);
              router.setStore(store);
              const eluxContext = {
                store,
                documentHead: ''
              };
              const view = React.createElement(EluxContext.Provider, {
                value: eluxContext
              }, React.createElement(RootView, {
                store: store
              }));
              return {
                store,
                view
              };
            });
          });
        }

      };
    }

  };
}
export function patchActions(typeName, json) {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}
export function getApp() {
  const modules = getRootModuleAPI();
  return {
    GetActions: (...args) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    GetRouter: () => MetaData.router,
    LoadComponent: loadComponent,
    Modules: modules,
    Pagenames: routeConfig.pagenames
  };
}