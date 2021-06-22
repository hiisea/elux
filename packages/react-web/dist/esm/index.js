import _extends from "@babel/runtime/helpers/esm/extends";
import './env';
import React from 'react';
import { hydrate, render as _render } from 'react-dom';
import { routeMiddleware, setRouteConfig, routeConfig } from '@elux/route';
import { env, getRootModuleAPI, renderApp, ssrApp, defineModuleGetter, setConfig as setCoreConfig, getModule } from '@elux/core';
import { createRouter } from '@elux/route-browser';
import { loadView, setLoadViewOptions, DepsContext } from './loadView';
import { MetaData } from './sington';
export { ActionTypes, LoadingState, env, effect, errorAction, reducer, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, defineView } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export { connectRedux, createRedux, Provider } from '@elux/react-web-redux';
export { DocumentHead } from './components/DocumentHead';
export { Else } from './components/Else';
export { Switch } from './components/Switch';
export { Link } from './components/Link';
var SSRTPL;
export function setSsrHtmlTpl(tpl) {
  SSRTPL = tpl;
}
export function setConfig(conf) {
  setCoreConfig(conf);
  setRouteConfig(conf);
  setLoadViewOptions(conf);
}
export function createApp(moduleGetter, middlewares, appModuleName) {
  if (middlewares === void 0) {
    middlewares = [];
  }

  defineModuleGetter(moduleGetter, appModuleName);
  var istoreMiddleware = [routeMiddleware].concat(middlewares);

  var _ref = getModule('route'),
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

          var router = createRouter('Browser', locationTransform);
          MetaData.router = router;
          var renderFun = env[ssrKey] ? hydrate : _render;

          var _ref4 = env[ssrKey] || {},
              state = _ref4.state,
              _ref4$deps = _ref4.deps,
              deps = _ref4$deps === void 0 ? [] : _ref4$deps;

          var panel = env.document.getElementById(id);
          return router.initedPromise.then(function (routeState) {
            var initState = _extends({}, storeOptions.initState, {
              route: routeState
            }, state);

            var baseStore = storeCreator(_extends({}, storeOptions, {
              initState: initState
            }));
            return renderApp(baseStore, Object.keys(initState), deps, istoreMiddleware, viewName).then(function (_ref5) {
              var store = _ref5.store,
                  AppView = _ref5.AppView;
              router.setStore(store);
              renderFun(React.createElement(AppView, {
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
            SSRTPL = env.decodeBas64('process.env.ELUX_ENV_SSRTPL');
          }

          var router = createRouter(url, locationTransform);
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
              var state = store.getState();
              var deps = {};

              var html = require('react-dom/server').renderToString(React.createElement(DepsContext.Provider, {
                value: deps
              }, React.createElement(AppView, {
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
    LoadView: loadView,
    Modules: modules,
    Pagenames: routeConfig.pagenames
  };
}