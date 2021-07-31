import { env } from '@elux/core';
import { renderToMP } from '@elux/react-components/stage';
import { createBaseMP } from '@elux/app';
import { createRouter } from '@elux/route-mp';
import { routeENV, tabPages } from './patch';
export var createMP = function createMP(moduleGetter, middlewares, appModuleName) {
  if (env.__taroAppConfig.tabBar) {
    env.__taroAppConfig.tabBar.list.forEach(function (_ref) {
      var pagePath = _ref.pagePath;
      tabPages["/" + pagePath.replace(/^\/+|\/+$/g, '')] = true;
    });
  }

  return createBaseMP({}, function (locationTransform) {
    return createRouter(locationTransform, routeENV, tabPages);
  }, renderToMP, moduleGetter, middlewares, appModuleName);
};