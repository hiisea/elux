"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.setMeta = setMeta;
exports.setBaseConfig = setBaseConfig;
exports.createBaseApp = createBaseApp;
exports.createBaseSSR = createBaseSSR;
exports.patchActions = patchActions;
exports.getApp = getApp;
exports.EluxContextKey = exports.createRouteModule = exports.RouteActionTypes = exports.BaseModuleHandlers = exports.EmptyModuleHandlers = exports.exportComponent = exports.exportView = exports.delayPromise = exports.setProcessedError = exports.isProcessedError = exports.exportModule = exports.deepMergeState = exports.deepMerge = exports.clientSide = exports.serverSide = exports.isServer = exports.logger = exports.setLoading = exports.reducer = exports.errorAction = exports.effect = exports.LoadingState = exports.ActionTypes = void 0;

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

var _index = require("./index");

exports.BaseModuleHandlers = _index.ModuleWithRouteHandlers;
exports.RouteActionTypes = _index.RouteActionTypes;
exports.createRouteModule = _index.createRouteModule;
var MetaData = {
  SSRTPL: _core.env.isServer ? _core.env.decodeBas64('process.env.ELUX_ENV_SSRTPL') : ''
};

function setMeta(_ref) {
  var loadComponent = _ref.loadComponent,
      componentRender = _ref.componentRender,
      componentSSR = _ref.componentSSR,
      MutableData = _ref.MutableData,
      router = _ref.router,
      SSRTPL = _ref.SSRTPL;
  loadComponent !== undefined && (MetaData.loadComponent = loadComponent);
  componentRender !== undefined && (MetaData.componentRender = componentRender);
  componentSSR !== undefined && (MetaData.componentSSR = componentSSR);
  MutableData !== undefined && (0, _core.setConfig)({
    MutableData: MutableData
  });
  router !== undefined && (MetaData.router = router);
  SSRTPL !== undefined && (MetaData.SSRTPL = SSRTPL);
}

function setBaseConfig(conf) {
  (0, _core.setConfig)(conf);
  (0, _index.setRouteConfig)(conf);
  conf.LoadComponentOnError && (MetaData.LoadComponentOnError = conf.LoadComponentOnError);
  conf.LoadComponentOnLoading && (MetaData.LoadComponentOnLoading = conf.LoadComponentOnLoading);
}

var EluxContextKey = '__EluxContext__';
exports.EluxContextKey = EluxContextKey;

function createBaseApp(ins, createRouter, moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  (0, _core.defineModuleGetter)(moduleGetter, appModuleName);
  var istoreMiddleware = [_index.routeMiddleware].concat(middlewares);
  var routeModule = (0, _core.getModule)('route');
  return {
    useStore: function useStore(_ref2) {
      var storeOptions = _ref2.storeOptions,
          storeCreator = _ref2.storeCreator;
      return Object.assign(ins, {
        render: function render(_temp) {
          var _ref3 = _temp === void 0 ? {} : _temp,
              _ref3$id = _ref3.id,
              id = _ref3$id === void 0 ? 'root' : _ref3$id,
              _ref3$ssrKey = _ref3.ssrKey,
              ssrKey = _ref3$ssrKey === void 0 ? 'eluxInitStore' : _ref3$ssrKey,
              viewName = _ref3.viewName;

          var router = createRouter(routeModule.locationTransform);
          MetaData.router = router;

          var _ref4 = _core.env[ssrKey] || {},
              state = _ref4.state,
              _ref4$components = _ref4.components,
              components = _ref4$components === void 0 ? [] : _ref4$components;

          return router.initedPromise.then(function (routeState) {
            var initState = (0, _extends2.default)({}, storeOptions.initState, {
              route: routeState
            }, state);
            var baseStore = storeCreator((0, _extends2.default)({}, storeOptions, {
              initState: initState
            }));
            return (0, _core.renderApp)(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(function (_ref5) {
              var store = _ref5.store,
                  AppView = _ref5.AppView;
              routeModule.model(store);
              router.setStore(store);
              MetaData.componentRender(id, AppView, store, {
                store: store,
                documentHead: ''
              });
              return store;
            });
          });
        }
      });
    }
  };
}

function createBaseSSR(ins, createRouter, moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  (0, _core.defineModuleGetter)(moduleGetter, appModuleName);
  var istoreMiddleware = [_index.routeMiddleware].concat(middlewares);
  var routeModule = (0, _core.getModule)('route');
  return {
    useStore: function useStore(_ref6) {
      var storeOptions = _ref6.storeOptions,
          storeCreator = _ref6.storeCreator;
      return Object.assign(ins, {
        render: function render(_temp2) {
          var _ref7 = _temp2 === void 0 ? {} : _temp2,
              _ref7$id = _ref7.id,
              id = _ref7$id === void 0 ? 'root' : _ref7$id,
              _ref7$ssrKey = _ref7.ssrKey,
              ssrKey = _ref7$ssrKey === void 0 ? 'eluxInitStore' : _ref7$ssrKey,
              viewName = _ref7.viewName;

          var router = createRouter(routeModule.locationTransform);
          MetaData.router = router;
          return router.initedPromise.then(function (routeState) {
            var initState = (0, _extends2.default)({}, storeOptions.initState, {
              route: routeState
            });
            var baseStore = storeCreator((0, _extends2.default)({}, storeOptions, {
              initState: initState
            }));
            return (0, _core.ssrApp)(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(function (_ref8) {
              var store = _ref8.store,
                  AppView = _ref8.AppView;
              var state = store.getState();
              var eluxContext = {
                deps: {},
                store: store,
                documentHead: ''
              };
              var html = MetaData.componentSSR(id, AppView, store, eluxContext);
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
        }
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
      return MetaData.router;
    },
    LoadComponent: MetaData.loadComponent,
    Modules: modules,
    Pagenames: _index.routeConfig.pagenames
  };
}