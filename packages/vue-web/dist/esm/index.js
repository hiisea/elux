import _extends from "@babel/runtime/helpers/esm/extends";
import env from './env';
import { routeMiddleware, setRouteConfig, routeConfig } from '@elux/route';
import { getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule, exportView, exportComponent } from '@elux/core';
import { createRouter } from '@elux/route-browser';
import { createApp as createVue, createSSRApp, defineComponent as defineVueComponent, h } from 'vue';
import { loadComponent, setLoadComponentOptions } from './loadComponent';
import { MetaData, EluxContextKey } from './sington';
export { createVuex } from '@elux/core-vuex';
export { ActionTypes, LoadingState, env, effect, mutation, errorAction, reducer, action, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export { default as DocumentHead } from './components/DocumentHead';
export { default as Link } from './components/Link';
export var defineView = function defineView() {
  var view = defineVueComponent.apply(void 0, arguments);
  return exportView(view);
};
export var defineComponent = function defineComponent() {
  var view = defineVueComponent.apply(void 0, arguments);
  return exportComponent(view);
};
var SSRTPL;
export function setSsrHtmlTpl(tpl) {
  if (tpl) {
    SSRTPL = tpl;
  }
}
export function setConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadComponentOptions(conf);
}
setCoreConfig({
  MutableData: true
});
var StageView;

var RootComponent = function RootComponent(props, context) {
  return h(StageView, props, context.slots);
};

export function createApp(moduleGetter, middlewares, appModuleName) {
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
      var app = createVue(RootComponent);

      app.render = function (_temp) {
        var _ref2 = _temp === void 0 ? {} : _temp,
            _ref2$id = _ref2.id,
            id = _ref2$id === void 0 ? 'root' : _ref2$id,
            _ref2$ssrKey = _ref2.ssrKey,
            ssrKey = _ref2$ssrKey === void 0 ? 'eluxInitStore' : _ref2$ssrKey,
            viewName = _ref2.viewName;

        var router = createRouter('Browser', routeModule.locationTransform);
        MetaData.router = router;

        var _ref3 = env[ssrKey] || {},
            state = _ref3.state,
            _ref3$components = _ref3.components,
            components = _ref3$components === void 0 ? [] : _ref3$components;

        return router.initedPromise.then(function (routeState) {
          var initState = _extends({}, storeOptions.initState, {
            route: routeState
          }, state);

          var baseStore = storeCreator(_extends({}, storeOptions, {
            initState: initState
          }));
          return renderApp(baseStore, Object.keys(initState), components, istoreMiddleware, viewName).then(function (_ref4) {
            var store = _ref4.store,
                AppView = _ref4.AppView;
            StageView = AppView;
            routeModule.model(store);
            router.setStore(store);
            app.use(store);
            app.provide(EluxContextKey, {
              store: store,
              documentHead: ''
            });

            if (process.env.NODE_ENV === 'development' && env.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
              env.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app;
            }

            app.mount("#" + id);
            return store;
          });
        });
      };

      return app;
    }
  };
}
export function createSsrApp(moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  setSsrHtmlTpl('');
  defineModuleGetter(moduleGetter, appModuleName);
  var istoreMiddleware = [routeMiddleware].concat(middlewares);
  var routeModule = getModule('route');
  return {
    useStore: function useStore(_ref5) {
      var storeOptions = _ref5.storeOptions,
          storeCreator = _ref5.storeCreator;
      var app = createSSRApp(RootComponent);

      app.render = function (_temp2) {
        var _ref6 = _temp2 === void 0 ? {} : _temp2,
            _ref6$id = _ref6.id,
            id = _ref6$id === void 0 ? 'root' : _ref6$id,
            _ref6$ssrKey = _ref6.ssrKey,
            ssrKey = _ref6$ssrKey === void 0 ? 'eluxInitStore' : _ref6$ssrKey,
            _ref6$url = _ref6.url,
            url = _ref6$url === void 0 ? '/' : _ref6$url,
            viewName = _ref6.viewName;

        if (!SSRTPL) {
          SSRTPL = env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
        }

        var router = createRouter(url, routeModule.locationTransform);
        MetaData.router = router;
        return router.initedPromise.then(function (routeState) {
          var initState = _extends({}, storeOptions.initState, {
            route: routeState
          });

          var baseStore = storeCreator(_extends({}, storeOptions, {
            initState: initState
          }));
          return ssrApp(baseStore, Object.keys(routeState.params), istoreMiddleware, viewName).then(function (_ref7) {
            var store = _ref7.store,
                AppView = _ref7.AppView;
            StageView = AppView;
            var state = store.getState();
            var eluxContext = {
              deps: {},
              store: store,
              documentHead: ''
            };
            app.use(store);
            app.provide(EluxContextKey, eluxContext);

            var htmlPromise = require('@vue/server-renderer').renderToString(app);

            return htmlPromise.then(function (html) {
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
        });
      };

      return app;
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
    LoadComponent: loadComponent,
    Modules: modules,
    Pagenames: routeConfig.pagenames
  };
}