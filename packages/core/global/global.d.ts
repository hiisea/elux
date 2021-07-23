declare function setTimeout(callback: () => void, time: number): number;
declare function clearTimeout(timer: number): void;
declare const console: {
  log(msg: string): void;
  warn(msg: string): void;
  error(error: any): void;
};
