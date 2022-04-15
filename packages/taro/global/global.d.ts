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
