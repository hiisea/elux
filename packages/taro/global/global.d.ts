declare module '@tarojs/taro' {
  const reLaunch: any;
  const redirectTo: any;
  const navigateTo: any;
  const navigateBack: any;
  const switchTab: any;
  const getLaunchOptionsSync: any;
  const getCurrentPages: () => Array<{route: string; options?: {[key: string]: string}}>;
  const setNavigationBarTitle: (options: {title: string}) => Promise<void>;
}
