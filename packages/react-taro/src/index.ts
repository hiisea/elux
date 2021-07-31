import {ComponentType} from 'react';
import Taro from '@tarojs/taro';
import {RootModuleFacade} from '@elux/core';
import {setReactComponentsConfig, loadComponent, LoadComponentOptions} from '@elux/react-components';
import {setAppConfig, setUserConfig, UserConfig, GetBaseAPP} from '@elux/app';

export * from '@elux/react-components';
export * from '@elux/app';
export {createMP} from '@elux/taro';

setAppConfig({loadComponent});

export type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;

export function setConfig(
  conf: UserConfig & {LoadComponentOnError?: ComponentType<{message: string}>; LoadComponentOnLoading?: ComponentType<{}>}
): void {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}

setReactComponentsConfig({setPageTitle: (title) => Taro.setNavigationBarTitle({title})});
