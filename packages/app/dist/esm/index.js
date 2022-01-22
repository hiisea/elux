import _extends from "@babel/runtime/helpers/esm/extends";
import { env, getRootModuleAPI, buildConfigSetter, initApp, setCoreConfig } from '@elux/core';
import { setRouteConfig, routeConfig, routeMeta } from '@elux/route';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, action, mutation, setLoading, logger, isServer, serverSide, clientSide, deepClone, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, exportView, exportComponent, modelHotReplacement, EmptyModuleHandlers, TaskCounter, SingleDispatcher, CoreModuleHandlers as BaseModuleHandlers, errorProcessed } from '@elux/core';
export { RouteActionTypes, location, createRouteModule, safeJsonParse } from '@elux/route';
var appMeta = {
  router: null,
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};
export var appConfig = {
  loadComponent: null,
  useRouter: null,
  useStore: null
};
export var setAppConfig = buildConfigSetter(appConfig);
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
export function createBaseMP(ins, router, render, storeInitState, storeMiddlewares, storeLogger) {
  if (storeMiddlewares === void 0) {
    storeMiddlewares = [];
  }

  appMeta.router = router;
  return Object.assign(ins, {
    render: function (_render) {
      function render() {
        return _render.apply(this, arguments);
      }

      render.toString = function () {
        return _render.toString();
      };

      return render;
    }(function () {
      var storeData = {};

      var _initApp = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger),
          store = _initApp.store;

      var context = render({
        deps: {},
        router: router,
        documentHead: ''
      }, ins);
      return {
        store: store,
        context: context
      };
    })
  });
}
export function createBaseApp(ins, router, render, storeInitState, storeMiddlewares, storeLogger) {
  if (storeMiddlewares === void 0) {
    storeMiddlewares = [];
  }

  appMeta.router = router;
  return Object.assign(ins, {
    render: function (_render2) {
      function render(_x) {
        return _render2.apply(this, arguments);
      }

      render.toString = function () {
        return _render2.toString();
      };

      return render;
    }(function (_temp) {
      var _ref = _temp === void 0 ? {} : _temp,
          _ref$id = _ref.id,
          id = _ref$id === void 0 ? 'root' : _ref$id,
          _ref$ssrKey = _ref.ssrKey,
          ssrKey = _ref$ssrKey === void 0 ? 'eluxInitStore' : _ref$ssrKey,
          _ref$viewName = _ref.viewName,
          viewName = _ref$viewName === void 0 ? 'main' : _ref$viewName;

      var _ref2 = env[ssrKey] || {},
          state = _ref2.state,
          _ref2$components = _ref2.components,
          components = _ref2$components === void 0 ? [] : _ref2$components;

      return router.initialize.then(function (routeState) {
        var _extends2;

        var storeData = _extends((_extends2 = {}, _extends2[routeConfig.RouteModuleName] = routeState, _extends2), state);

        var _initApp2 = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName, components),
            store = _initApp2.store,
            AppView = _initApp2.AppView,
            setup = _initApp2.setup;

        return setup.then(function () {
          render(id, AppView, {
            deps: {},
            router: router,
            documentHead: ''
          }, !!env[ssrKey], ins, store);
        });
      });
    })
  });
}
export function createBaseSSR(ins, router, render, storeInitState, storeMiddlewares, storeLogger) {
  if (storeMiddlewares === void 0) {
    storeMiddlewares = [];
  }

  appMeta.router = router;
  return Object.assign(ins, {
    render: function (_render3) {
      function render(_x2) {
        return _render3.apply(this, arguments);
      }

      render.toString = function () {
        return _render3.toString();
      };

      return render;
    }(function (_temp2) {
      var _ref3 = _temp2 === void 0 ? {} : _temp2,
          _ref3$id = _ref3.id,
          id = _ref3$id === void 0 ? 'root' : _ref3$id,
          _ref3$ssrKey = _ref3.ssrKey,
          ssrKey = _ref3$ssrKey === void 0 ? 'eluxInitStore' : _ref3$ssrKey,
          _ref3$viewName = _ref3.viewName,
          viewName = _ref3$viewName === void 0 ? 'main' : _ref3$viewName;

      return router.initialize.then(function (routeState) {
        var _storeData;

        var storeData = (_storeData = {}, _storeData[routeConfig.RouteModuleName] = routeState, _storeData);

        var _initApp3 = initApp(router, storeData, storeInitState, storeMiddlewares, storeLogger, viewName),
            store = _initApp3.store,
            AppView = _initApp3.AppView,
            setup = _initApp3.setup;

        return setup.then(function () {
          var state = store.getState();
          var eluxContext = {
            deps: {},
            router: router,
            documentHead: ''
          };
          return render(id, AppView, eluxContext, ins, store).then(function (html) {
            var match = appMeta.SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + id + "['\"][^<>]*>", 'm'));

            if (match) {
              return appMeta.SSRTPL.replace('</head>', "\r\n" + eluxContext.documentHead + "\r\n<script>window." + ssrKey + " = " + JSON.stringify({
                state: state,
                components: Object.keys(eluxContext.deps)
              }) + ";</script>\r\n</head>").replace(match[0], match[0] + html);
            }

            return html;
          });
        });
      });
    })
  });
}
export function patchActions(typeName, json) {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}
export function getApp(demoteForProductionOnly, injectActions) {
  var modules = getRootModuleAPI(demoteForProductionOnly && process.env.NODE_ENV !== 'production' ? undefined : injectActions);
  return {
    GetActions: function GetActions() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return args.reduce(function (prev, moduleName) {
        prev[moduleName] = modules[moduleName].actions;
        return prev;
      }, {});
    },
    useRouter: appConfig.useRouter,
    useStore: appConfig.useStore,
    GetRouter: function GetRouter() {
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