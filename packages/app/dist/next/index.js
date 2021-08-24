import { env, getRootModuleAPI, buildConfigSetter, initApp, defineModuleGetter, setCoreConfig, getModule } from '@elux/core';
import { setRouteConfig, routeConfig, routeMeta } from '@elux/route';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, action, mutation, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, modelHotReplacement, EmptyModuleHandlers, CoreModuleHandlers as BaseModuleHandlers } from '@elux/core';
export { RouteActionTypes, createRouteModule } from '@elux/route';
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
}
export function createBaseMP(ins, createRouter, render, moduleGetter, middlewares = []) {
  defineModuleGetter(moduleGetter);
  const routeModule = getModule(routeConfig.RouteModuleName);
  return {
    useStore({
      storeCreator,
      storeOptions
    }) {
      return Object.assign(ins, {
        render() {
          const router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          const baseStore = storeCreator(storeOptions);
          const {
            store
          } = initApp(router, baseStore, middlewares);
          const context = render(store, {
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
export function createBaseApp(ins, createRouter, render, moduleGetter, middlewares = []) {
  defineModuleGetter(moduleGetter);
  const routeModule = getModule(routeConfig.RouteModuleName);
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
          const router = createRouter(routeModule.locationTransform);
          appMeta.router = router;

          if (state) {
            storeOptions.initState = { ...storeOptions.initState,
              ...state
            };
          }

          const baseStore = storeCreator(storeOptions);
          return router.initialize.then(() => {
            const {
              store,
              AppView
            } = initApp(router, baseStore, middlewares, viewName, components);
            render(id, AppView, store, {
              deps: {},
              router,
              documentHead: ''
            }, !!env[ssrKey], ins);
            return store;
          });
        }

      });
    }

  };
}
export function createBaseSSR(ins, createRouter, render, moduleGetter, middlewares = [], request, response) {
  defineModuleGetter(moduleGetter);
  const routeModule = getModule(routeConfig.RouteModuleName);
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
          const router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          const baseStore = storeCreator(storeOptions);
          return router.initialize.then(() => {
            const {
              store,
              AppView,
              setup
            } = initApp(router, baseStore, middlewares, viewName, undefined, request, response);
            return setup.then(() => {
              const state = store.getState();
              const eluxContext = {
                deps: {},
                router,
                documentHead: ''
              };
              return render(id, AppView, store, eluxContext, ins).then(html => {
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
export function getApp() {
  const modules = getRootModuleAPI();
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