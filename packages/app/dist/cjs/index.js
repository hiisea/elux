"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setUserConfig = setUserConfig;
exports.createBaseApp = createBaseApp;
exports.createBaseSSR = createBaseSSR;
exports.patchActions = patchActions;
exports.getApp = getApp;
exports.EluxContextKey = exports.setAppConfig = exports.appConfig = exports.createRouteModule = exports.RouteActionTypes = exports.BaseModuleHandlers = exports.EmptyModuleHandlers = exports.exportComponent = exports.exportView = exports.delayPromise = exports.setProcessedError = exports.isProcessedError = exports.exportModule = exports.deepMergeState = exports.deepMerge = exports.clientSide = exports.serverSide = exports.isServer = exports.logger = exports.setLoading = exports.reducer = exports.errorAction = exports.effect = exports.LoadingState = exports.ActionTypes = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _core = require("@elux/core");

exports.env = _core.env;
exports.ActionTypes = _core.ActionTypes;
exports.LoadingState = _core.LoadingState;
exports.effect = _core.effect;
exports.errorAction = _core.errorAction;
exports.reducer = _core.reducer;
exports.setLoading = _core.setLoading;
exports.logger = _core.logger;
exports.isServer = _core.isServer;
exports.serverSide = _core.serverSide;
exports.clientSide = _core.clientSide;
exports.deepMerge = _core.deepMerge;
exports.deepMergeState = _core.deepMergeState;
exports.exportModule = _core.exportModule;
exports.isProcessedError = _core.isProcessedError;
exports.setProcessedError = _core.setProcessedError;
exports.delayPromise = _core.delayPromise;
exports.exportView = _core.exportView;
exports.exportComponent = _core.exportComponent;
exports.EmptyModuleHandlers = _core.EmptyModuleHandlers;

var _route = require("@elux/route");

exports.BaseModuleHandlers = _route.ModuleWithRouteHandlers;
exports.RouteActionTypes = _route.RouteActionTypes;
exports.createRouteModule = _route.createRouteModule;
var appMeta = {
  router: null,
  SSRTPL: _core.env.isServer ? _core.env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};
var appConfig = {
  loadComponent: null
};
exports.appConfig = appConfig;
var setAppConfig = (0, _core.buildConfigSetter)(appConfig);
exports.setAppConfig = setAppConfig;

function setUserConfig(conf) {
  (0, _core.setCoreConfig)(conf);
  (0, _route.setRouteConfig)(conf);
}

var EluxContextKey = '__EluxContext__';
exports.EluxContextKey = EluxContextKey;

function createBaseApp(ins, createRouter, render, moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  (0, _core.defineModuleGetter)(moduleGetter, appModuleName);
  var istoreMiddleware = [_route.routeMiddleware].concat(middlewares);
  var routeModule = (0, _core.getModule)('route');
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
              _ref2$id = _ref2.id,
              id = _ref2$id === void 0 ? 'root' : _ref2$id,
              _ref2$ssrKey = _ref2.ssrKey,
              ssrKey = _ref2$ssrKey === void 0 ? 'eluxInitStore' : _ref2$ssrKey,
              viewName = _ref2.viewName;

          var router = createRouter(routeModule.locationTransform);
          appMeta.router = router;

          var _ref3 = _core.env[ssrKey] || {},
              state = _ref3.state,
              _ref3$components = _ref3.components,
              components = _ref3$components === void 0 ? [] : _ref3$components;

          return router.initedPromise.then(function (routeState) {
            var initState = (0, _extends2.default)({}, storeOptions.initState, {
              route: routeState
            }, state);
            var baseStore = storeCreator((0, _extends2.default)({}, storeOptions, {
              initState: initState
            }));
            return (0, _core.renderApp)(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(function (_ref4) {
              var store = _ref4.store,
                  AppView = _ref4.AppView;
              routeModule.model(store);
              router.setStore(store);
              render(id, AppView, store, {
                deps: {},
                store: store,
                router: router,
                documentHead: ''
              }, !!_core.env[ssrKey]);
              return store;
            });
          });
        })
      });
    }
  };
}

function createBaseSSR(ins, createRouter, render, moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  (0, _core.defineModuleGetter)(moduleGetter, appModuleName);
  var istoreMiddleware = [_route.routeMiddleware].concat(middlewares);
  var routeModule = (0, _core.getModule)('route');
  return {
    useStore: function useStore(_ref5) {
      var storeOptions = _ref5.storeOptions,
          storeCreator = _ref5.storeCreator;
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
          var _ref6 = _temp2 === void 0 ? {} : _temp2,
              _ref6$id = _ref6.id,
              id = _ref6$id === void 0 ? 'root' : _ref6$id,
              _ref6$ssrKey = _ref6.ssrKey,
              ssrKey = _ref6$ssrKey === void 0 ? 'eluxInitStore' : _ref6$ssrKey,
              viewName = _ref6.viewName;

          var router = createRouter(routeModule.locationTransform);
          appMeta.router = router;
          return router.initedPromise.then(function (routeState) {
            var initState = (0, _extends2.default)({}, storeOptions.initState, {
              route: routeState
            });
            var baseStore = storeCreator((0, _extends2.default)({}, storeOptions, {
              initState: initState
            }));
            return (0, _core.ssrApp)(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(function (_ref7) {
              var store = _ref7.store,
                  AppView = _ref7.AppView;
              var state = store.getState();
              var eluxContext = {
                deps: {},
                store: store,
                router: router,
                documentHead: ''
              };
              var html = render(id, AppView, store, eluxContext);
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
        })
      });
    }
  };
}

function patchActions(typeName, json) {
  if (json) {
    (0, _core.getRootModuleAPI)(JSON.parse(json));
  }
}

function getApp() {
  var modules = (0, _core.getRootModuleAPI)();
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
    Pagenames: _route.routeMeta.pagenames
  };
}