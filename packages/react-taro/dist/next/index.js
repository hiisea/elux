import Taro from '@tarojs/taro';
import { defineModuleGetter } from '@elux/core';
import { setReactComponentsConfig, loadComponent, useRouter } from '@elux/react-components';
import { setAppConfig, setUserConfig, createBaseMP } from '@elux/app';
import { renderToMP } from '@elux/react-components/stage';
import { createRouter } from '@elux/route-mp';
import { taroHistory, getTabPages } from '@elux/taro';
export { DocumentHead, Switch, Else, Link, loadComponent } from '@elux/react-components';
export * from '@elux/app';
setAppConfig({
  loadComponent,
  useRouter
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
export const createMP = (moduleGetter, middlewares) => {
  defineModuleGetter(moduleGetter);
  const tabPages = getTabPages();
  const router = createRouter(taroHistory, tabPages);
  return createBaseMP({}, router, renderToMP, middlewares);
};