import _extends from "@babel/runtime/helpers/esm/extends";
import env from './env';
import React from 'react';
import { hydrate, render as _render } from 'react-dom';
import { routeMiddleware, setRouteConfig, routeConfig } from '@elux/route';
import { getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule } from '@elux/core';
import { createRouter } from '@elux/route-browser';
import { loadComponent, setLoadComponentOptions } from './loadComponent';
import { MetaData, EluxContext } from './sington';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export { default as DocumentHead } from './components/DocumentHead';
export { default as Else } from './components/Else';
export { default as Switch } from './components/Switch';
export { default as Link } from './components/Link';
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
      return {
        render: function render(_temp) {
          var _ref2 = _temp === void 0 ? {} : _temp,
              _ref2$id = _ref2.id,
              id = _ref2$id === void 0 ? 'root' : _ref2$id,
              _ref2$ssrKey = _ref2.ssrKey,
              ssrKey = _ref2$ssrKey === void 0 ? 'eluxInitStore' : _ref2$ssrKey,
              viewName = _ref2.viewName;

          var router = createRouter('Browser', routeModule.locationTransform);
          MetaData.router = router;
          var renderFun = env[ssrKey] ? hydrate : _render;

          var _ref3 = env[ssrKey] || {},
              state = _ref3.state,
              _ref3$components = _ref3.components,
              components = _ref3$components === void 0 ? [] : _ref3$components;

          var panel = env.document.getElementById(id);
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
              var RootView = AppView;
              routeModule.model(store);
              router.setStore(store);
              var eluxContext = {
                store: store,
                documentHead: ''
              };
              renderFun(React.createElement(EluxContext.Provider, {
                value: eluxContext
              }, React.createElement(RootView, {
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
              var RootView = AppView;
              var state = store.getState();
              var eluxContext = {
                deps: {},
                store: store,
                documentHead: ''
              };

              var html = require('react-dom/server').renderToString(React.createElement(EluxContext.Provider, {
                value: eluxContext
              }, React.createElement(RootView, {
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