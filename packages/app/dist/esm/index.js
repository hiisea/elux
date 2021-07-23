import _extends from "@babel/runtime/helpers/esm/extends";
import { env, getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule } from '@elux/core';
import { routeMiddleware, setRouteConfig, routeConfig } from '@elux/route';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
var MetaData = {
  SSRTPL: env.isServer ? env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};
export function setBaseMeta(_ref) {
  var loadComponent = _ref.loadComponent,
      MutableData = _ref.MutableData,
      router = _ref.router;
  loadComponent !== undefined && (MetaData.loadComponent = loadComponent);
  MutableData !== undefined && setCoreConfig({
    MutableData: MutableData
  });
  router !== undefined && (MetaData.router = router);
}
export function setBaseConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);
}
export var EluxContextKey = '__EluxContext__';
export function createBaseApp(ins, createRouter, render, moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  defineModuleGetter(moduleGetter, appModuleName);
  var istoreMiddleware = [routeMiddleware].concat(middlewares);
  var routeModule = getModule('route');
  return {
    useStore: function useStore(_ref2) {
      var storeOptions = _ref2.storeOptions,
          storeCreator = _ref2.storeCreator;
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
          var _ref3 = _temp === void 0 ? {} : _temp,
              _ref3$id = _ref3.id,
              id = _ref3$id === void 0 ? 'root' : _ref3$id,
              _ref3$ssrKey = _ref3.ssrKey,
              ssrKey = _ref3$ssrKey === void 0 ? 'eluxInitStore' : _ref3$ssrKey,
              viewName = _ref3.viewName;

          var router = createRouter(routeModule.locationTransform);
          MetaData.router = router;

          var _ref4 = env[ssrKey] || {},
              state = _ref4.state,
              _ref4$components = _ref4.components,
              components = _ref4$components === void 0 ? [] : _ref4$components;

          return router.initedPromise.then(function (routeState) {
            var initState = _extends({}, storeOptions.initState, {
              route: routeState
            }, state);

            var baseStore = storeCreator(_extends({}, storeOptions, {
              initState: initState
            }));
            return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(function (_ref5) {
              var store = _ref5.store,
                  AppView = _ref5.AppView;
              routeModule.model(store);
              router.setStore(store);
              render(id, AppView, store, {
                deps: {},
                store: store,
                router: router,
                documentHead: ''
              }, !!env[ssrKey]);
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
    useStore: function useStore(_ref6) {
      var storeOptions = _ref6.storeOptions,
          storeCreator = _ref6.storeCreator;
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
          var _ref7 = _temp2 === void 0 ? {} : _temp2,
              _ref7$id = _ref7.id,
              id = _ref7$id === void 0 ? 'root' : _ref7$id,
              _ref7$ssrKey = _ref7.ssrKey,
              ssrKey = _ref7$ssrKey === void 0 ? 'eluxInitStore' : _ref7$ssrKey,
              viewName = _ref7.viewName;

          var router = createRouter(routeModule.locationTransform);
          MetaData.router = router;
          return router.initedPromise.then(function (routeState) {
            var initState = _extends({}, storeOptions.initState, {
              route: routeState
            });

            var baseStore = storeCreator(_extends({}, storeOptions, {
              initState: initState
            }));
            return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(function (_ref8) {
              var store = _ref8.store,
                  AppView = _ref8.AppView;
              var state = store.getState();
              var eluxContext = {
                deps: {},
                store: store,
                router: router,
                documentHead: ''
              };
              var html = render(id, AppView, store, eluxContext);
              var match = MetaData.SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + id + "['\"][^<>]*>", 'm'));

              if (match) {
                return MetaData.SSRTPL.replace('</head>', "\r\n" + eluxContext.documentHead + "\r\n<script>window." + ssrKey + " = " + JSON.stringify({
                  state: state,
                  components: Object.keys(eluxContext.deps)
                }) + ";</script>\r\n</head>").replace(match[0], match[0] + html);
              }

              return html;
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
      return MetaData.router;
    },
    LoadComponent: MetaData.loadComponent,
    Modules: modules,
    Pagenames: routeConfig.pagenames
  };
}