import Taro from '@tarojs/taro';
import { setReactComponentsConfig, loadComponent } from '@elux/react-components';
import { setAppConfig, setUserConfig, createBaseMP } from '@elux/app';
import { renderToMP } from '@elux/react-components/stage';
import { createRouter } from '@elux/route-mp';
import { routeENV, getTabPages } from '@elux/taro';
export * from '@elux/react-components';
export * from '@elux/app';
export { Portal } from '@elux/react-components/stage';
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
  const tabPages = getTabPages();
  return createBaseMP({}, locationTransform => createRouter(locationTransform, routeENV, tabPages), renderToMP, moduleGetter, middlewares, appModuleName);
};