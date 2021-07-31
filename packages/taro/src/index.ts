/// <reference path="../runtime/runtime.d.ts" />

import {env} from '@elux/core';
import {renderToMP} from '@elux/react-components/stage';
import {createBaseMP, CreateMP, LocationTransform} from '@elux/app';
import {createRouter} from '@elux/route-mp';
import {routeENV, tabPages} from './patch';

export const createMP: CreateMP = (moduleGetter, middlewares, appModuleName) => {
  if (env.__taroAppConfig.tabBar) {
    env.__taroAppConfig.tabBar.list.forEach(({pagePath}) => {
      tabPages[`/${pagePath.replace(/^\/+|\/+$/g, '')}`] = true;
    });
  }
  return createBaseMP(
    {},
    (locationTransform: LocationTransform) => createRouter(locationTransform, routeENV, tabPages),
    renderToMP,
    moduleGetter,
    middlewares,
    appModuleName
  );
};
