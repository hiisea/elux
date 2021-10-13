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
declare interface ProcessEnv {
  NODE_ENV: 'development' | 'production';
  PROJ_ENV: any;
}
declare interface Process {
  env: ProcessEnv;
}
declare const process: Process;

declare const require: (path: string) => any;
