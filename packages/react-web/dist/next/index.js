import env from './env';
import React from 'react';
import { hydrate, render } from 'react-dom';
import { routeMiddleware, setRouteConfig, routeConfig } from '@elux/route';
import { getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule } from '@elux/core';
import { createRouter } from '@elux/route-browser';
import { loadComponent, setLoadComponentOptions } from './loadComponent';
import { MetaData, EluxContext } from './sington';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export { connectRedux, createRedux, Provider } from '@elux/react-web-redux';
export { default as DocumentHead } from './components/DocumentHead';
export { default as Else } from './components/Else';
export { default as Switch } from './components/Switch';
export { default as Link } from './components/Link';
let SSRTPL;
export function setSsrHtmlTpl(tpl) {
  if (tpl) {
    SSRTPL = tpl;
  }
}
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
          id = 'root',
          ssrKey = 'eluxInitStore',
          viewName
        } = {}) {
          const router = createRouter('Browser', routeModule.locationTransform);
          MetaData.router = router;
          const renderFun = env[ssrKey] ? hydrate : render;
          const {
            state,
            components = []
          } = env[ssrKey] || {};
          const panel = env.document.getElementById(id);
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
              renderFun(React.createElement(EluxContext.Provider, {
                value: eluxContext
              }, React.createElement(RootView, {
                store: store
              })), panel);
              return store;
            });
          });
        }

      };
    }

  };
}
export function createSsrApp(moduleGetter, middlewares = [], appModuleName) {
  setSsrHtmlTpl('');
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
          id = 'root',
          ssrKey = 'eluxInitStore',
          url,
          viewName
        }) {
          if (!SSRTPL) {
            SSRTPL = env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
          }

          const router = createRouter(url, routeModule.locationTransform);
          MetaData.router = router;
          return router.initedPromise.then(routeState => {
            const initState = { ...storeOptions.initState,
              route: routeState
            };
            const baseStore = storeCreator({ ...storeOptions,
              initState
            });
            return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(({
              store,
              AppView
            }) => {
              const RootView = AppView;
              const state = store.getState();
              const eluxContext = {
                deps: {},
                store,
                documentHead: ''
              };

              const html = require('react-dom/server').renderToString(React.createElement(EluxContext.Provider, {
                value: eluxContext
              }, React.createElement(RootView, {
                store: store
              })));

              const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

              if (match) {
                return SSRTPL.replace('</head>', `\r\n${eluxContext.documentHead}\r\n<script>window.${ssrKey} = ${JSON.stringify({
                  state,
                  components: Object.keys(eluxContext.deps)
                })};</script>\r\n</head>`).replace(match[0], match[0] + html);
              }

              return html;
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