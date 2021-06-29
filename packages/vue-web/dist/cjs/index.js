"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setSsrHtmlTpl = setSsrHtmlTpl;
exports.setConfig = setConfig;
exports.createApp = createApp;
exports.patchActions = patchActions;
exports.getApp = getApp;
exports.defineView = exports.createRouteModule = exports.RouteActionTypes = exports.BaseModuleHandlers = exports.delayPromise = exports.setProcessedError = exports.isProcessedError = exports.exportModule = exports.deepMergeState = exports.deepMerge = exports.clientSide = exports.serverSide = exports.isServer = exports.logger = exports.setLoading = exports.action = exports.reducer = exports.errorAction = exports.mutation = exports.effect = exports.LoadingState = exports.ActionTypes = exports.createVuex = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

require("./env");

var _route = require("@elux/route");

exports.BaseModuleHandlers = _route.ModuleWithRouteHandlers;
exports.RouteActionTypes = _route.RouteActionTypes;
exports.createRouteModule = _route.createRouteModule;

var _core = require("@elux/core");

exports.env = _core.env;
exports.ActionTypes = _core.ActionTypes;
exports.LoadingState = _core.LoadingState;
exports.effect = _core.effect;
exports.mutation = _core.mutation;
exports.errorAction = _core.errorAction;
exports.reducer = _core.reducer;
exports.action = _core.action;
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

var _routeBrowser = require("@elux/route-browser");

var _vue = require("vue");

exports.defineComponent = _vue.defineComponent;

var _loadComponent = require("./loadComponent");

var _sington = require("./sington");

var _coreVuex = require("@elux/core-vuex");

exports.createVuex = _coreVuex.createVuex;

var defineView = function defineView() {
  var view = _vue.defineComponent.apply(void 0, arguments);

  return (0, _core.defineView)(view);
};

exports.defineView = defineView;
var SSRTPL;

function setSsrHtmlTpl(tpl) {
  SSRTPL = tpl;
}

function setConfig(conf) {
  (0, _core.setConfig)(conf);
  (0, _route.setRouteConfig)(conf);
  (0, _loadComponent.setLoadComponentOptions)(conf);
}

(0, _core.setConfig)({
  MutableData: true
});

function createApp(moduleGetter, middlewares, appModuleName) {
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
      return {
        render: function render(_temp) {
          var _ref2 = _temp === void 0 ? {} : _temp,
              _ref2$ssrKey = _ref2.ssrKey,
              ssrKey = _ref2$ssrKey === void 0 ? 'eluxInitStore' : _ref2$ssrKey,
              viewName = _ref2.viewName;

          var router = (0, _routeBrowser.createRouter)('Browser', routeModule.locationTransform);
          _sington.MetaData.router = router;

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
              var app = (0, _vue.createApp)(AppView).use(store);
              app.provide(_loadComponent.DepsContext, {
                deps: {},
                store: store
              });

              if (process.env.NODE_ENV === 'development' && _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
                _core.env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
              }

              return {
                store: store,
                app: app
              };
            });
          });
        },
        ssr: function ssr(_ref5) {
          var _ref5$id = _ref5.id,
              id = _ref5$id === void 0 ? 'root' : _ref5$id,
              _ref5$ssrKey = _ref5.ssrKey,
              ssrKey = _ref5$ssrKey === void 0 ? 'eluxInitStore' : _ref5$ssrKey,
              url = _ref5.url,
              viewName = _ref5.viewName;

          if (!SSRTPL) {
            SSRTPL = _core.env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
          }

          var router = (0, _routeBrowser.createRouter)(url, routeModule.locationTransform);
          _sington.MetaData.router = router;
          return router.initedPromise.then(function (routeState) {
            var initState = (0, _extends2.default)({}, storeOptions.initState, {
              route: routeState
            });
            var baseStore = storeCreator((0, _extends2.default)({}, storeOptions, {
              initState: initState
            }));
            return (0, _core.ssrApp)(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(function (_ref6) {
              var store = _ref6.store,
                  AppView = _ref6.AppView;
              var state = store.getState();
              var deps = {};
              var html = '';
              var match = SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + id + "['\"][^<>]*>", 'm'));

              if (match) {
                var pageHead = html.split(/<head>|<\/head>/, 3);
                html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
                return SSRTPL.replace('</head>', (pageHead[1] || '') + "\r\n<script>window." + ssrKey + " = " + JSON.stringify({
                  state: state,
                  components: Object.keys(deps)
                }) + ";</script>\r\n</head>").replace(match[0], match[0] + html);
              }

              return html;
            });
          });
        }
      };
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
      return _sington.MetaData.router;
    },
    LoadComponent: _loadComponent.loadComponent,
    Modules: modules,
    Pagenames: _route.routeConfig.pagenames
  };
}