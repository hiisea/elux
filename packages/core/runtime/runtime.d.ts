declare namespace EluxRuntime {
  interface ENV {
    setTimeout: typeof setTimeout;
    clearTimeout: typeof clearTimeout;
    console: typeof console;
    isServer: boolean;
    encodeBas64(str: string): string;
    decodeBas64(str: string): string;
  }
}
declare interface Process {
  env: {
    NODE_ENV: 'development' | 'production';
  };
}
declare const process: Process;

declare const require: (path: string) => any;
