import {setReactComponentsConfig} from '@elux/react-web';
import {Provider, useStore} from '@elux/react-redux';
import {setAppConfig} from '@elux/app';
setAppConfig({useStore: useStore as any});
setReactComponentsConfig({Provider: Provider as any, useStore: useStore as any});
export * from '@elux/react-redux';
export * from '@elux/react-web';
