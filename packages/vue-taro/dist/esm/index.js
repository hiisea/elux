import Taro from '@tarojs/taro';
import { setVueComponentsConfig, loadComponent } from '@elux/vue-components';
import { setAppConfig, setUserConfig, createBaseMP } from '@elux/app';
import { routeENV, getTabPages } from '@elux/taro';
import { renderToMP } from '@elux/vue-components/stage';
import { createRouter } from '@elux/route-mp';
export * from '@elux/vue-components';
export * from '@elux/app';
setAppConfig({
  loadComponent: loadComponent
});
export function setConfig(conf) {
  setVueComponentsConfig(conf);
  setUserConfig(conf);
}
setVueComponentsConfig({
  setPageTitle: function setPageTitle(title) {
    return Taro.setNavigationBarTitle({
      title: title
    });
  }
});
export var createMP = function createMP(app, moduleGetter, middlewares, appModuleName) {
  var tabPages = getTabPages();
  return createBaseMP(app, function (locationTransform) {
    return createRouter(locationTransform, routeENV, tabPages);
  }, renderToMP, moduleGetter, middlewares, appModuleName);
};