import {ComponentType} from 'react';
import Taro from '@tarojs/taro';
import {RootModuleFacade, defineModuleGetter} from '@elux/core';
import {setReactComponentsConfig, loadComponent, LoadComponentOptions, useRouter} from '@elux/react-components';
import {setAppConfig, setUserConfig, UserConfig, GetBaseAPP, createBaseMP, CreateMP} from '@elux/app';
import {renderToMP} from '@elux/react-components/stage';
import {createRouter} from '@elux/route-mp';
import {taroHistory, getTabPages} from '@elux/taro';
export {taroHistory} from '@elux/taro';
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
  defineModuleGetter(moduleGetter);
  const tabPages = getTabPages();
  const router = createRouter(taroHistory, tabPages);
  return createBaseMP({}, router, renderToMP, middlewares);
};
