import Taro from '@tarojs/taro';
import { setReactComponentsConfig, loadComponent } from '@elux/react-components';
import { setAppConfig, setUserConfig } from '@elux/app';
export * from '@elux/react-components';
export * from '@elux/app';
export { createMP } from '@elux/taro';
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