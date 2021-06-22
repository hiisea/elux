"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setSsrHtmlTpl = setSsrHtmlTpl;
exports.setConfig = setConfig;
exports.createApp = createApp;
exports.patchActions = patchActions;
exports.getApp = getApp;
exports.Link = exports.Switch = exports.Else = exports.DocumentHead = exports.Provider = exports.createRedux = exports.connectRedux = exports.createRouteModule = exports.RouteActionTypes = exports.BaseModuleHandlers = exports.defineView = exports.delayPromise = exports.setProcessedError = exports.isProcessedError = exports.exportModule = exports.deepMergeState = exports.deepMerge = exports.clientSide = exports.serverSide = exports.isServer = exports.logger = exports.setLoading = exports.reducer = exports.errorAction = exports.effect = exports.LoadingState = exports.ActionTypes = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

require("./env");

var _react = _interopRequireDefault(require("react"));

var _reactDom = require("react-dom");

var _route = require("@elux/route");

exports.BaseModuleHandlers = _route.ModuleWithRouteHandlers;
exports.RouteActionTypes = _route.RouteActionTypes;
exports.createRouteModule = _route.createRouteModule;

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
exports.defineView = _core.defineView;

var _routeBrowser = require("@elux/route-browser");

var _loadView = require("./loadView");

var _sington = require("./sington");

var _reactWebRedux = require("@elux/react-web-redux");

exports.connectRedux = _reactWebRedux.connectRedux;
exports.createRedux = _reactWebRedux.createRedux;
exports.Provider = _reactWebRedux.Provider;

var _DocumentHead = require("./components/DocumentHead");

exports.DocumentHead = _DocumentHead.DocumentHead;

var _Else = require("./components/Else");

exports.Else = _Else.Else;

var _Switch = require("./components/Switch");

exports.Switch = _Switch.Switch;

var _Link = require("./components/Link");

exports.Link = _Link.Link;
var SSRTPL;

function setSsrHtmlTpl(tpl) {
  SSRTPL = tpl;
}

function setConfig(conf) {
  (0, _core.setConfig)(conf);
  (0, _route.setRouteConfig)(conf);
  (0, _loadView.setLoadViewOptions)(conf);
}

function createApp(moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  (0, _core.defineModuleGetter)(moduleGetter, appModuleName);
  var istoreMiddleware = [_route.routeMiddleware].concat(middlewares);

  var _ref = (0, _core.getModule)('route'),
      locationTransform = _ref.locationTransform;

  return {
    useStore: function useStore(_ref2) {
      var storeOptions = _ref2.storeOptions,
          storeCreator = _ref2.storeCreator;
      return {
        render: function render(_temp) {
          var _ref3 = _temp === void 0 ? {} : _temp,
              _ref3$id = _ref3.id,
              id = _ref3$id === void 0 ? 'root' : _ref3$id,
              _ref3$ssrKey = _ref3.ssrKey,
              ssrKey = _ref3$ssrKey === void 0 ? 'eluxInitStore' : _ref3$ssrKey,
              viewName = _ref3.viewName;

          var router = (0, _routeBrowser.createRouter)('Browser', locationTransform);
          _sington.MetaData.router = router;
          var renderFun = _core.env[ssrKey] ? _reactDom.hydrate : _reactDom.render;

          var _ref4 = _core.env[ssrKey] || {},
              state = _ref4.state,
              _ref4$deps = _ref4.deps,
              deps = _ref4$deps === void 0 ? [] : _ref4$deps;

          var panel = _core.env.document.getElementById(id);

          return router.initedPromise.then(function (routeState) {
            var initState = (0, _extends2.default)({}, storeOptions.initState, {
              route: routeState
            }, state);
            var baseStore = storeCreator((0, _extends2.default)({}, storeOptions, {
              initState: initState
            }));
            return (0, _core.renderApp)(baseStore, Object.keys(initState), deps, istoreMiddleware, viewName).then(function (_ref5) {
              var store = _ref5.store,
                  AppView = _ref5.AppView;
              router.setStore(store);
              renderFun(_react.default.createElement(AppView, {
                store: store
              }), panel);
              return store;
            });
          });
        },
        ssr: function ssr(_ref6) {
          var _ref6$id = _ref6.id,
              id = _ref6$id === void 0 ? 'root' : _ref6$id,
              _ref6$ssrKey = _ref6.ssrKey,
              ssrKey = _ref6$ssrKey === void 0 ? 'eluxInitStore' : _ref6$ssrKey,
              url = _ref6.url,
              viewName = _ref6.viewName;

          if (!SSRTPL) {
            SSRTPL = _core.env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
          }

          var router = (0, _routeBrowser.createRouter)(url, locationTransform);
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
              var state = store.getState();
              var deps = {};

              var html = require('react-dom/server').renderToString(_react.default.createElement(_loadView.DepsContext.Provider, {
                value: deps
              }, _react.default.createElement(AppView, {
                store: store
              })));

              var match = SSRTPL.match(new RegExp("<[^<>]+id=['\"]" + id + "['\"][^<>]*>", 'm'));

              if (match) {
                var pageHead = html.split(/<head>|<\/head>/, 3);
                html = pageHead.length === 3 ? pageHead[0] + pageHead[2] : html;
                return SSRTPL.replace('</head>', (pageHead[1] || '') + "\r\n<script>window." + ssrKey + " = " + JSON.stringify({
                  state: state,
                  deps: Object.keys(deps)
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
    LoadView: _loadView.loadView,
    Modules: modules,
    Pagenames: _route.routeConfig.pagenames
  };
}