import {Component, App} from 'vue';
import Taro from '@tarojs/taro';
import {RootModuleFacade, setCoreConfig} from '@elux/core';
import {setVueComponentsConfig, loadComponent, LoadComponentOptions} from '@elux/vue-components';
import {setAppConfig, setUserConfig, UserConfig, GetBaseAPP, createBaseMP, AttachMP, LocationTransform} from '@elux/app';
import {taroHistory, getTabPages} from '@elux/taro';
import {renderToMP} from '@elux/vue-components/stage';
import {createRouter} from '@elux/route-mp';

export {taroHistory} from '@elux/taro';
export * from '@elux/vue-components';
export * from '@elux/app';
export {Page} from '@elux/vue-components/stage';

setCoreConfig({MutableData: true});
setAppConfig({loadComponent});

export type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;

export function setConfig(conf: UserConfig & {LoadComponentOnError?: Component<{message: string}>; LoadComponentOnLoading?: Component<{}>}): void {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}

setVueComponentsConfig({setPageTitle: (title) => Taro.setNavigationBarTitle({title})});

export const createMP: AttachMP<App> = (app, moduleGetter, middlewares) => {
  const tabPages = getTabPages();
  return createBaseMP(
    app,
    (locationTransform: LocationTransform) => createRouter(locationTransform, taroHistory, tabPages),
    renderToMP,
    moduleGetter,
    middlewares
  );
};
