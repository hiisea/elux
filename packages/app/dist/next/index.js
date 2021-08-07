import { env, getRootModuleAPI, buildConfigSetter, renderApp, isPromise, defineModuleGetter, setCoreConfig, getModule } from '@elux/core';
import { routeMiddleware, setRouteConfig, routeMeta } from '@elux/route';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, action, mutation, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers, CoreModuleHandlers as BaseModuleHandlers } from '@elux/core';
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
export function createBaseMP(ins, createRouter, render, moduleGetter, middlewares = [], appModuleName) {
  defineModuleGetter(moduleGetter, appModuleName);
  const storeMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route');
  return {
    useStore({
      storeOptions,
      storeCreator
    }) {
      return Object.assign(ins, {
        render() {
          const router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          const routeState = router.initRouteState;
          const initState = {
            route: routeState
          };
          const baseStore = storeCreator({ ...storeOptions,
            initState
          }, router);
          const {
            store
          } = renderApp(router, baseStore, storeMiddleware);
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
export function createBaseApp(ins, createRouter, render, moduleGetter, middlewares = [], appModuleName) {
  defineModuleGetter(moduleGetter, appModuleName);
  const storeMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route');
  return {
    useStore({
      storeOptions,
      storeCreator
    }) {
      return Object.assign(ins, {
        render({
          id = 'root',
          ssrKey = 'eluxInitStore',
          viewName = 'main'
        } = {}) {
          const router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          const {
            state,
            components = []
          } = env[ssrKey] || {};
          const roterStatePromise = isPromise(router.initRouteState) ? router.initRouteState : Promise.resolve(router.initRouteState);
          return roterStatePromise.then(routeState => {
            const initState = { ...state,
              route: routeState
            };
            const baseStore = storeCreator({ ...storeOptions,
              initState
            }, router);
            const {
              store,
              AppView,
              setup
            } = renderApp(router, baseStore, storeMiddleware, viewName, components);
            return setup.then(() => {
              render(id, AppView, store, {
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
export function createBaseSSR(ins, createRouter, render, moduleGetter, middlewares = [], appModuleName) {
  defineModuleGetter(moduleGetter, appModuleName);
  const storeMiddleware = [routeMiddleware, ...middlewares];
  const routeModule = getModule('route');
  return {
    useStore({
      storeOptions,
      storeCreator
    }) {
      return Object.assign(ins, {
        render({
          id = 'root',
          ssrKey = 'eluxInitStore',
          viewName = 'main'
        } = {}) {
          const router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          const roterStatePromise = isPromise(router.initRouteState) ? router.initRouteState : Promise.resolve(router.initRouteState);
          return roterStatePromise.then(routeState => {
            const initState = {
              route: routeState
            };
            const baseStore = storeCreator({ ...storeOptions,
              initState
            }, router);
            const {
              store,
              AppView,
              setup
            } = renderApp(router, baseStore, storeMiddleware, viewName);
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
    getRouter: moduleHandler => moduleHandler.router,
    GetRouter: () => appMeta.router,
    LoadComponent: appConfig.loadComponent,
    Modules: modules,
    Pagenames: routeMeta.pagenames
  };
}