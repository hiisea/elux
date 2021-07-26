import { setReactComponentsConfig } from '@elux/react-taro';
import { Provider } from '@elux/react-redux';
setReactComponentsConfig({
  Provider: Provider
});
export * from '@elux/react-redux';
export * from '@elux/react-taro';