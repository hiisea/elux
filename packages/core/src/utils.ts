import env from './env';

/**
 * 常用于取消监听
 *
 * @public
 */
export type UNListener = () => void;

export type Listener = () => void;

export function isPromise(data: any): data is Promise<any> {
  return typeof data === 'object' && typeof data.then === 'function';
}

export function toPromise<T>(resultOrPromise: Promise<T> | T): Promise<T> {
  if (isPromise(resultOrPromise)) {
    return resultOrPromise;
  }
  return Promise.resolve(resultOrPromise);
}

export function promiseCaseCallback<T, R>(resultOrPromise: Promise<T> | T, callback: (result: T) => Promise<R> | R): Promise<R> | R {
  if (isPromise(resultOrPromise)) {
    return resultOrPromise.then((result) => callback(result));
  }
  return callback(resultOrPromise);
}

export function buildConfigSetter<T extends Record<string, any>>(data: T): (config: Partial<T>) => void {
  return (config) =>
    Object.keys(data).forEach((key) => {
      config[key] !== undefined && ((data as any)[key] = config[key]);
    });
}

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
 * 多个PlainObject的深度Merge
 *
 * @remarks
 * 类似于 `Object.assin` 的深复制版本。
 *
 * - 除第一个参数target会被修改外，保证其它入参不会被修改。
 *
 * - 仅适应于Merge PlainObject
 *
 * - 对于array是直接替换而不merge
 *
 * @public
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

export class SingleDispatcher<T> {
  protected listenerId = 0;

  protected readonly listenerMap: Record<string, (data: T) => void> = {};

  addListener(callback: (data: T) => void): UNListener {
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

/**
 * Loading状态
 *
 * @public
 */
export type LoadingState = 'Start' | 'Stop' | 'Depth';

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
        this.dispatch('Start');
        this.ctimer = env.setTimeout(() => {
          this.ctimer = 0;
          if (this.list.length > 0) {
            this.dispatch('Depth');
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
        this.dispatch('Stop');
      }
    }
    return this;
  }
}
export function compose(...funcs: Function[]): Function {
  if (funcs.length === 0) {
    return (arg: any) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (a, b) =>
      (...args: any[]) =>
        a(b(...args))
  );
}

/**
 * 当前是否是Server运行环境
 *
 * @public
 */
export function isServer(): boolean {
  return env.isServer;
}
