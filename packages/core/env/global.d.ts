declare namespace EluxCore {
  interface SetTimeout {
    (callback: () => void, time: number): number;
  }
  interface ClearTimeout {
    (timer: number): void;
  }
  interface Console {
    log: (msg: string) => void;
    warn: (msg: string) => void;
    error: (error: any) => void;
  }
  interface ENV {
    isServer: boolean;
    setTimeout: SetTimeout;
    clearTimeout: ClearTimeout;
    console: Console;
  }
}
