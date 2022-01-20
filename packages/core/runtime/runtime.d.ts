declare namespace EluxRuntime {
  interface ENV {
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
    console: typeof console;
    isServer: boolean;
    encodeBas64(str: string): string;
    decodeBas64(str: string): string;
    __REDUX_DEVTOOLS_EXTENSION__?: {
      connect: (options?: any) => {
        init(state: any): void;
        subscribe(action: any): void;
        send(action: {type: string; payload: any[]}, state: any): void;
      };
    };
  }
}
declare interface ProcessEnv {
  NODE_ENV: 'development' | 'production';
  PROJ_ENV: any;
}
declare interface Process {
  env: ProcessEnv;
}
declare const process: Process;

declare const require: (path: string) => any;
