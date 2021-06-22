import {env} from './env';

/**
 * Loading状态，可通过effect注入，也可通过setLoading注入
 * 同一时段同一分组的多个loading状态会自动合并
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

export class SingleDispatcher<T> {
  protected listenerId: number = 0;

  protected readonly listenerMap: Record<string, (data: T) => void> = {};

  addListener(callback: (data: T) => void) {
    this.listenerId++;
    const id = `${this.listenerId}`;
    const listenerMap = this.listenerMap;
    listenerMap[id] = callback;
    return () => {
      delete listenerMap[id];
    };
  }

  dispatch(data: T) {
    const listenerMap = this.listenerMap;
    Object.keys(listenerMap).forEach((id) => {
      listenerMap[id](data);
    });
  }
}

export class MultipleDispatcher<T extends Record<string, any> = {}> {
  protected listenerId: number = 0;

  protected listenerMap: {
    [N in keyof T]?: {[id: string]: (data: T[N]) => void};
  } = {};

  addListener<N extends keyof T>(name: N, callback: (data: T[N]) => void) {
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

  dispatch<N extends keyof T>(name: N, data: T[N]) {
    const listenerMap = this.listenerMap[name] as {
      [id: string]: (data: T[N]) => void;
    };
    if (listenerMap) {
      Object.keys(listenerMap).forEach((id) => {
        listenerMap[id](data);
      });
    }
  }
}

export class TaskCounter extends SingleDispatcher<LoadingState> {
  public readonly list: {promise: Promise<any>; note: string}[] = [];

  private ctimer: number = 0;

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

export function isPlainObject(obj: any) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

function __deepMerge(optimize: boolean | null, target: {[key: string]: any}, inject: {[key: string]: any}[]) {
  Object.keys(inject).forEach(function (key) {
    const src = target[key];
    const val = inject[key];
    if (isPlainObject(val)) {
      if (isPlainObject(src)) {
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

export function deepMerge(target: {[key: string]: any}, ...args: any[]): any {
  if (!isPlainObject(target)) {
    target = {};
  }
  args = args.filter((item) => isPlainObject(item) && Object.keys(item).length);
  if (args.length < 1) {
    return target;
  }
  args.forEach(function (inject, index) {
    if (isPlainObject(inject)) {
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
        if (isPlainObject(val)) {
          if (isPlainObject(src)) {
            target[key] = __deepMerge(lastArg, src, val);
          } else {
            target[key] = lastArg || (last2Arg && !last2Arg[key]) ? val : __deepMerge(lastArg, {}, val);
          }
        } else {
          target[key] = val;
        }
      });
    }
  });
  return target;
}

declare const process: any;

export function warn(str: string) {
  if (process.env.NODE_ENV === 'development') {
    env.console.warn(str);
  }
}
export function isPromise(data: any): data is Promise<any> {
  return typeof data === 'object' && typeof data.then === 'function';
}
export function isServer(): boolean {
  return env.isServer;
}
export function serverSide<T>(callback: () => T) {
  if (env.isServer) {
    return callback();
  }
  return undefined;
}
export function clientSide<T>(callback: () => T) {
  if (!env.isServer) {
    return callback();
  }
  return undefined;
}
/**
 * 一个类方法的装饰器，将其延迟执行
 * - 可用来装饰effectHandler
 * - 也可以装饰其他类
 * @param second 延迟秒数
 */
export function delayPromise(second: number) {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
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
