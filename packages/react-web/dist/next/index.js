import './env';
import React from 'react';
import { hydrate, render } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { routeMiddleware, setRouteConfig, routeConfig } from '@elux/route';
import { env, getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule } from '@elux/core';
import { createRouter } from '@elux/route-browser';
import { loadComponent, setLoadComponentOptions, DepsContext } from './loadComponent';
import { MetaData } from './sington';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent } from '@elux/core';
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
              renderFun(React.createElement(DepsContext.Provider, {
                value: {
                  deps: {},
                  store
                }
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
        ssr({
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
              const deps = {};
              let html = renderToString(React.createElement(DepsContext.Provider, {
                value: {
                  deps,
                  store
                }
              }, React.createElement(RootView, {
                store: store
              })));
              const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

              if (match) {
                const pageHead = html.split(/<head>|<\/head>/, 3);
                html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
                return SSRTPL.replace('</head>', `${pageHead[1] || ''}\r\n<script>window.${ssrKey} = ${JSON.stringify({
                  state,
                  components: Object.keys(deps)
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