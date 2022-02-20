export declare function buildConfigSetter<T extends Record<string, any>>(data: T): (config: Partial<T>) => void;
/**
 * 常用于取消监听
 *
 * @public
 */
export declare type UNListener = () => void;
export declare class SingleDispatcher<T> {
    protected listenerId: number;
    protected readonly listenerMap: Record<string, (data: T) => void>;
    addListener(callback: (data: T) => void): UNListener;
    dispatch(data: T): void;
}
export declare class MultipleDispatcher<T extends Record<string, any> = {}> {
    protected listenerId: number;
    protected listenerMap: {
        [N in keyof T]?: {
            [id: string]: (data: T[N]) => void | Promise<void>;
        };
    };
    addListener<N extends keyof T>(name: N, callback: (data: T[N]) => void | Promise<void>): UNListener;
    dispatch<N extends keyof T>(name: N, data: T[N]): void | Promise<void[]>;
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
export declare function deepMerge(target: {
    [key: string]: any;
}, ...args: any[]): any;
export declare function deepClone<T>(data: T): T;
export declare function isPromise(data: any): data is Promise<any>;
export declare function compose(...funcs: Function[]): Function;
/*** @public */
export declare type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};
//# sourceMappingURL=utils.d.ts.map