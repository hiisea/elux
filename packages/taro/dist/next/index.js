import { env } from '@elux/core';
import { renderToMP } from '@elux/react-components/stage';
import { createBaseMP } from '@elux/app';
import { createRouter } from '@elux/route-mp';
import { routeENV, tabPages } from './patch';
export const createMP = (moduleGetter, middlewares, appModuleName) => {
  if (env.__taroAppConfig.tabBar) {
    env.__taroAppConfig.tabBar.list.forEach(({
      pagePath
    }) => {
      tabPages[`/${pagePath.replace(/^\/+|\/+$/g, '')}`] = true;
    });
  }

  return createBaseMP({}, locationTransform => createRouter(locationTransform, routeENV, tabPages), renderToMP, moduleGetter, middlewares, appModuleName);
};