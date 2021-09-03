import _extends from "@babel/runtime/helpers/esm/extends";
import { env, getRootModuleAPI, buildConfigSetter, initApp, defineModuleGetter, setCoreConfig, getModule } from '@elux/core';
import { setRouteConfig, routeConfig, routeMeta } from '@elux/route';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, action, mutation, setLoading, logger, isServer, serverSide, clientSide, deepClone, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, modelHotReplacement, EmptyModuleHandlers, CoreModuleHandlers as BaseModuleHandlers } from '@elux/core';
export { RouteActionTypes, createRouteModule } from '@elux/route';
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
}
export function createBaseMP(ins, createRouter, render, moduleGetter, middlewares) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  defineModuleGetter(moduleGetter);
  var routeModule = getModule(routeConfig.RouteModuleName);
  return {
    useStore: function useStore(_ref) {
      var storeCreator = _ref.storeCreator,
          storeOptions = _ref.storeOptions;
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
          var router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          var baseStore = storeCreator(storeOptions);

          var _initApp = initApp(router, baseStore, middlewares),
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
  };
}
export function createBaseApp(ins, createRouter, render, moduleGetter, middlewares) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  defineModuleGetter(moduleGetter);
  var routeModule = getModule(routeConfig.RouteModuleName);
  return {
    useStore: function useStore(_ref2) {
      var storeCreator = _ref2.storeCreator,
          storeOptions = _ref2.storeOptions;
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
          var _ref3 = _temp === void 0 ? {} : _temp,
              _ref3$id = _ref3.id,
              id = _ref3$id === void 0 ? 'root' : _ref3$id,
              _ref3$ssrKey = _ref3.ssrKey,
              ssrKey = _ref3$ssrKey === void 0 ? 'eluxInitStore' : _ref3$ssrKey,
              _ref3$viewName = _ref3.viewName,
              viewName = _ref3$viewName === void 0 ? 'main' : _ref3$viewName;

          var _ref4 = env[ssrKey] || {},
              state = _ref4.state,
              _ref4$components = _ref4.components,
              components = _ref4$components === void 0 ? [] : _ref4$components;

          var router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          return router.initialize.then(function (routeState) {
            var _extends2;

            storeOptions.initState = _extends({}, storeOptions.initState, (_extends2 = {}, _extends2[routeConfig.RouteModuleName] = routeState, _extends2), state);
            var baseStore = storeCreator(storeOptions);

            var _initApp2 = initApp(router, baseStore, middlewares, viewName, components),
                store = _initApp2.store,
                AppView = _initApp2.AppView,
                setup = _initApp2.setup;

            return setup.then(function () {
              render(id, AppView, {
                deps: {},
                router: router,
                documentHead: ''
              }, !!env[ssrKey], ins);
              return store;
            });
          });
        })
      });
    }
  };
}
export function createBaseSSR(ins, createRouter, render, moduleGetter, middlewares) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  defineModuleGetter(moduleGetter);
  var routeModule = getModule(routeConfig.RouteModuleName);
  return {
    useStore: function useStore(_ref5) {
      var storeCreator = _ref5.storeCreator,
          storeOptions = _ref5.storeOptions;
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
          var _ref6 = _temp2 === void 0 ? {} : _temp2,
              _ref6$id = _ref6.id,
              id = _ref6$id === void 0 ? 'root' : _ref6$id,
              _ref6$ssrKey = _ref6.ssrKey,
              ssrKey = _ref6$ssrKey === void 0 ? 'eluxInitStore' : _ref6$ssrKey,
              _ref6$viewName = _ref6.viewName,
              viewName = _ref6$viewName === void 0 ? 'main' : _ref6$viewName;

          var router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          return router.initialize.then(function (routeState) {
            var _extends3;

            storeOptions.initState = _extends({}, storeOptions.initState, (_extends3 = {}, _extends3[routeConfig.RouteModuleName] = routeState, _extends3));
            var baseStore = storeCreator(storeOptions);

            var _initApp3 = initApp(router, baseStore, middlewares, viewName),
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
              return render(id, AppView, eluxContext, ins).then(function (html) {
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
  };
}
export function patchActions(typeName, json) {
  if (json) {
    getRootModuleAPI(JSON.parse(json));
  }
}
export function getApp() {
  var modules = getRootModuleAPI();
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