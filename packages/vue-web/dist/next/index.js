import env from './env';
import { routeMiddleware, setRouteConfig, routeConfig } from '@elux/route';
import { getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule, exportView, exportComponent } from '@elux/core';
import { createRouter } from '@elux/route-browser';
import { createApp as createVue, createSSRApp, defineComponent as defineVueComponent } from 'vue';
import { loadComponent, setLoadComponentOptions } from './loadComponent';
import { MetaData, EluxContextKey } from './sington';
export { createVuex } from '@elux/core-vuex';
export { ActionTypes, LoadingState, env, effect, mutation, errorAction, reducer, action, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export { default as DocumentHead } from './components/DocumentHead';
export { default as Link } from './components/Link';
export const defineView = function (...args) {
  const view = defineVueComponent(...args);
  return exportView(view);
};
export const defineComponent = function (...args) {
  const view = defineVueComponent(...args);
  return exportComponent(view);
};
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
setCoreConfig({
  MutableData: true
});
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
          const router = createRouter('Browser', routeModule.locationTransform);
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
              routeModule.model(store);
              router.setStore(store);
              const app = createVue(AppView).use(store);
              app.provide(EluxContextKey, {
                store,
                documentHead: ''
              });

              if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
                env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
              }

              return {
                store,
                app
              };
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
              const state = store.getState();
              const eluxContext = {
                deps: {},
                store,
                documentHead: ''
              };
              const app = createSSRApp(AppView).use(store);
              app.provide(EluxContextKey, eluxContext);

              const htmlPromise = require('@vue/server-renderer').renderToString(app);

              return htmlPromise.then(html => {
                const match = SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

                if (match) {
                  return SSRTPL.replace('</head>', `${eluxContext.documentHead}\r\n<script>window.${ssrKey} = ${JSON.stringify({
                    state,
                    components: Object.keys(eluxContext.deps)
                  })};</script>\r\n</head>`).replace(match[0], match[0] + html);
                }

                return html;
              });
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