declare namespace EluxRuntime {
  interface ENV {
    __taroAppConfig: {
      tabBar: {list: {pagePath: string}[]};
    };
  }
}
declare namespace Taro {
  let onUnhandledRejection: (callback: (error: {reason: any}) => void) => void;
}
