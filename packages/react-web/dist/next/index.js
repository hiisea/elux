import './env';
import React from 'react';
import { hydrate, render } from 'react-dom';
import { routeMiddleware, setRouteConfig, routeConfig } from '@elux/route';
import { env, getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule } from '@elux/core';
import { createRouter } from '@elux/route-browser';
import { loadView, setLoadViewOptions, DepsContext } from './loadView';
import { MetaData } from './sington';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, defineView } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export { connectRedux, createRedux, Provider } from '@elux/react-web-redux';
export { DocumentHead } from './components/DocumentHead';
export { Else } from './components/Else';
export { Switch } from './components/Switch';
export { Link } from './components/Link';
let SSRTPL;
export function setSsrHtmlTpl(tpl) {
  SSRTPL = tpl;
}
export function setConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadViewOptions(conf);
}
export function createApp(moduleGetter, middlewares = [], appModuleName) {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
  const {
    locationTransform
  } = getModule('route');
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
          const router = createRouter('Browser', locationTransform);
          MetaData.router = router;
          const renderFun = env[ssrKey] ? hydrate : render;
          const {
            state,
            deps = []
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
            return renderApp(baseStore, Object.keys(initState), deps, istoreMiddleware, viewName).then(({
              store,
              AppView
            }) => {
              router.setStore(store);
              renderFun(React.createElement(AppView, {
                store: store
              }), panel);
              return store;
            });
          });
        },

        ssr({
          id = 'root',
          ssrKey = 'eluxInitStore',
          url,
          viewName
        }) {
          if (!SSRTPL) {
            SSRTPL = env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
          }

          const router = createRouter(url, locationTransform);
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
              const state = store.getState();
              const deps = {};

              let html = require('react-dom/server').renderToString(React.createElement(DepsContext.Provider, {
                value: deps
              }, React.createElement(AppView, {
                store: store
              })));

              const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

              if (match) {
                const pageHead = html.split(/<head>|<\/head>/, 3);
                html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
                return SSRTPL.replace('</head>', `${pageHead[1] || ''}\r\n<script>window.${ssrKey} = ${JSON.stringify({
                  state,
                  deps: Object.keys(deps)
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
    LoadView: loadView,
    Modules: modules,
    Pagenames: routeConfig.pagenames
  };
}