import { env, getModuleMap, buildConfigSetter, initApp, setCoreConfig, coreConfig } from '@elux/core';
import { setRouteConfig, toURouter } from '@elux/route';
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
export function createBaseMP(ins, router, render, storeInitState, storeMiddlewares = [], storeLogger) {
  const urouter = toURouter(router);
  appMeta.router = urouter;
  return Object.assign(ins, {
    render() {
      const storeData = {};
      const {
        store
      } = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger);
      const context = render({
        deps: {},
        router: urouter,
        documentHead: ''
      }, ins);
      return {
        store,
        context
      };
    }

  });
}
export function createBaseApp(ins, router, render, storeInitState, storeMiddlewares = [], storeLogger) {
  const urouter = toURouter(router);
  appMeta.router = urouter;
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
        const storeData = {
          [coreConfig.RouteModuleName]: routeState,
          ...state
        };
        const {
          store,
          AppView,
          setup
        } = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName, components);
        return setup.then(() => {
          render(id, AppView, {
            deps: {},
            router: urouter,
            documentHead: ''
          }, !!env[ssrKey], ins, store);
        });
      });
    }

  });
}
export function createBaseSSR(ins, router, render, storeInitState, storeMiddlewares = [], storeLogger) {
  const urouter = toURouter(router);
  appMeta.router = urouter;
  return Object.assign(ins, {
    render({
      id = 'root',
      ssrKey = 'eluxInitStore',
      viewName = 'main'
    } = {}) {
      return router.initialize.then(routeState => {
        const storeData = {
          [coreConfig.RouteModuleName]: routeState
        };
        const {
          store,
          AppView,
          setup
        } = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName);
        return setup.then(() => {
          const state = store.getState();
          const eluxContext = {
            deps: {},
            router: urouter,
            documentHead: ''
          };
          return render(id, AppView, eluxContext, ins, store).then(html => {
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
export function patchActions(typeName, json) {
  if (json) {
    getModuleMap(JSON.parse(json));
  }
}
export function getApi(demoteForProductionOnly, injectActions) {
  const modules = getModuleMap(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
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
    Modules: modules
  };
}