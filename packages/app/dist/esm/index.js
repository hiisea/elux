import _extends from "@babel/runtime/helpers/esm/extends";
import { env, getRootModuleAPI, buildConfigSetter, syncApp, renderApp, ssrApp, isPromise, defineModuleGetter, setCoreConfig, getModule } from '@elux/core';
import { routeMiddleware, setRouteConfig, routeMeta } from '@elux/route';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, action, mutation, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
var appMeta = {
  router: null,
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};
export var appConfig = {
  loadComponent: null
};
export var setAppConfig = buildConfigSetter(appConfig);
export function setUserConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);
}
export function createBaseMP(ins, createRouter, render, moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  defineModuleGetter(moduleGetter, appModuleName);
  var istoreMiddleware = [routeMiddleware].concat(middlewares);
  var routeModule = getModule('route');
  return {
    useStore: function useStore(_ref) {
      var storeOptions = _ref.storeOptions,
          storeCreator = _ref.storeCreator;
      return Object.assign(ins, {
        render: function (_render) {
          function render(_x) {
            return _render.apply(this, arguments);
          }

          render.toString = function () {
            return _render.toString();
          };

          return render;
        }(function (_temp) {
          var _ref2 = _temp === void 0 ? {} : _temp,
              _ref2$ssrKey = _ref2.ssrKey,
              ssrKey = _ref2$ssrKey === void 0 ? 'eluxInitStore' : _ref2$ssrKey,
              viewName = _ref2.viewName;

          var router = createRouter(routeModule.locationTransform);
          appMeta.router = router;

          var _ref3 = env[ssrKey] || {},
              state = _ref3.state;

          var routeState = router.initRouteState;

          var initState = _extends({}, storeOptions.initState, {
            route: routeState
          }, state);

          var baseStore = storeCreator(_extends({}, storeOptions, {
            initState: initState
          }));

          var _syncApp = syncApp(baseStore, istoreMiddleware, viewName),
              store = _syncApp.store;

          routeModule.model(store);
          router.setStore(store);
          var view = render(store, {
            deps: {},
            store: store,
            router: router,
            documentHead: ''
          }, ins);
          return {
            store: store,
            view: view
          };
        })
      });
    }
  };
}
export function createBaseApp(ins, createRouter, render, moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  defineModuleGetter(moduleGetter, appModuleName);
  var istoreMiddleware = [routeMiddleware].concat(middlewares);
  var routeModule = getModule('route');
  return {
    useStore: function useStore(_ref4) {
      var storeOptions = _ref4.storeOptions,
          storeCreator = _ref4.storeCreator;
      return Object.assign(ins, {
        render: function (_render2) {
          function render(_x2) {
            return _render2.apply(this, arguments);
          }

          render.toString = function () {
            return _render2.toString();
          };

          return render;
        }(function (_temp2) {
          var _ref5 = _temp2 === void 0 ? {} : _temp2,
              _ref5$id = _ref5.id,
              id = _ref5$id === void 0 ? 'root' : _ref5$id,
              _ref5$ssrKey = _ref5.ssrKey,
              ssrKey = _ref5$ssrKey === void 0 ? 'eluxInitStore' : _ref5$ssrKey,
              viewName = _ref5.viewName;

          var router = createRouter(routeModule.locationTransform);
          appMeta.router = router;

          var _ref6 = env[ssrKey] || {},
              state = _ref6.state,
              _ref6$components = _ref6.components,
              components = _ref6$components === void 0 ? [] : _ref6$components;

          var roterStatePromise = isPromise(router.initRouteState) ? router.initRouteState : Promise.resolve(router.initRouteState);
          return roterStatePromise.then(function (routeState) {
            var initState = _extends({}, storeOptions.initState, {
              route: routeState
            }, state);

            var baseStore = storeCreator(_extends({}, storeOptions, {
              initState: initState
            }));
            return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(function (_ref7) {
              var store = _ref7.store,
                  AppView = _ref7.AppView;
              routeModule.model(store);
              router.setStore(store);
              render(id, AppView, store, {
                deps: {},
                store: store,
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
export function createBaseSSR(ins, createRouter, render, moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  defineModuleGetter(moduleGetter, appModuleName);
  var istoreMiddleware = [routeMiddleware].concat(middlewares);
  var routeModule = getModule('route');
  return {
    useStore: function useStore(_ref8) {
      var storeOptions = _ref8.storeOptions,
          storeCreator = _ref8.storeCreator;
      return Object.assign(ins, {
        render: function (_render3) {
          function render(_x3) {
            return _render3.apply(this, arguments);
          }

          render.toString = function () {
            return _render3.toString();
          };

          return render;
        }(function (_temp3) {
          var _ref9 = _temp3 === void 0 ? {} : _temp3,
              _ref9$id = _ref9.id,
              id = _ref9$id === void 0 ? 'root' : _ref9$id,
              _ref9$ssrKey = _ref9.ssrKey,
              ssrKey = _ref9$ssrKey === void 0 ? 'eluxInitStore' : _ref9$ssrKey,
              viewName = _ref9.viewName;

          var router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          var roterStatePromise = isPromise(router.initRouteState) ? router.initRouteState : Promise.resolve(router.initRouteState);
          return roterStatePromise.then(function (routeState) {
            var initState = _extends({}, storeOptions.initState, {
              route: routeState
            });

            var baseStore = storeCreator(_extends({}, storeOptions, {
              initState: initState
            }));
            return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(function (_ref10) {
              var store = _ref10.store,
                  AppView = _ref10.AppView;
              var state = store.getState();
              var eluxContext = {
                deps: {},
                store: store,
                router: router,
                documentHead: ''
              };
              return render(id, AppView, store, eluxContext, ins).then(function (html) {
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
    GetRouter: function GetRouter() {
      return appMeta.router;
    },
    LoadComponent: appConfig.loadComponent,
    Modules: modules,
    Pagenames: routeMeta.pagenames
  };
}