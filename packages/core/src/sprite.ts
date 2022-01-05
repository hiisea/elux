import env from './env';

/**
 * @internal
 */
export enum LoadingState {
  /**
   * 开始加载.
   */
  Start = 'Start',
  /**
   * 加载完成.
   */
  Stop = 'Stop',
  /**
   * 开始深度加载，对于加载时间超过setLoadingDepthTime设置值时将转为深度加载状态
   */
  Depth = 'Depth',
}

/**
 * @internal
 */
export class SingleDispatcher<T> {
  protected listenerId = 0;

  protected readonly listenerMap: Record<string, (data: T) => void> = {};

  addListener(callback: (data: T) => void): () => void {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(data: T): void {
    const listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach((id) => {
      listenerMap[id](data);
    });
  }
}

export class MultipleDispatcher<T extends Record<string, any> = {}> {
  protected listenerId = 0;

  protected listenerMap: {
    [N in keyof T]?: {[id: string]: (data: T[N]) => void | Promise<void>};
  } = {};

  addListener<N extends keyof T>(name: N, callback: (data: T[N]) => void | Promise<void>): () => void {
    this.listenerId++;
    const id = `${this.listenerId}`;
    if (!this.listenerMap[name]) {
      this.listenerMap[name] = {};
    }
    const listenerMap = this.listenerMap[name] as {
      [id: string]: (data: T[N]) => void;
    };
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch<N extends keyof T>(name: N, data: T[N]): void | Promise<void[]> {
    const listenerMap = this.listenerMap[name] as {
      [id: string]: (data: T[N]) => void | Promise<void>;
    };
    if (listenerMap) {
      let hasPromise = false;
      const arr = Object.keys(listenerMap).map((id) => {
        const result = listenerMap[id](data);
        if (!hasPromise && isPromise(result)) {
          hasPromise = true;
        }
        return result;
      });
      return hasPromise ? Promise.all(arr) : undefined;
    }
  }
}

/**
 * @internal
 */
export class TaskCounter extends SingleDispatcher<LoadingState> {
  public readonly list: {promise: Promise<any>; note: string}[] = [];

  private ctimer = 0;

  public constructor(public deferSecond: number) {
    super();
  }

  public addItem(promise: Promise<any>, note = ''): Promise<any> {
    if (!this.list.some((item) => item.promise === promise)) {
      this.list.push({promise, note});
      promise.finally(() => this.completeItem(promise));

      if (this.list.length === 1 && !this.ctimer) {
        this.dispatch(LoadingState.Start);
        this.ctimer = env.setTimeout(() => {
          this.ctimer = 0;
          if (this.list.length > 0) {
            this.dispatch(LoadingState.Depth);
          }
        }, this.deferSecond * 1000);
      }
    }
    return promise;
  }

  private completeItem(promise: Promise<any>): this {
    const i = this.list.findIndex((item) => item.promise === promise);
    if (i > -1) {
      this.list.splice(i, 1);
      if (this.list.length === 0) {
        if (this.ctimer) {
          env.clearTimeout.call(null, this.ctimer);
          this.ctimer = 0;
        }
        this.dispatch(LoadingState.Stop);
      }
    }
    return this;
  }
}

/**
 * @internal
 */
export function deepClone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function isObject(obj: any): Boolean {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize: boolean | null, target: {[key: string]: any}, inject: {[key: string]: any}[]) {
  Object.keys(inject).forEach(function (key) {
    const src = target[key];
    const val = inject[key];
    if (isObject(val)) {
      if (isObject(src)) {
        target[key] = __deepMerge(optimize, src, val);
      } else {
        target[key] = optimize ? val : __deepMerge(optimize, {}, val);
      }
    } else {
      target[key] = val;
    }
  });
  return target;
}

/**
 * @internal
 */
export function deepMerge(target: {[key: string]: any}, ...args: any[]): any {
  args = args.filter((item) => isObject(item) && Object.keys(item).length);
  if (args.length === 0) {
    return target;
  }
  if (!isObject(target)) {
    target = {};
  }
  args.forEach(function (inject, index) {
    let lastArg = false;
    let last2Arg: any = null;
    if (index === args.length - 1) {
      lastArg = true;
    } else if (index === args.length - 2) {
      last2Arg = args[index + 1];
    }
    Object.keys(inject).forEach(function (key) {
      const src = target[key];
      const val = inject[key];
      if (isObject(val)) {
        if (isObject(src)) {
          target[key] = __deepMerge(lastArg, src, val);
        } else {
          target[key] = lastArg || (last2Arg && !last2Arg[key]) ? val : __deepMerge(lastArg, {}, val);
        }
      } else {
        target[key] = val;
      }
    });
  });
  return target;
}

export function warn(str: string): void {
  if (process.env.NODE_ENV === 'development') {
    env.console.warn(str);
  }
}
export function isPromise(data: any): data is Promise<any> {
  return typeof data === 'object' && typeof data.then === 'function';
}

/**
 * @internal
 */
export function isServer(): boolean {
  return env.isServer;
}

/**
 * @internal
 */
export function serverSide<T>(callback: () => T): any {
  if (env.isServer) {
    return callback();
  }
  return undefined;
}

/**
 * @internal
 */
export function clientSide<T>(callback: () => T): any {
  if (!env.isServer) {
    return callback();
  }
  return undefined;
}

export function delayPromise(second: number) {
  return (target: any, key: string, descriptor: PropertyDescriptor): void => {
    if (!key && !descriptor) {
      key = target.key;
      descriptor = target.descriptor;
    }
    const fun = descriptor.value;
    descriptor.value = (...args: any[]) => {
      const delay = new Promise((resolve) => {
        env.setTimeout(() => {
          resolve(true);
        }, second * 1000);
      });
      return Promise.all([delay, fun.apply(target, args)]).then((items) => {
        return items[1];
      });
    };
  };
}
