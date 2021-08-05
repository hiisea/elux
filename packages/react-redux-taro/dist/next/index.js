import { setReactComponentsConfig } from '@elux/react-taro';
import { Provider, useStore } from '@elux/react-redux';
import { setAppConfig } from '@elux/app';
setAppConfig({
  useStore: useStore
});
setReactComponentsConfig({
  Provider: Provider,
  useStore: useStore
});
export * from '@elux/react-redux';
export * from '@elux/react-taro';