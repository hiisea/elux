import {ComponentType} from 'react';
import Taro from '@tarojs/taro';
import {RootModuleFacade} from '@elux/core';
import {setReactComponentsConfig, loadComponent, LoadComponentOptions, useRouter} from '@elux/react-components';
import {setAppConfig, setUserConfig, UserConfig, GetBaseAPP, createBaseMP, CreateMP, LocationTransform} from '@elux/app';
import {renderToMP} from '@elux/react-components/stage';
import {createRouter} from '@elux/route-mp';
import {routeENV, getTabPages} from '@elux/taro';
export {routeENV} from '@elux/taro';
export * from '@elux/react-components';
export * from '@elux/app';

setAppConfig({loadComponent, useRouter});

export type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;

export function setConfig(
  conf: UserConfig & {LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}

setReactComponentsConfig({setPageTitle: (title) => Taro.setNavigationBarTitle({title})});

export const createMP: CreateMP = (moduleGetter, middlewares) => {
  const tabPages = getTabPages();
  return createBaseMP(
    {},
    (locationTransform: LocationTransform) => createRouter(locationTransform, routeENV, tabPages),
    renderToMP,
    moduleGetter,
    middlewares
  );
};
