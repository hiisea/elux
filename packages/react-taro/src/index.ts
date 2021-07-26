/// <reference path="../runtime/runtime.d.ts" />
import {ComponentType} from 'react';
import {RootModuleFacade, env} from '@elux/core';
import {setReactComponentsConfig, loadComponent, LoadComponentOptions} from '@elux/react-components';
import {renderToMP} from '@elux/react-components/stage';
import {createBaseMP, setAppConfig, setUserConfig, CreateMP, LocationTransform, UserConfig, GetBaseAPP} from '@elux/app';
import {createRouter} from '@elux/route-mp';
import {routeENV, tabPages} from './patch';

export * from '@elux/react-components';
export * from '@elux/app';

setAppConfig({loadComponent});

export type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;

export function setConfig(
  conf: UserConfig & {LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}

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
