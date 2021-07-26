import Taro from '@tarojs/taro';
import { env } from '@elux/core';
import { setReactComponentsConfig, loadComponent } from '@elux/react-components';
import { renderToMP } from '@elux/react-components/stage';
import { createBaseMP, setAppConfig, setUserConfig } from '@elux/app';
import { createRouter } from '@elux/route-mp';
import { routeENV, tabPages } from './patch';
export * from '@elux/react-components';
export * from '@elux/app';
setAppConfig({
  loadComponent
});
export function setConfig(conf) {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}
setReactComponentsConfig({
  setPageTitle: title => Taro.setNavigationBarTitle({
    title
  })
});
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