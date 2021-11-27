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
  loadComponent: loadComponent,
  useRouter: useRouter
});
export function setConfig(conf) {
  setReactComponentsConfig(conf);
  setUserConfig(conf);
}
setReactComponentsConfig({
  setPageTitle: function setPageTitle(title) {
    return Taro.setNavigationBarTitle({
      title: title
    });
  }
});
export var createMP = function createMP(moduleGetter, middlewares) {
  defineModuleGetter(moduleGetter);
  var tabPages = getTabPages();
  var router = createRouter(taroHistory, tabPages);
  return createBaseMP({}, router, renderToMP, middlewares);
};