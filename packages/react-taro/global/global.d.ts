declare module '@tarojs/taro' {
  const reLaunch: any;
  const redirectTo: any;
  const navigateTo: any;
  const navigateBack: any;
  const getCurrentPages: () => Array<{route: string; options?: {[key: string]: string}}>;
  const getLaunchOptionsSync: any;
  const switchTab: any;
  const setNavigationBarTitle: (options: {title: string}) => Promise<void>;
  let onUnhandledRejection: (callback: (e: {reason: any}) => void) => void;
  let onError: (callback: (e: any) => void) => void;
}
declare module '@tarojs/components' {
  import {ComponentType} from 'react';
  const View: ComponentType<{className: string}>;
}
declare const process: {
  env: {
    TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd';
    [key: string]: any;
  };
};
