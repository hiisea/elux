declare module '@tarojs/taro' {
  const setNavigationBarTitle: (options: {title: string}) => Promise<void>;
}
declare module '@tarojs/components' {
  import {ComponentType} from 'react';
  const View: ComponentType<{className: string}>;
}
