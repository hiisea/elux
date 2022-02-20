export function buildConfigSetter<T extends Record<string, any>>(data: T): (config: Partial<T>) => void {
  return (config) =>
    Object.keys(data).forEach((key) => {
      config[key] !== undefined && ((data as any)[key] = config[key]);
    });
}

/**
 * 常用于取消监听
 *
 * @public
 */
export type UNListener = () => void;

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

export class MultipleDispatcher<T extends Record<string, any> = {}> {
  protected listenerId = 0;

  protected listenerMap: {
    [N in keyof T]?: {[id: string]: (data: T[N]) => void | Promise<void>};
  } = {};

  addListener<N extends keyof T>(name: N, callback: (data: T[N]) => void | Promise<void>): UNListener {
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
 * - 除第一个参数 target 会被修改外，保证其它入参不会被修改。
 *
 * - 仅适应于 Merge PlainObject，且对于 array 是直接替换而不 merge
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

export function deepClone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function isPromise(data: any): data is Promise<any> {
  return typeof data === 'object' && typeof data.then === 'function';
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

/*** @public */
export type DeepPartial<T> = {[P in keyof T]?: DeepPartial<T[P]>};
