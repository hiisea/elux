"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault").default;

exports.__esModule = true;
exports.clientSide = exports.appConfig = exports.action = exports.RouteActionTypes = exports.LoadingState = exports.EmptyModuleHandlers = exports.BaseModuleHandlers = exports.ActionTypes = void 0;
exports.createBaseApp = createBaseApp;
exports.createBaseMP = createBaseMP;
exports.createBaseSSR = createBaseSSR;
exports.exportView = exports.exportModule = exports.exportComponent = exports.errorAction = exports.effect = exports.delayPromise = exports.deepMergeState = exports.deepMerge = exports.deepClone = exports.createRouteModule = void 0;
exports.getApp = getApp;
exports.mutation = exports.modelHotReplacement = exports.logger = exports.location = exports.isServer = exports.isProcessedError = void 0;
exports.patchActions = patchActions;
exports.setProcessedError = exports.setLoading = exports.setAppConfig = exports.serverSide = exports.safeJsonParse = exports.reducer = void 0;
exports.setUserConfig = setUserConfig;

var _extends4 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _core = require("@elux/core");

exports.env = _core.env;
exports.ActionTypes = _core.ActionTypes;
exports.LoadingState = _core.LoadingState;
exports.effect = _core.effect;
exports.errorAction = _core.errorAction;
exports.reducer = _core.reducer;
exports.action = _core.action;
exports.mutation = _core.mutation;
exports.setLoading = _core.setLoading;
exports.logger = _core.logger;
exports.isServer = _core.isServer;
exports.serverSide = _core.serverSide;
exports.clientSide = _core.clientSide;
exports.deepClone = _core.deepClone;
exports.deepMerge = _core.deepMerge;
exports.deepMergeState = _core.deepMergeState;
exports.exportModule = _core.exportModule;
exports.isProcessedError = _core.isProcessedError;
exports.setProcessedError = _core.setProcessedError;
exports.delayPromise = _core.delayPromise;
exports.exportView = _core.exportView;
exports.exportComponent = _core.exportComponent;
exports.modelHotReplacement = _core.modelHotReplacement;
exports.EmptyModuleHandlers = _core.EmptyModuleHandlers;
exports.BaseModuleHandlers = _core.CoreModuleHandlers;

var _route = require("@elux/route");

exports.RouteActionTypes = _route.RouteActionTypes;
exports.location = _route.location;
exports.createRouteModule = _route.createRouteModule;
exports.safeJsonParse = _route.safeJsonParse;
var appMeta = {
  router: null,
  SSRTPL: _core.env.isServer ? _core.env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};
var appConfig = {
  loadComponent: null,
  useRouter: null,
  useStore: null
};
exports.appConfig = appConfig;
var setAppConfig = (0, _core.buildConfigSetter)(appConfig);
exports.setAppConfig = setAppConfig;

function setUserConfig(conf) {
  (0, _core.setCoreConfig)(conf);
  (0, _route.setRouteConfig)(conf);

  if (conf.disableNativeRouter) {
    (0, _route.setRouteConfig)({
      notifyNativeRouter: {
        root: false,
        internal: false
      }
    });
  }
}

function createBaseMP(ins, router, render, middlewares) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  appMeta.router = router;
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
          var baseStore = storeCreator(storeOptions);

          var _initApp = (0, _core.initApp)(router, baseStore, middlewares),
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

function createBaseApp(ins, router, render, middlewares) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  appMeta.router = router;
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

          var _ref4 = _core.env[ssrKey] || {},
              state = _ref4.state,
              _ref4$components = _ref4.components,
              components = _ref4$components === void 0 ? [] : _ref4$components;

          return router.initialize.then(function (routeState) {
            var _extends2;

            storeOptions.initState = (0, _extends4.default)({}, storeOptions.initState, (_extends2 = {}, _extends2[_route.routeConfig.RouteModuleName] = routeState, _extends2), state);
            var baseStore = storeCreator(storeOptions);

            var _initApp2 = (0, _core.initApp)(router, baseStore, middlewares, viewName, components),
                store = _initApp2.store,
                AppView = _initApp2.AppView,
                setup = _initApp2.setup;

            return setup.then(function () {
              render(id, AppView, {
                deps: {},
                router: router,
                documentHead: ''
              }, !!_core.env[ssrKey], ins);
              return store;
            });
          });
        })
      });
    }
  };
}

function createBaseSSR(ins, router, render, middlewares) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  appMeta.router = router;
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

          return router.initialize.then(function (routeState) {
            var _extends3;

            storeOptions.initState = (0, _extends4.default)({}, storeOptions.initState, (_extends3 = {}, _extends3[_route.routeConfig.RouteModuleName] = routeState, _extends3));
            var baseStore = storeCreator(storeOptions);

            var _initApp3 = (0, _core.initApp)(router, baseStore, middlewares, viewName),
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
    useRouter: appConfig.useRouter,
    useStore: appConfig.useStore,
    GetRouter: function GetRouter() {
      if (_core.env.isServer) {
        throw 'Cannot use GetRouter() in the server side, please use getRouter() instead';
      }

      return appMeta.router;
    },
    LoadComponent: appConfig.loadComponent,
    Modules: modules,
    Pagenames: _route.routeMeta.pagenames
  };
}