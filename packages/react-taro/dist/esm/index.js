import Taro from '@tarojs/taro';
import { setReactComponentsConfig, loadComponent } from '@elux/react-components';
import { setAppConfig, setUserConfig, createBaseMP } from '@elux/app';
import { renderToMP } from '@elux/react-components/stage';
import { createRouter } from '@elux/route-mp';
import { routeENV, getTabPages } from '@elux/taro';
export { routeENV } from '@elux/taro';
export * from '@elux/react-components';
export * from '@elux/app';
setAppConfig({
  loadComponent: loadComponent
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
export var createMP = function createMP(moduleGetter, middlewares, appModuleName) {
  var tabPages = getTabPages();
  return createBaseMP({}, function (locationTransform) {
    return createRouter(locationTransform, routeENV, tabPages);
  }, renderToMP, moduleGetter, middlewares, appModuleName);
};