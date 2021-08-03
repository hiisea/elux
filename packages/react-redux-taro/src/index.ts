import {setReactComponentsConfig} from '@elux/react-taro';
import {Provider, useStore} from '@elux/react-redux';
setReactComponentsConfig({Provider: Provider as any, useStore: useStore as any});
export * from '@elux/react-redux';
export * from '@elux/react-taro';
