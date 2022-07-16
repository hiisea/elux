declare namespace Elux {
  interface ENV {
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
    console: typeof console;
    isServer: boolean;
    encodeBas64(str: string): string;
    decodeBas64(str: string): string;
    addEventListener(type: 'popstate', callback: (e: any) => void, options: boolean);
    removeEventListener(type: 'popstate', callback: (e: any) => void, options: boolean);
    document?: {
      title: string;
      getElementById(id: string): any;
    };
    location?: {
      pathname: string;
      search: string;
      hash: string;
    };
    history?: {
      go(n: number): void;
      pushState(data: any, title: string, url: string): void;
      replaceState(data: any, title: string, url: string): void;
    };
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: (options?: any) => {
        init(state: any): void;
        subscribe(action: any): void;
        send(action: {type: string; payload: any[]}, state: any): void;
      };
    };
    __VUE_DEVTOOLS_GLOBAL_HOOK__?: any;
    __taroAppConfig: {
      tabBar: {list: {pagePath: string}[]; items: {pagePath: string}[]};
    };
  }
  interface Component<TProps = {}> {
    (props: TProps): JSX.Element;
  }
}

declare interface ProcessEnv {
  TARO_ENV: 'weapp' | 'swan' | 'alipay' | 'h5' | 'rn' | 'tt' | 'quickapp' | 'qq' | 'jd';
  NODE_ENV: 'development' | 'production';
  PROJ_ENV: any;
}
declare interface Process {
  env: ProcessEnv;
}
declare const process: Process;

declare const require: (path: string) => any;
declare interface HTMLDivElement {
  className?: string;
}
