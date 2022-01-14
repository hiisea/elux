import { env, getRootModuleAPI, buildConfigSetter, initApp, setCoreConfig } from '@elux/core';
import { setRouteConfig, routeConfig, routeMeta } from '@elux/route';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, action, mutation, setLoading, logger, isServer, serverSide, clientSide, deepClone, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, exportView, exportComponent, modelHotReplacement, EmptyModuleHandlers, TaskCounter, SingleDispatcher, CoreModuleHandlers as BaseModuleHandlers, errorProcessed } from '@elux/core';
export { RouteActionTypes, location, createRouteModule, safeJsonParse } from '@elux/route';
const appMeta = {
  router: null,
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};
export const appConfig = {
  loadComponent: null,
  useRouter: null,
  useStore: null
};
export const setAppConfig = buildConfigSetter(appConfig);
export function setUserConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);

  if (conf.disableNativeRouter) {
    setRouteConfig({
      notifyNativeRouter: {
        root: false,
        internal: false
      }
    });
  }
}
export function createBaseMP(ins, router, render, middlewares = []) {
  appMeta.router = router;
  return {
    useStore({
      storeCreator,
      storeOptions
    }) {
      return Object.assign(ins, {
        render() {
          const baseStore = storeCreator(storeOptions);
          const {
            store
          } = initApp(router, baseStore, middlewares);
          const context = render({
            deps: {},
            router,
            documentHead: ''
          }, ins);
          return {
            store,
            context
          };
        }

      });
    }

  };
}
export function createBaseApp(ins, router, render, middlewares = []) {
  appMeta.router = router;
  return {
    useStore({
      storeCreator,
      storeOptions
    }) {
      return Object.assign(ins, {
        render({
          id = 'root',
          ssrKey = 'eluxInitStore',
          viewName = 'main'
        } = {}) {
          const {
            state,
            components = []
          } = env[ssrKey] || {};
          return router.initialize.then(routeState => {
            storeOptions.initState = { ...storeOptions.initState,
              [routeConfig.RouteModuleName]: routeState,
              ...state
            };
            const baseStore = storeCreator(storeOptions);
            const {
              store,
              AppView,
              setup
            } = initApp(router, baseStore, middlewares, viewName, components);
            return setup.then(() => {
              render(id, AppView, {
                deps: {},
                router,
                documentHead: ''
              }, !!env[ssrKey], ins);
              return store;
            });
          });
        }

      });
    }

  };
}
export function createBaseSSR(ins, router, render, middlewares = []) {
  appMeta.router = router;
  return {
    useStore({
      storeCreator,
      storeOptions
    }) {
      return Object.assign(ins, {
        render({
          id = 'root',
          ssrKey = 'eluxInitStore',
          viewName = 'main'
        } = {}) {
          return router.initialize.then(routeState => {
            storeOptions.initState = { ...storeOptions.initState,
              [routeConfig.RouteModuleName]: routeState
            };
            const baseStore = storeCreator(storeOptions);
            const {
              store,
              AppView,
              setup
            } = initApp(router, baseStore, middlewares, viewName);
            return setup.then(() => {
              const state = store.getState();
              const eluxContext = {
                deps: {},
                router,
                documentHead: ''
              };
              return render(id, AppView, eluxContext, ins).then(html => {
                const match = appMeta.SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

                if (match) {
                  return appMeta.SSRTPL.replace('</head>', `\r\n${eluxContext.documentHead}\r\n<script>window.${ssrKey} = ${JSON.stringify({
                    state,
                    components: Object.keys(eluxContext.deps)
                  })};</script>\r\n</head>`).replace(match[0], match[0] + html);
                }

                return html;
              });
            });
          });
        }

      });
    }

  };
}
export function patchActions(typeName, json) {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}
export function getApp(demoteForProductionOnly, injectActions) {
  const modules = getRootModuleAPI(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: (...args) => {
      return args.reduce((prev, moduleName) => {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    useRouter: appConfig.useRouter,
    useStore: appConfig.useStore,
    GetRouter: () => {
      if (env.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use getRouter() instead';
      }

      return appMeta.router;
    },
    LoadComponent: appConfig.loadComponent,
    Modules: modules,
    Pagenames: routeMeta.pagenames
  };
}