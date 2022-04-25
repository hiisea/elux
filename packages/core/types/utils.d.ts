/**
 * 常用于取消监听
 *
 * @public
 */
export declare type UNListener = () => void;
export declare type Listener = () => void;
export declare function isPromise(data: any): data is Promise<any>;
export declare function toPromise<T>(resultOrPromise: Promise<T> | T): Promise<T>;
export declare function promiseCaseCallback<T, R>(resultOrPromise: Promise<T> | T, callback: (result: T) => Promise<R> | R): Promise<R> | R;
export declare function buildConfigSetter<T extends Record<string, any>>(data: T): (config: Partial<T>) => void;
export declare function deepClone<T>(data: T): T;
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
export declare class SingleDispatcher<T> {
    protected listenerId: number;
    protected readonly listenerMap: Record<string, (data: T) => void>;
    addListener(callback: (data: T) => void): UNListener;
    dispatch(data: T): void;
}
/**
 * 描述异步状态
 *
 * @public
 */
export declare type LoadingState = 'Start' | 'Stop' | 'Depth';
export declare class TaskCounter extends SingleDispatcher<LoadingState> {
    deferSecond: number;
    readonly list: {
        promise: Promise<any>;
        note: string;
    }[];
    private ctimer;
    constructor(deferSecond: number);
    addItem(promise: Promise<any>, note?: string): Promise<any>;
    private completeItem;
}
export declare function compose(...funcs: Function[]): Function;
/**
 * 当前是否是Server运行环境
 *
 * @public
 */
export declare function isServer(): boolean;
//# sourceMappingURL=utils.d.ts.map