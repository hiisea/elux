"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setSsrHtmlTpl = setSsrHtmlTpl;
exports.setConfig = setConfig;
exports.createApp = createApp;
exports.createSsrApp = createSsrApp;
exports.patchActions = patchActions;
exports.getApp = getApp;
exports.Link = exports.Switch = exports.Else = exports.DocumentHead = exports.createRouteModule = exports.RouteActionTypes = exports.BaseModuleHandlers = exports.EmptyModuleHandlers = exports.exportComponent = exports.exportView = exports.delayPromise = exports.setProcessedError = exports.isProcessedError = exports.exportModule = exports.deepMergeState = exports.deepMerge = exports.clientSide = exports.serverSide = exports.isServer = exports.logger = exports.setLoading = exports.reducer = exports.errorAction = exports.effect = exports.LoadingState = exports.ActionTypes = exports.createRedux = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _env = _interopRequireDefault(require("./env"));

exports.env = _env.default;

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _route = require("@elux/route");

exports.BaseModuleHandlers = _route.ModuleWithRouteHandlers;
exports.RouteActionTypes = _route.RouteActionTypes;
exports.createRouteModule = _route.createRouteModule;

var _core = require("@elux/core");

exports.ActionTypes = _core.ActionTypes;
exports.LoadingState = _core.LoadingState;
exports.env = _core.env;
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

var _routeBrowser = require("@elux/route-browser");

var _loadComponent = require("./loadComponent");

var _sington = require("./sington");

var _coreRedux = require("@elux/core-redux");

exports.createRedux = _coreRedux.createRedux;

var _DocumentHead = _interopRequireDefault(require("./components/DocumentHead"));

exports.DocumentHead = _DocumentHead.default;

var _Else = _interopRequireDefault(require("./components/Else"));

exports.Else = _Else.default;

var _Switch = _interopRequireDefault(require("./components/Switch"));

exports.Switch = _Switch.default;

var _Link = _interopRequireDefault(require("./components/Link"));

exports.Link = _Link.default;
var SSRTPL;

function setSsrHtmlTpl(tpl) {
  if (tpl) {
    SSRTPL = tpl;
  }
}

function setConfig(conf) {
  (0, _core.setConfig)(conf);
  (0, _route.setRouteConfig)(conf);
  (0, _loadComponent.setLoadComponentOptions)(conf);
}

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
              _ref2$id = _ref2.id,
              id = _ref2$id === void 0 ? 'root' : _ref2$id,
              _ref2$ssrKey = _ref2.ssrKey,
              ssrKey = _ref2$ssrKey === void 0 ? 'eluxInitStore' : _ref2$ssrKey,
              viewName = _ref2.viewName;

          var router = (0, _routeBrowser.createRouter)('Browser', routeModule.locationTransform);
          _sington.MetaData.router = router;
          var renderFun = _env.default[ssrKey] ? _reactDom.hydrate : _reactDom.render;

          var _ref3 = _env.default[ssrKey] || {},
              state = _ref3.state,
              _ref3$components = _ref3.components,
              components = _ref3$components === void 0 ? [] : _ref3$components;

          var panel = _env.default.document.getElementById(id);

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
              var RootView = AppView;
              routeModule.model(store);
              router.setStore(store);
              var eluxContext = {
                store: store,
                documentHead: ''
              };
              renderFun(_react.default.createElement(_sington.EluxContext.Provider, {
                value: eluxContext
              }, _react.default.createElement(RootView, {
                store: store
              })), panel);
              return store;
            });
          });
        }
      };
    }
  };
}

function createSsrApp(moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  setSsrHtmlTpl('');
  (0, _core.defineModuleGetter)(moduleGetter, appModuleName);
  var istoreMiddleware = [_route.routeMiddleware].concat(middlewares);
  var routeModule = (0, _core.getModule)('route');
  return {
    useStore: function useStore(_ref5) {
      var storeOptions = _ref5.storeOptions,
          storeCreator = _ref5.storeCreator;
      return {
        render: function render(_temp2) {
          var _ref6 = _temp2 === void 0 ? {} : _temp2,
              _ref6$id = _ref6.id,
              id = _ref6$id === void 0 ? 'root' : _ref6$id,
              _ref6$ssrKey = _ref6.ssrKey,
              ssrKey = _ref6$ssrKey === void 0 ? 'eluxInitStore' : _ref6$ssrKey,
              _ref6$url = _ref6.url,
              url = _ref6$url === void 0 ? '/' : _ref6$url,
              viewName = _ref6.viewName;

          if (!SSRTPL) {
            SSRTPL = _env.default.decodeBas64('process.env.ELUX_ENV_SSRTPL');
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
            return (0, _core.ssrApp)(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(function (_ref7) {
              var store = _ref7.store,
                  AppView = _ref7.AppView;
              var RootView = AppView;
              var state = store.getState();
              var eluxContext = {
                deps: {},
                store: store,
                documentHead: ''
              };

              var html = require('react-dom/server').renderToString(_react.default.createElement(_sington.EluxContext.Provider, {
                value: eluxContext
              }, _react.default.createElement(RootView, {
                store: store
              })));

              var match = SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + id + "['\"][^<>]*>", 'm'));

              if (match) {
                return SSRTPL.replace('</head>', "\r\n" + eluxContext.documentHead + "\r\n<script>window." + ssrKey + " = " + JSON.stringify({
                  state: state,
                  components: Object.keys(eluxContext.deps)
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