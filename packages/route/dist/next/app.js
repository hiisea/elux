import { env, getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule } from '@elux/core';
import { routeMiddleware, setRouteConfig, routeConfig } from './index';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from './index';
const MetaData = {
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};
export function setMeta({
  loadComponent,
  componentRender,
  componentSSR,
  MutableData,
  router,
  SSRTPL
}) {
  loadComponent !== undefined && (MetaData.loadComponent = loadComponent);
  componentRender !== undefined && (MetaData.componentRender = componentRender);
  componentSSR !== undefined && (MetaData.componentSSR = componentSSR);
  MutableData !== undefined && setCoreConfig({
    MutableData
  });
  router !== undefined && (MetaData.router = router);
  SSRTPL !== undefined && (MetaData.SSRTPL = SSRTPL);
}
export function setBaseConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  conf.LoadComponentOnError && (MetaData.LoadComponentOnError = conf.LoadComponentOnError);
  conf.LoadComponentOnLoading && (MetaData.LoadComponentOnLoading = conf.LoadComponentOnLoading);
}
export const EluxContextKey = '__EluxContext__';
export function createBaseApp(ins, createRouter, moduleGetter, middlewares = [], appModuleName) {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
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
          viewName
        } = {}) {
          const router = createRouter(routeModule.locationTransform);
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
              MetaData.componentRender(id, AppView, store, {
                store,
                documentHead: ''
              });
              return store;
            });
          });
        }

      });
    }

  };
}
export function createBaseSSR(ins, createRouter, moduleGetter, middlewares = [], appModuleName) {
  defineModuleGetter(moduleGetter, appModuleName);
  const istoreMiddleware = [routeMiddleware, ...middlewares];
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
          viewName
        } = {}) {
          const router = createRouter(routeModule.locationTransform);
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
              const html = MetaData.componentSSR(id, AppView, store, eluxContext);
              const match = MetaData.SSRTPL.match(new RegExp(`<[^<>]+id=['"]${id}['"][^<>]*>`, 'm'));

              if (match) {
                return MetaData.SSRTPL.replace('</head>', `\r\n${eluxContext.documentHead}\r\n<script>window.${ssrKey} = ${JSON.stringify({
                  state,
                  components: Object.keys(eluxContext.deps)
                })};</script>\r\n</head>`).replace(match[0], match[0] + html);
              }

              return html;
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
    GetRouter: () => MetaData.router,
    LoadComponent: MetaData.loadComponent,
    Modules: modules,
    Pagenames: routeConfig.pagenames
  };
}